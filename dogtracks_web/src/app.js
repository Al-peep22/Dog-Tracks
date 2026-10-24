// -------------------------------------------------------------
// FIREBASE MODULE IMPORTS
// -------------------------------------------------------------
// Core Firebase initialization helper.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Firestore database functions and listeners.
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Authentication functions.
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Storage helpers from local module.
import { 
  createDog, 
  createSession, 
  deleteDog, 
  calculateAgeYears, 
  extractId 
} from "./storage.js";

// -------------------------------------------------------------
// FIREBASE INITIALIZATION
// -------------------------------------------------------------
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

// Initialize Firebase Authentication.
const auth = getAuth(app);

// -------------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------------
const root = document.querySelector('#app');
const dogDialog = document.querySelector('#dog-dialog');
const dogForm = document.querySelector('#dog-form');
const openDogDialogBtn = document.querySelector('#open-dog-dialog');
const closeDogDialogButtons = document.querySelectorAll('[data-close-dialog]');

// Admin login modal references.
const loginDialog = document.querySelector('#login-dialog');
const loginForm = document.querySelector('#login-form');
const authBtn = document.querySelector('#auth-btn');
const closeLoginButtons = document.querySelectorAll('[data-close-login]');

// -------------------------------------------------------------
// APPLICATION STATE
// -------------------------------------------------------------
let currentUser = null;
let unsubscribeDogs = null;
let unsubscribeSessions = null;

let state = {
  dogs: [],
  sessions: []
};

let selectedDogId = null;

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function relativeDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function selectedDog() {
  return state.dogs.find((d) => d.id === selectedDogId) ?? state.dogs[0] ?? null;
}

function showError(message) {
  if (!root) return;
  root.innerHTML = `
    <section class="error-panel">
      <p class="eyebrow">ACCESS DENIED / ERROR</p>
      <h1>DogTracks couldn't continue</h1>
      <p><strong>Details:</strong> ${escapeHtml(message)}</p>
    </section>`;
}

