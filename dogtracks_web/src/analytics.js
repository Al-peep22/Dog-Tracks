import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { loadState } from "./storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAILS = ["dogtracksadmin@dogtracks.com", "admin@dogtracks.com"];

function isAdmin(user) {
  return ADMIN_EMAILS.some(
    (email) => email.toLowerCase() === String(user?.email || "").trim().toLowerCase()
  );
}

// DOM references
const analyticsRoot = document.querySelector('#analytics-root');
const dashboardPanel = analyticsRoot.querySelector('.panel');
const dogToggleList = document.querySelector('#dog-toggle-list');
const timelineCanvas = document.querySelector('#timeline-chart');
const behaviorCanvas = document.querySelector('#behavior-chart');
const heatmapCanvas = document.querySelector('#heatmap-chart');

// Keep dashboard contents hidden until the active user is known.
dashboardPanel.hidden = true;
let state;

// ---------------------------------------------
// Basic color palette for dogs
// ---------------------------------------------
const baseColors = [
  '#ff6b6b',
  '#4dabf7',
  '#51cf66',
  '#fcc419',
  '#845ef7',
  '#f06595',
];

// ---------------------------------------------
// State
// ---------------------------------------------
let dogColors = new Map();
let dogVisibility = new Map();
let timelineChart;
let behaviorChart;
let heatmapChart;
let loadGeneration = 0;

// ---------------------------------------------
// Build dog toggle + color UI
// ---------------------------------------------
function renderDogControls() {
  dogToggleList.innerHTML = state.dogs.map((dog) => {
    const color = dogColors.get(dog.id);
    const visible = dogVisibility.get(dog.id);
    return `
      <div class="dog-toggle-item">
        <label>
          <input type="checkbox" data-dog-toggle="${dog.id}" ${visible ? 'checked' : ''}>
          <span class="dog-toggle-name">${dog.name}</span>
        </label>
        <input type="color" value="${color}" data-dog-color="${dog.id}">
      </div>
    `;
  }).join('');

  // Toggle visibility
  dogToggleList.querySelectorAll('[data-dog-toggle]').forEach((input) => {
    input.addEventListener('change', () => {
      dogVisibility.set(input.dataset.dogToggle, input.checked);
      updateCharts();
    });
  });

  // Change color
  dogToggleList.querySelectorAll('[data-dog-color]').forEach((input) => {
    input.addEventListener('input', () => {
      dogColors.set(input.dataset.dogColor, input.value);
      updateCharts();
    });
  });
}

// ---------------------------------------------
// Build timeline data model
// ---------------------------------------------
function buildTimelineData() {
  const byDateDog = new Map();

  state.sessions.forEach((session) => {
    const date = new Date(session.occurredAt);
    if (Number.isNaN(date.getTime())) return;

    const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!byDateDog.has(dayKey)) byDateDog.set(dayKey, new Map());

    const dogMap = byDateDog.get(dayKey);
    const count = dogMap.get(session.dogId) ?? 0;
    dogMap.set(session.dogId, count + 1);
  });

  const sortedDates = Array.from(byDateDog.keys()).sort();

  const datasets = state.dogs
    .filter((dog) => dogVisibility.get(dog.id))
    .map((dog) => {
      const color = dogColors.get(dog.id);
      const data = sortedDates.map((date) => {
        const dogMap = byDateDog.get(date);
        return dogMap?.get(dog.id) ?? 0;
      });
      return {
        label: dog.name,
        data,
        borderColor: color,
        backgroundColor: color + '33',
        tension: 0.3,
      };
    });

  return { labels: sortedDates, datasets };
}

// ---------------------------------------------
// Build behavior frequency data
// ---------------------------------------------
function buildBehaviorData() {
  const behaviorCounts = new Map();

  state.sessions.forEach((session) => {
    const behavior = session.behavior?.trim() || 'Unspecified';
    const count = behaviorCounts.get(behavior) ?? 0;
    behaviorCounts.set(behavior, count + 1);
  });

  const labels = Array.from(behaviorCounts.keys());
  const data = labels.map((label) => behaviorCounts.get(label));

  return { labels, data };
}

