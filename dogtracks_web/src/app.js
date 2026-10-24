/*
// -------------------------------------------------------------
// This top section is your old Firebase setup (currently unused)
// -------------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
  storageBucket: "dog-tracks-24243.firebasestorage.app",
  messagingSenderId: "405971058990",
  appId: "1:405971058990:web:fa19a1e4e69892663ababf",
  measurementId: "G-CVLKTJ3LTY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
*/

import { createDog, createSession, deleteDog, loadState, saveState } from './storage.js';

// Grab important DOM elements
const root = document.querySelector('#app');
const dogDialog = document.querySelector('#dog-dialog');
const dogForm = document.querySelector('#dog-form');

// App state variables
let state;
let selectedDogId;

// Escape HTML to prevent injection attacks
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

// Convert timestamps into readable dates
function relativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Show an error screen if something breaks
function showError(message) {
  root.innerHTML = `
    <section class="error-panel">
      <p class="eyebrow">NEEDS ATTENTION</p>
      <h1>DogTracks couldn't continue</h1>
      <p>${escapeHtml(message)}</p>
      <p>Refresh to try again. Your saved entries have not been silently replaced.</p>
    </section>`;
}

// Get the currently selected dog
function selectedDog() {
  return state.dogs.find((dog) => dog.id === selectedDogId) ?? state.dogs[0] ?? null;
}

// MAIN RENDER FUNCTION — builds the entire UI every time state changes
function render() {
  const dog = selectedDog();
  if (dog) selectedDogId = dog.id;

  // Filter sessions belonging to this dog
  const sessions = dog
    ? state.sessions
        .filter((session) => session.dogId === dog.id)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    : [];

  // Count stats
  const sessionCount = state.sessions.length;
  const recentCount = state.sessions.filter((session) =>
    Date.now() - new Date(session.occurredAt).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  // Build the entire HTML UI dynamically
  root.innerHTML = `
    <section class="welcome">
      <div>
        <p class="eyebrow">YOUR TRAINING JOURNAL</p>
        <h1>Small steps, stronger bonds.</h1>
        <p class="welcome-copy">A little consistency goes a long way. Here's your progress so far.</p>
      </div>
    </section>

    <section class="stats" aria-label="Training overview">
      <a href="dogs-overview.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">♧</span>
        <div><p class="stat-value">${state.dogs.length}</p><p class="stat-label">Dogs in your care</p></div>
      </a>


      <a href="training-log.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">✓</span>
        <div><p class="stat-value">${sessionCount}</p><p class="stat-label">Training entries</p></div>
      </a>


      <a href="analytics.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">↗</span>
        <div><p class="stat-value">${recentCount}</p><p class="stat-label">Entries this week</p></div>
      </a>

    </section>

    <section class="content-grid">
      <!-- DOG LIST PANEL -->
      <article class="panel" aria-labelledby="dogs-heading">
        <div class="panel-heading">
          <div>
            <h2 id="dogs-heading">Your dogs</h2>
            <p>Choose a profile to see its history</p>
          </div>
          <span class="count-badge">${state.dogs.length}</span>
        </div>

        ${
          state.dogs.length
            ? `<div class="dog-list">
                ${state.dogs.map((item) => `
                  <button class="dog-item" type="button"
                    data-select-dog="${escapeHtml(item.id)}"
                    aria-pressed="${dog?.id === item.id}">
                    <span class="dog-avatar" aria-hidden="true">
                      ${escapeHtml(item.name.slice(0, 1).toUpperCase())}
                    </span>
                    <span class="dog-summary">
                      <span class="dog-name">${escapeHtml(item.name)}</span>
                      <span class="dog-meta">
                        ${escapeHtml(item.breed || 'Breed not specified')} ·
                        ${escapeHtml(item.ageYears)} ${item.ageYears === 1 ? 'year' : 'years'} old
                      </span>
                    </span>
                    <span class="chevron" aria-hidden="true">›</span>
                  </button>
                `).join('')}
              </div>`
            : '<p class="empty-state">No dog profiles yet. Add your first dog to start a training journal.</p>'
        }
      </article>

      <!-- DOG DETAIL PANEL -->
      ${
        dog
          ? `
      <article class="panel detail-panel" aria-labelledby="selected-dog-name">
        <div class="detail-top">
          <span class="detail-avatar" aria-hidden="true">
            ${escapeHtml(dog.name.slice(0, 1).toUpperCase())}
          </span>
          <div class="detail-title">
            <h2 id="selected-dog-name">${escapeHtml(dog.name)}</h2>
            <p>${escapeHtml(dog.breed || 'Breed not specified')} · ${escapeHtml(dog.ageYears)} ${dog.ageYears === 1 ? 'year' : 'years'} old</p>
          </div>
          <button class="icon-button" type="button"
            data-delete-dog="${escapeHtml(dog.id)}"
            aria-label="Delete ${escapeHtml(dog.name)} profile"
            title="Delete profile">×</button>
        </div>

        ${dog.notes ? `<p class="profile-notes">${escapeHtml(dog.notes)}</p>` : ''}

        <!-- SESSION FORM -->
        <form class="session-form" id="session-form">
          <h3>Log a training entry</h3>
          <label>Behavior or activity
            <input name="behavior" required maxlength="100" placeholder="e.g. Calm greeting">
          </label>

          <div class="form-row">
            <label>Possible trigger
              <input name="trigger" maxlength="100" placeholder="Optional">
            </label>
            <label>Notes
              <input name="notes" maxlength="250" placeholder="What happened?">
            </label>
          </div>

          <button class="button button-primary" type="submit">
            Save entry <span aria-hidden="true">+</span>
          </button>
        </form>

        <!-- SESSION HISTORY -->
        <section class="history" aria-label="${escapeHtml(dog.name)} training history">
          <h3 class="history-heading">
            Recent activity <span>${sessions.length} ${sessions.length === 1 ? 'entry' : 'entries'}</span>
          </h3>

          ${
            sessions.length
              ? `<div class="session-list">
                  ${sessions.slice(0, 8).map((session) => `
                    <article class="session-item">
                      <span class="session-icon" aria-hidden="true">✓</span>
                      <div>
                        <p class="session-behavior">${escapeHtml(session.behavior)}</p>
                        <p class="session-context">
                          ${escapeHtml([session.trigger, session.notes].filter(Boolean).join(' · ') || 'No extra notes')}
                        </p>
                      </div>
                      <time class="session-date" datetime="${escapeHtml(session.occurredAt)}">
                        ${escapeHtml(relativeDate(session.occurredAt))}
                      </time>
                    </article>
                  `).join('')}
                </div>`
              : '<p class="empty-state">No training entries yet. Log the first one above.</p>'
          }
        </section>
      </article>`
          : `
      <article class="panel detail-panel empty-state">
        <h2>No dog selected</h2>
        <p>Add a dog profile to begin tracking training progress.</p>
      </article>`
      }
    </section>`;

  // Clicking a dog switches the selected dog
  root.querySelectorAll('[data-select-dog]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDogId = button.dataset.selectDog;
      render();
    });
  });

  // Handle session form submission
  root.querySelector('#session-form')?.addEventListener('submit', onSessionSubmit);

  // Handle dog deletion
  root.querySelector('[data-delete-dog]')?.addEventListener('click', onDeleteDog);
}

