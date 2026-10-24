// -------------------------------------------------------------
// FIREBASE MODULE IMPORTS
// -------------------------------------------------------------
// Import core Firebase initialization helper from official CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Import Firestore database instance and real-time query listener from official CDN.
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import storage helpers, formatters, and calculation functions from the sibling storage.js file in src/.
import { 
  createDog, 
  createSession, 
  deleteDog, 
  calculateAgeYears,
  extractId 
} from "./storage.js";

// -------------------------------------------------------------
// FIREBASE CONFIGURATION & INITIALIZATION
// -------------------------------------------------------------
// Project configuration credentials.
const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
  storageBucket: "dog-tracks-24243.firebasestorage.app",
  messagingSenderId: "405971058990",
  appId: "1:405971058990:web:fa19a1e4e69892663ababf",
  measurementId: "G-CVLKTJ3LTY"
};

// Initialize Firebase App.
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore database.
const db = getFirestore(app);

// -------------------------------------------------------------
// TEMPORARY ADMIN CONFIGURATION
// -------------------------------------------------------------
// Displays raw database inspector and sample seeding button.
const ADMIN_MODE = true;

// -------------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------------
// Root container where application components are rendered.
const root = document.querySelector('#app');

// Modal dialog used to capture new dog profiles.
const dogDialog = document.querySelector('#dog-dialog');

// Form contained within the modal dialog.
const dogForm = document.querySelector('#dog-form');

// Trigger button used to open the modal dialog.
const openDogDialogBtn = document.querySelector('#open-dog-dialog');

// Buttons configured to dismiss the modal dialog.
const closeDialogButtons = document.querySelectorAll('[data-close-dialog]');

// -------------------------------------------------------------
// IN-MEMORY APPLICATION STATE
// -------------------------------------------------------------
// Real-time state cache synced directly from Firestore snapshot listeners.
let state = {
  dogs: [],
  sessions: []
};

// ID of the dog currently active in the viewer.
let selectedDogId = null;

// -------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------
// Sanitize arbitrary text to prevent Cross-Site Scripting (XSS).
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

// Convert timestamps and dates into localized, human-readable strings.
function relativeDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Find and return the currently selected dog entity from state.
function selectedDog() {
  return state.dogs.find((d) => d.id === selectedDogId) ?? state.dogs[0] ?? null;
}

// Render an error panel if database or execution errors occur.
function showError(message) {
  if (!root) return;
  root.innerHTML = `
    <section class="error-panel">
      <p class="eyebrow">FIREBASE ERROR</p>
      <h1>DogTracks couldn't connect</h1>
      <p><strong>Details:</strong> ${escapeHtml(message)}</p>
      <p>If this mentions <em>insufficient permissions</em>, open your <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a> &gt; <strong>Firestore Database</strong> &gt; <strong>Rules</strong> and allow read and write access for development.</p>
    </section>`;
}

