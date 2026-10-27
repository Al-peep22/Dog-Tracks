// -------------------------------------------------------------
// FIREBASE MODULE IMPORTS
// -------------------------------------------------------------
// Core Firebase application initialization helper from official CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Cloud Firestore database access and real-time snapshot listeners from official CDN.
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Authentication methods from official CDN (used for the Admin).
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Storage module CRUD helpers, calculators, and user verification.
import { 
  createDog, 
  createSession, 
  deleteDog, 
  createUserProfile,
  authenticateDatabaseUser,
  calculateAgeYears, 
  extractId 
} from "./storage.js";

// -------------------------------------------------------------
// FIREBASE CONFIGURATION & INITIALIZATION
// -------------------------------------------------------------
// Project-specific credentials for the dog-tracks-24243 Firebase application.
const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
  storageBucket: "dog-tracks-24243.firebasestorage.app",
  messagingSenderId: "405971058990",
  appId: "1:405971058990:web:fa19a1e4e69892663ababf",
  measurementId: "G-CVLKTJ3LTY"
};

// Initialize the Firebase app instance.
const app = initializeApp(firebaseConfig);

// Initialize the Cloud Firestore database instance.
const db = getFirestore(app);

// Initialize the Firebase Authentication service instance.
const auth = getAuth(app);

// Complete list of authorized admin email addresses.
const ADMIN_EMAILS = [
  "dogtracksadmin@dogtracks.com",
  "admin@dogtracks.com"
];

// Helper to determine if a given email has administrative rights.
function checkIsAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === String(email).trim().toLowerCase());
}

// -------------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------------
// Main container mount point targeted for rendering application views.
const root = document.querySelector('#app');

// Modal dialog used to capture new dog profiles.
const dogDialog = document.querySelector('#dog-dialog');

// Form element inside the add dog dialog.
const dogForm = document.querySelector('#dog-form');

// Trigger button used to open the add dog dialog.
const openDogDialogBtn = document.querySelector('#open-dog-dialog');

// Collection of buttons configured to dismiss the add dog dialog.
const closeDogDialogButtons = document.querySelectorAll('[data-close-dialog]');

// Navigation action button used to trigger login or logout.
const authBtn = document.querySelector('#auth-btn');

// -------------------------------------------------------------
// IN-MEMORY APPLICATION STATE
// -------------------------------------------------------------
// Track active user profile (either from Firebase Auth or from Users collection).
let currentUser = null;

// Track active authentication tab on login screen ('login' or 'signup').
let activeAuthTab = 'login';

// Unsubscribe handles used to detach Firestore listeners upon signing out.
let unsubscribeDogs = null;
let unsubscribeSessions = null;

// Master database caches holding every document received from Firestore.
let rawAllDogs = [];
let rawAllSessions = [];

// Application state holding filtered synchronizations of dogs and sessions for current view.
let state = {
  dogs: [],
  sessions: []
};

// Identifier of the currently focused dog profile.
let selectedDogId = null;

// -------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------
// Sanitize raw text to prevent Cross-Site Scripting (XSS).
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

// Convert Firestore Timestamps or standard date representations into localized date strings.
function relativeDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Return the dog matching selectedDogId or fallback to the first dog in state.
function selectedDog() {
  return state.dogs.find((d) => d.id === selectedDogId) ?? state.dogs[0] ?? null;
}

// Render an error boundary message card within the root DOM container.
function showError(message) {
  if (!root) return;
  root.innerHTML = `
    <section class="error-panel">
      <p class="eyebrow">NOTICE / ERROR</p>
      <h1>DogTracks encountered an issue</h1>
      <p><strong>Details:</strong> ${escapeHtml(message)}</p>
    </section>`;
}