// ---------------------------------------------
// Build weekly activity heatmap data
// ---------------------------------------------
function buildHeatmapData() {
  const dayCounts = new Array(7).fill(0);

  state.sessions.forEach((session) => {
    const date = new Date(session.occurredAt);
    if (Number.isNaN(date.getTime())) return;
    const day = date.getDay();
    dayCounts[day] += 1;
  });

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { labels, data: dayCounts };
}

// ---------------------------------------------
// Create charts
// ---------------------------------------------
function createCharts() {
  const timelineData = buildTimelineData();
  const behaviorData = buildBehaviorData();
  const heatmapData = buildHeatmapData();

  timelineChart = new Chart(timelineCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: timelineData.labels,
      datasets: timelineData.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Training entries per day' },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Entries' }, beginAtZero: true },
      },
    },
  });

  behaviorChart = new Chart(behaviorCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: behaviorData.labels,
      datasets: [{
        label: 'Entries per behavior',
        data: behaviorData.data,
        backgroundColor: '#4dabf7',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Behavior frequency' },
      },
      scales: {
        x: { title: { display: true, text: 'Behavior' } },
        y: { title: { display: true, text: 'Entries' }, beginAtZero: true },
      },
    },
  });

  heatmapChart = new Chart(heatmapCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: heatmapData.labels,
      datasets: [{
        label: 'Entries per day of week',
        data: heatmapData.data,
        backgroundColor: '#51cf66',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Weekly activity' },
      },
      scales: {
        x: { title: { display: true, text: 'Day of week' } },
        y: { title: { display: true, text: 'Entries' }, beginAtZero: true },
      },
    },
  });
}

// ---------------------------------------------
// Update charts when dog visibility/colors change
// ---------------------------------------------
function updateCharts() {
  const timelineData = buildTimelineData();
  const behaviorData = buildBehaviorData();
  const heatmapData = buildHeatmapData();

  timelineChart.data.labels = timelineData.labels;
  timelineChart.data.datasets = timelineData.datasets;
  timelineChart.update();

  behaviorChart.data.labels = behaviorData.labels;
  behaviorChart.data.datasets[0].data = behaviorData.data;
  behaviorChart.update();

  heatmapChart.data.labels = heatmapData.labels;
  heatmapChart.data.datasets[0].data = heatmapData.data;
  heatmapChart.update();
}

// ---------------------------------------------
// Initial render
// ---------------------------------------------
function destroyCharts() {
  loadGeneration += 1;
  timelineChart?.destroy();
  behaviorChart?.destroy();
  heatmapChart?.destroy();
  timelineChart = undefined;
  behaviorChart = undefined;
  heatmapChart = undefined;
}

function showNotice(message, className = 'loading-state') {
  let notice = document.querySelector('#analytics-notice');
  if (!notice) {
    notice = document.createElement('p');
    notice.id = 'analytics-notice';
    analyticsRoot.prepend(notice);
  }
  notice.className = className;
  notice.textContent = message;
  dashboardPanel.hidden = true;
}

async function initializeAnalytics(user) {
  destroyCharts();
  const generation = loadGeneration;
  document.querySelector('#analytics-notice')?.remove();

  try {
    state = await loadState(db, { ownerId: user.uid, isAdmin: isAdmin(user) });
  } catch (error) {
    if (generation !== loadGeneration) return;
    console.error("Could not load analytics:", error);
    showNotice(`Could not load analytics: ${error.message}`, 'error-panel');
    return;
  }
  if (generation !== loadGeneration) return;

  dogColors = new Map();
  dogVisibility = new Map();
  state.dogs.forEach((dog, index) => {
    dogColors.set(dog.id, baseColors[index % baseColors.length]);
    dogVisibility.set(dog.id, true);
  });

  renderDogControls();
  createCharts();
  dashboardPanel.hidden = false;
}

onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    localStorage.removeItem('dogtracks_db_user');
    void initializeAnalytics(firebaseUser);
    return;
  }

  const savedUser = localStorage.getItem('dogtracks_db_user');
  if (savedUser) {
    try {
      const databaseUser = JSON.parse(savedUser);
      if (!databaseUser?.uid) throw new Error('Saved user is missing an ID.');
      void initializeAnalytics(databaseUser);
      return;
    } catch (error) {
      console.error("Could not restore the saved user:", error);
      localStorage.removeItem('dogtracks_db_user');
    }
  }

  destroyCharts();
  showNotice('Please sign in on the home page to view your analytics.');
});