// -------------------------------------------------------------
// TEMPORARY ADMIN PANEL BUILDER
// -------------------------------------------------------------
// Generates an administrative inspector view showing all raw documents in the database.
function buildAdminPanel() {
  if (!ADMIN_MODE) return '';

  return `
    <section class="panel" style="margin-bottom: 24px; border: 2px dashed #b77a34; background: #fffcf8; padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <span style="background: #b77a34; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">TEMPORARY ADMIN</span>
          <strong style="margin-left: 8px; font-size: 13px;">Raw Firestore Inspection Mode</strong>
        </div>
        <div>
          <button type="button" id="admin-seed-btn" class="button button-quiet" style="font-size: 11px; min-height: 28px; padding: 0 10px;">
            + Inject Test Dog &amp; Session
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 11px;">
        <!-- ALL DOGS IN FIRESTORE -->
        <div style="background: white; border: 1px solid #e8eae4; border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
          <strong>All Dogs in Firestore (${state.dogs.length})</strong>
          ${
            state.dogs.length === 0
              ? '<p style="color: #728078; margin-top: 6px;">No documents in the "Dogs" collection.</p>'
              : `<pre style="margin-top: 6px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(JSON.stringify(state.dogs, null, 2))}</pre>`
          }
        </div>

        <!-- ALL SESSIONS IN FIRESTORE -->
        <div style="background: white; border: 1px solid #e8eae4; border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
          <strong>All Sessions in Firestore (${state.sessions.length})</strong>
          ${
            state.sessions.length === 0
              ? '<p style="color: #728078; margin-top: 6px;">No documents in the "Sessions" collection.</p>'
              : `<pre style="margin-top: 6px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(JSON.stringify(state.sessions, null, 2))}</pre>`
          }
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// MAIN RENDER FUNCTION
// -------------------------------------------------------------
// Builds the whole dynamic UI based on current state.
function render() {
  if (!root) return;

  // Identify active dog.
  const dog = selectedDog();

  // Maintain active dog selection.
  selectedDogId = dog ? dog.id : null;

  // Filter sessions matching active dog and sort descending by time.
  const sessions = dog
    ? state.sessions
        .filter((session) => extractId(session.DogId) === dog.id)
        .sort((a, b) => {
          const timeA = a.OccurredAt?.toMillis ? a.OccurredAt.toMillis() : new Date(a.OccurredAt).getTime();
          const timeB = b.OccurredAt?.toMillis ? b.OccurredAt.toMillis() : new Date(b.OccurredAt).getTime();
          return timeB - timeA;
        })
    : [];

  // Summary counts.
  const sessionCount = sessions.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = sessions.filter((s) => {
    const time = s.OccurredAt?.toMillis ? s.OccurredAt.toMillis() : new Date(s.OccurredAt).getTime();
    return time >= sevenDaysAgo;
  }).length;

  // Dynamically compute active dog's age from birthdate.
  const activeDogAge = dog ? calculateAgeYears(dog.DateOfBirth) : 0;

  // Inject markup.
  root.innerHTML = `
    <!-- TEMPORARY ADMIN INSPECTION BAR -->
    ${buildAdminPanel()}

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
<<<<<<< Updated upstream
        <div><p class="stat-value">${state.dogs.length}</p><p class="stat-label">Dogs in your care</p></div>
      </a>
=======
        <div>
          <p class="stat-value">${state.dogs.length}</p>
          <p class="stat-label">Dogs in your care</p>
        </div>
      </article>
>>>>>>> Stashed changes


      <a href="training-log.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">✓</span>
<<<<<<< Updated upstream
        <div><p class="stat-value">${sessionCount}</p><p class="stat-label">Training entries</p></div>
      </a>
=======
        <div>
          <p class="stat-value">${sessionCount}</p>
          <p class="stat-label">Training entries</p>
        </div>
      </article>
>>>>>>> Stashed changes


      <a href="analytics.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">↗</span>
<<<<<<< Updated upstream
        <div><p class="stat-value">${recentCount}</p><p class="stat-label">Entries this week</p></div>
      </a>

=======
        <div>
          <p class="stat-value">${recentCount}</p>
          <p class="stat-label">Entries this week</p>
        </div>
      </article>
>>>>>>> Stashed changes
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
                ${state.dogs
                  .map((item) => {
                    const itemAge = calculateAgeYears(item.DateOfBirth);
                    const initial = (item.Name ? item.Name.charAt(0) : '?').toUpperCase();
                    return `
                      <button class="dog-item" type="button"
                        data-select-dog="${escapeHtml(item.id)}"
                        aria-pressed="${dog?.id === item.id}">
                        <span class="dog-avatar" aria-hidden="true">${escapeHtml(initial)}</span>
                        <span class="dog-summary">
                          <span class="dog-name">${escapeHtml(item.Name || 'Unnamed')}</span>
                          <span class="dog-meta">
                            ${escapeHtml(item.Breed || 'Breed not specified')} ·
                            ${itemAge} ${itemAge === 1 ? 'year' : 'years'} old
                          </span>
                        </span>
                        <span class="chevron" aria-hidden="true">›</span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>`
            : '<p class="empty-state">No dog profiles yet. Click "+ Add Dog" above to create your first profile.</p>'
        }
      </article>

      <!-- DOG DETAIL PANEL -->
      ${
        dog
          ? `
      <article class="panel detail-panel" aria-labelledby="selected-dog-name">
        <div class="detail-top">
          <span class="detail-avatar" aria-hidden="true">
            ${escapeHtml((dog.Name ? dog.Name.charAt(0) : '?').toUpperCase())}
          </span>
          <div class="detail-title">
            <h2 id="selected-dog-name">${escapeHtml(dog.Name || 'Unnamed')}</h2>
            <p>${escapeHtml(dog.Breed || 'Breed not specified')} · ${activeDogAge} ${activeDogAge === 1 ? 'year' : 'years'} old</p>
          </div>
          <button class="icon-button" type="button"
            data-delete-dog="${escapeHtml(dog.id)}"
            aria-label="Delete ${escapeHtml(dog.Name)} profile"
            title="Delete profile">×</button>
        </div>

        ${dog.Notes ? `<p class="profile-notes">${escapeHtml(dog.Notes)}</p>` : ''}

        <!-- SESSION FORM -->
        <form class="session-form" id="session-form">
          <h3>Log a training entry</h3>
          <label>Behavior or activity
            <input name="Behavior" required maxlength="100" placeholder="e.g. Calm greeting">
          </label>

          <div class="form-row">
            <label>Possible trigger
              <input name="Trigger" maxlength="100" placeholder="Optional">
            </label>
            <label>Notes
              <input name="Notes" maxlength="250" placeholder="What happened?">
            </label>
          </div>

          <button class="button button-primary" type="submit">
            Save entry <span aria-hidden="true">+</span>
          </button>
        </form>

        <!-- SESSION HISTORY -->
        <section class="history" aria-label="${escapeHtml(dog.Name)} training history">
          <h3 class="history-heading">
            Recent activity <span>${sessions.length} ${sessions.length === 1 ? 'entry' : 'entries'}</span>
          </h3>

          ${
            sessions.length
              ? `<div class="session-list">
                  ${sessions
                    .slice(0, 8)
                    .map(
                      (session) => `
                    <article class="session-item">
                      <span class="session-icon" aria-hidden="true">✓</span>
                      <div>
                        <p class="session-behavior">${escapeHtml(session.Behavior)}</p>
                        <p class="session-context">
                          ${escapeHtml([session.Trigger, session.Notes].filter(Boolean).join(' · ') || 'No extra notes')}
                        </p>
                      </div>
                      <time class="session-date">
                        ${escapeHtml(relativeDate(session.OccurredAt))}
                      </time>
                    </article>
                  `
                    )
                    .join('')}
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
    </section>
  `;

  // -------------------------------------------------------------
  // RE-BIND DYNAMIC DOM LISTENERS
  // -------------------------------------------------------------
  // Bind click handlers to switch selected dogs.
  root.querySelectorAll('[data-select-dog]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDogId = button.dataset.selectDog;
      render();
    });
  });

  // Bind session form submit handler.
  root.querySelector('#session-form')?.addEventListener('submit', onSessionSubmit);

  // Bind delete dog button.
  root.querySelector('[data-delete-dog]')?.addEventListener('click', onDeleteDog);

  // Bind admin injection button.
  root.querySelector('#admin-seed-btn')?.addEventListener('click', injectTestData);
}