// -------------------------------------------------------------
// ADMIN INSPECTION BAR COMPONENT
// -------------------------------------------------------------
// Renders the raw Firestore data inspector for authorized administrators.
function buildAdminPanel() {
  if (!checkIsAdmin(currentUser?.email)) return '';

  return `
    <section class="panel" style="margin-bottom: 24px; border: 2px dashed #b77a34; background: #fffcf8; padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <span style="background: #b77a34; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">ADMIN OVERVIEW</span>
          <strong style="margin-left: 8px; font-size: 13px;">Viewing Entire Firestore Database (Unfiltered)</strong>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="admin-seed-btn" class="button button-quiet" style="font-size: 11px; min-height: 30px; padding: 0 10px;">
            + Seed Sample Dog &amp; Session
          </button>
        </div>
      </div>

      <p style="font-size: 12px; color: var(--muted); margin: 0 0 12px;">
        Signed in as <strong>${escapeHtml(currentUser.email)}</strong>. You have unrestricted access to all <strong>${rawAllDogs.length}</strong> dogs and <strong>${rawAllSessions.length}</strong> sessions across all users.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 11px;">
        <!-- ALL DOGS IN FIRESTORE -->
        <div style="background: white; border: 1px solid #e8eae4; border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
          <strong>All Dogs in Firestore (${rawAllDogs.length})</strong>
          ${
            rawAllDogs.length === 0
              ? '<p style="color: #728078; margin-top: 6px;">No documents in the "Dogs" collection.</p>'
              : `<pre style="margin-top: 6px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(JSON.stringify(rawAllDogs, null, 2))}</pre>`
          }
        </div>

        <!-- ALL SESSIONS IN FIRESTORE -->
        <div style="background: white; border: 1px solid #e8eae4; border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
          <strong>All Sessions in Firestore (${rawAllSessions.length})</strong>
          ${
            rawAllSessions.length === 0
              ? '<p style="color: #728078; margin-top: 6px;">No documents in the "Sessions" collection.</p>'
              : `<pre style="margin-top: 6px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(JSON.stringify(rawAllSessions, null, 2))}</pre>`
          }
        </div>
      </div>
    </section>
  `;
}

// -------------------------------------------------------------
// DEDICATED LOGIN & SIGN UP PAGE RENDERER
// -------------------------------------------------------------
// Generates the on-page authentication interface when no user is signed in.
function renderAuthPage() {
  if (!root) return;

  root.innerHTML = `
    <div style="max-width: 440px; margin: 40px auto; padding: 0 16px;">
      <section class="panel" style="padding: 32px 28px; box-shadow: var(--shadow);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span class="brand-mark" style="margin: 0 auto 14px; width: 44px; height: 44px; font-size: 24px;">D</span>
          <h1 style="font-size: 28px; margin-bottom: 6px;">DogTracks</h1>
          <p style="color: var(--muted); font-size: 13px; margin: 0;">Sign in to view dogs and training records</p>
        </div>

        <!-- Authentication Tab Buttons -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--line); padding-bottom: 10px;">
          <button type="button" id="auth-tab-login" class="button ${activeAuthTab === 'login' ? 'button-primary' : 'button-quiet'}" style="flex: 1; min-height: 36px; font-size: 12px;">
            Log In
          </button>
          <button type="button" id="auth-tab-signup" class="button ${activeAuthTab === 'signup' ? 'button-primary' : 'button-quiet'}" style="flex: 1; min-height: 36px; font-size: 12px;">
            Sign Up
          </button>
        </div>

        <!-- 1. LOGIN FORM -->
        <form id="page-login-form" style="display: ${activeAuthTab === 'login' ? 'grid' : 'none'}; gap: 14px;">
          <label>
            Email Address
            <input type="email" id="page-login-email" required placeholder="user@example.com" autocomplete="email" />
          </label>

          <label>
            Password
            <input type="password" id="page-login-password" required placeholder="••••••••" autocomplete="current-password" />
          </label>

          <button type="submit" class="button button-primary" style="margin-top: 6px; width: 100%;">
            Sign In to DogTracks
          </button>
        </form>

        <!-- 2. SIGN UP FORM -->
        <form id="page-signup-form" style="display: ${activeAuthTab === 'signup' ? 'grid' : 'none'}; gap: 14px;">
          <label>
            Full Name
            <input type="text" id="page-signup-name" required placeholder="e.g. Bob" />
          </label>

          <label>
            Email Address
            <input type="email" id="page-signup-email" required placeholder="dude123@gmail.com" autocomplete="email" />
          </label>

          <label>
            Password
            <input type="password" id="page-signup-password" required minlength="4" placeholder="Enter password" autocomplete="new-password" />
          </label>

          <div class="form-row">
            <label>
              Latitude
              <input type="number" step="any" id="page-signup-lat" required value="47.996753" placeholder="e.g. 47.996753" />
            </label>
            <label>
              Longitude
              <input type="number" step="any" id="page-signup-lng" required value="-102.563571" placeholder="e.g. -102.563571" />
            </label>
          </div>

          <button type="submit" class="button button-primary" style="margin-top: 6px; width: 100%;">
            Create Account
          </button>
        </form>
      </section>
    </div>
  `;

  // Attach tab switcher listeners.
  document.querySelector('#auth-tab-login')?.addEventListener('click', () => {
    activeAuthTab = 'login';
    renderAuthPage();
  });

  document.querySelector('#auth-tab-signup')?.addEventListener('click', () => {
    activeAuthTab = 'signup';
    renderAuthPage();
  });

  // DUAL-MODE LOGIN SUBMISSION: Checks Firebase Auth (Admin), then Users collection (Regular users).
  document.querySelector('#page-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#page-login-email').value.trim();
    const password = document.querySelector('#page-login-password').value;

    try {
      // 1. Try Firebase Authentication first (for Admin).
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest if successful!
    } catch (authError) {
      // 2. If Firebase Auth fails, check the Firestore 'Users' collection directly.
      try {
        const dbUser = await authenticateDatabaseUser(db, email, password);

        if (dbUser) {
          // Manually set currentUser to the matched database user record.
          currentUser = dbUser;
          // Store user session in localStorage so refreshing preserves session.
          localStorage.setItem('dogtracks_db_user', JSON.stringify(dbUser));
          // Update navigation UI.
          authBtn.textContent = 'Log Out';
          openDogDialogBtn.style.display = 'inline-flex';
          // Start syncing Firestore data.
          subscribeToDatabase();
          return;
        }

        // If neither matched, show error to user.
        window.alert("Invalid email or password. Please check your credentials.");
      } catch (dbError) {
        console.error("Database user check failed:", dbError);
        window.alert(`Login error: ${dbError.message}`);
      }
    }
  });

  // SIGN UP SUBMISSION: Creates new document directly in 'Users' collection.
  document.querySelector('#page-signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.querySelector('#page-signup-name').value;
    const email = document.querySelector('#page-signup-email').value;
    const password = document.querySelector('#page-signup-password').value;
    const latitude = document.querySelector('#page-signup-lat').value;
    const longitude = document.querySelector('#page-signup-lng').value;

    try {
      // Create user document in the 'Users' collection.
      const newDbUser = await createUserProfile(db, {
        name,
        email,
        password,
        latitude,
        longitude
      });

      // Automatically log the new user in.
      currentUser = newDbUser;
      localStorage.setItem('dogtracks_db_user', JSON.stringify(newDbUser));

      authBtn.textContent = 'Log Out';
      openDogDialogBtn.style.display = 'inline-flex';
      subscribeToDatabase();

      window.alert(`Account created successfully! Welcome, ${name}.`);
    } catch (error) {
      console.error("Sign up error:", error);
      window.alert(`Sign up failed: ${error.message}`);
    }
  });
}

// -------------------------------------------------------------
// MAIN DASHBOARD RENDER FUNCTION
// -------------------------------------------------------------
function render() {
  if (!root) return;

  // If there is no authenticated user session, present the on-page login interface.
  if (!currentUser) {
    renderAuthPage();
    return;
  }

  // Active dog resolution.
  const dog = selectedDog();
  selectedDogId = dog ? dog.id : null;

  // Filter training sessions for the active dog.
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
  const isAdmin = checkIsAdmin(currentUser.email);

  // Render dashboard containing the admin inspector toolbar and linked stat cards.
  root.innerHTML = `
    <!-- ADMIN DATA INSPECTOR (Rendered only for administrator) -->
    ${buildAdminPanel()}

    <section class="welcome">
      <div>
        <p class="eyebrow">${isAdmin ? '★ ADMINISTRATOR' : 'LOGGED IN AS'}: ${escapeHtml(currentUser.email)}</p>
        <h1>Small steps, stronger bonds.</h1>
        <p class="welcome-copy">A little consistency goes a long way. Here's your training progress so far.</p>
      </div>
    </section>

    <!-- STATS OVERVIEW SECTION WITH NAVIGATION HYPERLINKS -->
    <section class="stats" aria-label="Training overview">
      <a href="dogs-overview.html" class="stat-card" style="text-decoration: none; color: inherit;">
        <span class="stat-icon" aria-hidden="true">♧</span>
        <div>
          <p class="stat-value">${state.dogs.length}</p>
          <p class="stat-label">${isAdmin ? 'All dogs in database' : 'Dogs in your care'}</p>
        </div>
      </a>

      <a href="training-log.html" class="stat-card" style="text-decoration: none; color: inherit;">
        <span class="stat-icon" aria-hidden="true">✓</span>
        <div>
          <p class="stat-value">${sessionCount}</p>
          <p class="stat-label">Training entries</p>
        </div>
      </a>

      <a href="analytics.html" class="stat-card" style="text-decoration: none; color: inherit;">
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
            <h2 id="dogs-heading">${isAdmin ? 'All Dog Profiles' : 'Your Dogs'}</h2>
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

  // Attach click handlers to switch active dog selection.
  root.querySelectorAll('[data-select-dog]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDogId = button.dataset.selectDog;
      render();
    });
  });

  // Attach session submission handler.
  root.querySelector('#session-form')?.addEventListener('submit', onSessionSubmit);

  // Attach dog deletion handler.
  root.querySelector('[data-delete-dog]')?.addEventListener('click', onDeleteDog);

  // Attach admin injection button handler.
  root.querySelector('#admin-seed-btn')?.addEventListener('click', injectTestData);
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