// -------------------------------------------------------------
// MAIN RENDER FUNCTION
// -------------------------------------------------------------
function render() {
  if (!root) return;

  // If user is not authenticated, show a clean locked gate screen.
  if (!currentUser) {
    root.innerHTML = `
      <section class="panel empty-state" style="margin-top: 40px; padding: 48px 24px;">
        <span class="brand-mark" style="margin: 0 auto 16px; width: 48px; height: 48px; font-size: 26px;">🔒</span>
        <h2 style="color: #253930; font-family: Georgia, serif; font-size: 26px; margin-bottom: 8px;">Admin Login Required</h2>
        <p style="color: var(--muted); max-width: 420px; margin: 0 auto 20px;">
          This database is protected. Please sign in with your administrator credentials to view and manage dog training records.
        </p>
        <button type="button" class="button button-primary" id="gate-login-btn">
          Open Admin Login
        </button>
      </section>
    `;
    document.querySelector('#gate-login-btn')?.addEventListener('click', () => loginDialog?.showModal());
    return;
  }

  // Active dog resolution.
  const dog = selectedDog();
  selectedDogId = dog ? dog.id : null;

  // Filter training sessions for this dog.
  const sessions = dog
    ? state.sessions
        .filter((session) => extractId(session.DogId) === dog.id)
        .sort((a, b) => {
          const timeA = a.OccurredAt?.toMillis ? a.OccurredAt.toMillis() : new Date(a.OccurredAt).getTime();
          const timeB = b.OccurredAt?.toMillis ? b.OccurredAt.toMillis() : new Date(b.OccurredAt).getTime();
          return timeB - timeA;
        })
    : [];

  const sessionCount = sessions.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = sessions.filter((s) => {
    const time = s.OccurredAt?.toMillis ? s.OccurredAt.toMillis() : new Date(s.OccurredAt).getTime();
    return time >= sevenDaysAgo;
  }).length;

  const activeDogAge = dog ? calculateAgeYears(dog.DateOfBirth) : 0;

  // Render authenticated dashboard.
  root.innerHTML = `
    <section class="welcome">
      <div>
        <p class="eyebrow">AUTHENTICATED AS: ${escapeHtml(currentUser.email)}</p>
        <h1>Small steps, stronger bonds.</h1>
        <p class="welcome-copy">Your secure training journal progress.</p>
      </div>
    </section>

    <section class="stats" aria-label="Training overview">
      <a href="dogs-overview.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">♧</span>
        <div>
          <p class="stat-value">${state.dogs.length}</p>
          <p class="stat-label">Dogs in your care</p>
        </div>
      </a>


      <a href="training-log.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">✓</span>
        <div>
          <p class="stat-value">${sessionCount}</p>
          <p class="stat-label">Training entries</p>
        </div>
      </a>


      <a href="analytics.html" class="stat-card">
        <span class="stat-icon" aria-hidden="true">↗</span>
        <div>
          <p class="stat-value">${recentCount}</p>
          <p class="stat-label">Entries this week</p>
        </div>
      </a>

    </section>

    <section class="content-grid">
      <!-- DOG LIST PANEL -->
      <article class="panel" aria-labelledby="dogs-heading">
        <div class="panel-heading">
          <div>
            <h2 id="dogs-heading">Your dogs</h2>
            <p>Choose a profile to see history</p>
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
            : '<p class="empty-state">No dog profiles yet. Click "+ Add Dog" above to create one.</p>'
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
            aria-label="Delete profile"
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
        <p>Add or select a dog to manage training logs.</p>
      </article>`
      }
    </section>
  `;

  // Dynamic handlers.
  root.querySelectorAll('[data-select-dog]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDogId = button.dataset.selectDog;
      render();
    });
  });

  root.querySelector('#session-form')?.addEventListener('submit', onSessionSubmit);
  root.querySelector('[data-delete-dog]')?.addEventListener('click', onDeleteDog);
}

// -------------------------------------------------------------
// FIRESTORE CRUD OPERATIONS
// -------------------------------------------------------------
async function onSessionSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));

  if (!selectedDogId) return;

  try {
    await createSession(db, {
      ...values,
      DogId: selectedDogId
    });
    form.reset();
  } catch (error) {
    window.alert(`Could not save session: ${error.message}`);
  }
}

async function onDeleteDog() {
  const dog = selectedDog();
  if (!dog || !window.confirm(`Delete ${dog.Name} and training entries?`)) return;

  try {
    await deleteDog(db, dog.id);
    if (selectedDogId === dog.id) selectedDogId = null;
  } catch (error) {
    showError(error.message);
  }
}

// -------------------------------------------------------------
// STATIC LISTENERS (Dialogs & Forms)
// -------------------------------------------------------------
// Open/close Add Dog dialog.
openDogDialogBtn?.addEventListener('click', () => dogDialog?.showModal());
closeDogDialogButtons.forEach((btn) => btn.addEventListener('click', () => dogDialog?.close()));

// Close dialog on outside backdrop click.
dogDialog?.addEventListener('click', (e) => { if (e.target === dogDialog) dogDialog.close(); });
loginDialog?.addEventListener('click', (e) => { if (e.target === loginDialog) loginDialog.close(); });
closeLoginButtons.forEach((btn) => btn.addEventListener('click', () => loginDialog?.close()));

// Handle new dog form.
dogForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(dogForm));

  try {
    const docRef = await createDog(db, {
      Name: values.Name,
      Breed: values.Breed,
      DateOfBirth: values.DateOfBirth,
      Notes: values.Notes
    });
    selectedDogId = docRef.id;
    dogForm.reset();
    dogDialog.close();
  } catch (error) {
    window.alert(`Could not add dog: ${error.message}`);
  }
});

// -------------------------------------------------------------
// AUTHENTICATION LOGIC (SIGN IN / SIGN OUT)
// -------------------------------------------------------------
// Toggle login modal or trigger logout.
authBtn?.addEventListener('click', async () => {
  if (currentUser) {
    await signOut(auth);
  } else {
    loginDialog?.showModal();
  }
});

// Handle Login Form Submission.
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
    loginDialog?.close();
  } catch (error) {
    window.alert(`Login failed: ${error.message}`);
  }
});

// -------------------------------------------------------------
// REAL-TIME AUTH STATE LISTENER
// -------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    // Update button text and show "+ Add Dog".
    authBtn.textContent = 'Log Out';
    openDogDialogBtn.style.display = 'inline-flex';

    // Start listening to Firestore once authenticated.
    subscribeToDatabase();
  } else {
    // Reset UI to logged out state.
    authBtn.textContent = 'Admin Login';
    openDogDialogBtn.style.display = 'none';

    // Detach Firestore listeners and empty cached state.
    if (unsubscribeDogs) unsubscribeDogs();
    if (unsubscribeSessions) unsubscribeSessions();
    state = { dogs: [], sessions: [] };
    selectedDogId = null;

    render();
  }
});

// Attach Firestore real-time listeners for authenticated admin.
function subscribeToDatabase() {
  unsubscribeDogs = onSnapshot(
    collection(db, "Dogs"),
    (snapshot) => {
      state.dogs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      if (!selectedDogId && state.dogs.length > 0) {
        selectedDogId = state.dogs[0].id;
      }
      render();
    },
    (error) => showError(`Dogs listener error: ${error.message}`)
  );

  unsubscribeSessions = onSnapshot(
    collection(db, "Sessions"),
    (snapshot) => {
      state.sessions = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      render();
    },
    (error) => showError(`Sessions listener error: ${error.message}`)
  );
}