// -------------------------------------------------------------
// FORM ACTIONS & FIRESTORE CALLS
// -------------------------------------------------------------
// Submits a new session for the active dog.
async function onSessionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));

  if (!selectedDogId) {
    window.alert("Please select a dog before logging a training entry.");
    return;
  }

  try {
    // Write entry to Firestore via createSession helper.
    await createSession(db, {
      ...values,
      DogId: selectedDogId
    });

    // Reset form inputs.
    form.reset();
  } catch (error) {
    console.error("Failed to add session:", error);
    window.alert(`Could not save entry: ${error.message}`);
  }
}

// Deletes the active dog and triggers cascade cleanup.
async function onDeleteDog() {
  const dog = selectedDog();
  if (!dog || !window.confirm(`Delete ${dog.Name} and its training history? This cannot be undone.`)) {
    return;
  }

  try {
    // Delete profile and cascade-delete sessions via deleteDog helper.
    await deleteDog(db, dog.id);

    // Reset selection if active dog was removed.
    if (selectedDogId === dog.id) {
      selectedDogId = null;
    }
  } catch (error) {
    console.error("Failed to delete dog:", error);
    showError(error.message);
  }
}

// Helper to inject a test dog profile and session to verify database connectivity.
async function injectTestData() {
  try {
    // Generate an approximate birth date 2 years ago.
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // 1. Create a sample dog.
    const dogDocRef = await createDog(db, {
      Name: "Bailey (Test)",
      Breed: "Golden Retriever",
      DateOfBirth: twoYearsAgo.toISOString().split('T')[0],
      Notes: "Injected via Temporary Admin Panel"
    });

    // 2. Create a sample session linked to that dog.
    await createSession(db, {
      DogId: dogDocRef.id,
      Behavior: "Loose-leash walking",
      Trigger: "Passing another dog",
      Notes: "Remained attentive with positive reinforcement.",
      OccurredAt: new Date().toISOString()
    });

    // Notify user.
    window.alert("Sample test record successfully created in Firestore!");
  } catch (error) {
    console.error("Admin injection failed:", error);
    window.alert(`Failed to write to Firestore: ${error.message}`);
  }
}