// Admin helper to inject a test dog profile and session to test writes.
async function injectTestData() {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const dogDocRef = await createDog(db, {
      Name: "Bailey (Admin Seed)",
      Breed: "Golden Retriever",
      DateOfBirth: twoYearsAgo.toISOString().split('T')[0],
      Notes: "Injected by Admin toolbar"
    }, currentUser?.uid);

    await createSession(db, {
      DogId: dogDocRef.id,
      Behavior: "Loose-leash walking",
      Trigger: "Passing another dog",
      Notes: "Attentive with positive reinforcement.",
      OccurredAt: new Date().toISOString()
    });

    window.alert("Test dog & session seeded successfully!");
  } catch (error) {
    console.error("Admin injection failed:", error);
    window.alert(`Injection failed: ${error.message}`);
  }
}

// -------------------------------------------------------------
// STATIC LISTENERS (Dialogs & Forms)
// -------------------------------------------------------------
openDogDialogBtn?.addEventListener('click', () => dogDialog?.showModal());
closeDogDialogButtons.forEach((btn) => btn.addEventListener('click', () => dogDialog?.close()));

dogDialog?.addEventListener('click', (e) => { if (e.target === dogDialog) dogDialog.close(); });

// Handle new dog profile creation form submission.
dogForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(dogForm));

  try {
    const docRef = await createDog(db, {
      Name: values.Name,
      Breed: values.Breed,
      DateOfBirth: values.DateOfBirth,
      Notes: values.Notes
    }, currentUser?.uid);

    selectedDogId = docRef.id;
    dogForm.reset();
    dogDialog.close();
  } catch (error) {
    window.alert(`Could not add dog: ${error.message}`);
  }
});