// Handle submitting a training session
function onSessionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;

  // Convert form fields into an object
  const values = Object.fromEntries(new FormData(form));

  try {
    // Create new session in state
    const nextState = createSession(state, { ...values, dogId: selectedDogId });

    // Save to local storage
    saveState(nextState);

    // Update state + UI
    state = nextState;
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

// Handle deleting a dog profile
function onDeleteDog() {
  const dog = selectedDog();
  if (!dog || !window.confirm(`Delete ${dog.name} and its training history? This cannot be undone.`)) return;

  try {
    const nextState = deleteDog(state, dog.id);
    saveState(nextState);
    state = nextState;

    // Select first dog if any remain
    selectedDogId = state.dogs[0]?.id;

    render();
  } catch (error) {
    showError(error.message);
  }
}

// DIALOG CONTROLS (open/close)
document.querySelector('#open-dog-dialog').addEventListener('click', () => dogDialog.showModal());

document.querySelectorAll('[data-close-dialog]').forEach((button) =>
  button.addEventListener('click', () => dogDialog.close())
);

// Close dialog when clicking outside the card
dogDialog.addEventListener('click', (event) => {
  if (event.target === dogDialog) dogDialog.close();
});

// Handle adding a new dog
dogForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Convert form fields into an object
  const values = Object.fromEntries(new FormData(dogForm));

  try {
    const nextState = createDog(state, values);
    saveState(nextState);
    state = nextState;

    // Select the newly added dog
    selectedDogId = state.dogs.at(-1).id;

    dogForm.reset();
    dogDialog.close();
    render();
  } catch (error) {
    window.alert(error.message);
  }
});

// INITIAL LOAD — load saved state from local storage
try {
  state = loadState();
  render();
} catch (error) {
  showError(error.message);
}