// -------------------------------------------------------------
// STATIC LISTENERS (Modal & Dialog)
// -------------------------------------------------------------
// Open modal dialog.
openDogDialogBtn?.addEventListener('click', () => {
  dogDialog?.showModal();
});

// Close dialog via close/cancel buttons.
closeDialogButtons.forEach((btn) => {
  btn.addEventListener('click', () => dogDialog?.close());
});

// Close dialog when backdrop is clicked.
dogDialog?.addEventListener('click', (event) => {
  if (event.target === dogDialog) dogDialog.close();
});

// Handle dog creation modal form submission.
dogForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(dogForm));

  try {
    // Write dog document to Firestore.
    const docRef = await createDog(db, {
      Name: values.Name,
      Breed: values.Breed,
      DateOfBirth: values.DateOfBirth,
      Notes: values.Notes
    });

    // Automatically focus on the newly created dog.
    selectedDogId = docRef.id;

    // Reset and dismiss dialog.
    dogForm.reset();
    dogDialog.close();
  } catch (error) {
    console.error("Failed to add dog:", error);
    window.alert(`Could not add dog: ${error.message}`);
  }
});

// -------------------------------------------------------------
// IMMEDIATE INITIAL RENDER (PREVENTS FREEZING ON LOADING TEXT)
// -------------------------------------------------------------
render();

// -------------------------------------------------------------
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// -------------------------------------------------------------
// Real-time listener for 'Dogs' collection.
onSnapshot(
  collection(db, "Dogs"),
  (snapshot) => {
    // Sync dogs collection into local state array.
    state.dogs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Default to the first dog profile if none is currently selected.
    if (!selectedDogId && state.dogs.length > 0) {
      selectedDogId = state.dogs[0].id;
    }

    render();
  },
  (error) => {
    console.error("Dogs listener failed:", error);
    showError(`Error accessing 'Dogs' collection: ${error.message} (Code: ${error.code})`);
  }
);

// Real-time listener for 'Sessions' collection.
onSnapshot(
  collection(db, "Sessions"),
  (snapshot) => {
    // Sync sessions collection into local state array.
    state.sessions = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    render();
  },
  (error) => {
    console.error("Sessions listener failed:", error);
    showError(`Error accessing 'Sessions' collection: ${error.message} (Code: ${error.code})`);
  }
);