// Top bar sign in / sign out toggle action.
authBtn?.addEventListener('click', async () => {
  if (currentUser) {
    // If it was a Firebase Auth user, sign out from Firebase.
    if (!currentUser.isDatabaseUser) {
      await signOut(auth);
    }
    // Clear manual database user session.
    currentUser = null;
    localStorage.removeItem('dogtracks_db_user');

<<<<<<< Updated upstream
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
    openDogDialogBtn.style.display = 'flex';

    // Start listening to Firestore once authenticated.
    subscribeToDatabase();
  } else {
    // Reset UI to logged out state.
    authBtn.textContent = 'Admin Login';
=======
    authBtn.textContent = 'Sign In';
>>>>>>> Stashed changes
    openDogDialogBtn.style.display = 'none';

    if (unsubscribeDogs) unsubscribeDogs();
    if (unsubscribeSessions) unsubscribeSessions();
    rawAllDogs = [];
    rawAllSessions = [];
    state = { dogs: [], sessions: [] };
    selectedDogId = null;

    render();
  } else {
    activeAuthTab = 'login';
    renderAuthPage();
  }
});

// -------------------------------------------------------------
// REAL-TIME AUTH STATE LISTENER (Firebase Auth for Admin)
// -------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Admin or Firebase Auth user detected.
    currentUser = user;
    localStorage.removeItem('dogtracks_db_user');

    authBtn.textContent = 'Log Out';
    openDogDialogBtn.style.display = 'inline-flex';
    subscribeToDatabase();
  } else if (!currentUser || !currentUser.isDatabaseUser) {
    // Check if there is an active database user session in localStorage.
    const savedDbUser = localStorage.getItem('dogtracks_db_user');
    if (savedDbUser) {
      try {
        currentUser = JSON.parse(savedDbUser);
        authBtn.textContent = 'Log Out';
        openDogDialogBtn.style.display = 'inline-flex';
        subscribeToDatabase();
        return;
      } catch (err) {
        localStorage.removeItem('dogtracks_db_user');
      }
    }

    // Otherwise, clear state and show login.
    authBtn.textContent = 'Sign In';
    openDogDialogBtn.style.display = 'none';

    if (unsubscribeDogs) unsubscribeDogs();
    if (unsubscribeSessions) unsubscribeSessions();
    rawAllDogs = [];
    rawAllSessions = [];
    state = { dogs: [], sessions: [] };
    selectedDogId = null;

    render();
  }
});

// Subscribe to database collections according to role.
function subscribeToDatabase() {
  const isAdmin = checkIsAdmin(currentUser?.email);

  unsubscribeDogs = onSnapshot(
    collection(db, "Dogs"),
    (snapshot) => {
      rawAllDogs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // If user is Admin: view ALL dogs in the database.
      // If user is a regular user: filter dogs where OwnerId matches their document ID.
      state.dogs = isAdmin 
        ? rawAllDogs 
        : rawAllDogs.filter((d) => {
            const ownerId = extractId(d.OwnerId);
            return ownerId === currentUser.uid;
          });

      if (!selectedDogId && state.dogs.length > 0) {
        selectedDogId = state.dogs[0].id;
      }
      render();
    },
    (error) => showError(`Dogs query error: ${error.message}`)
  );

  unsubscribeSessions = onSnapshot(
    collection(db, "Sessions"),
    (snapshot) => {
      rawAllSessions = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      state.sessions = rawAllSessions;
      render();
    },
    (error) => showError(`Sessions query error: ${error.message}`)
  );
}

// Initial invocation.
render();