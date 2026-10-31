// -------------------------------------------------------------
// FIREBASE MODULE IMPORTS
// -------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut, 
  deleteUser,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  createDog, 
  createSession, 
  deleteDog, 
  deleteUserAccount,
  ensureUserProfileCreated,
  authenticateDatabaseUser,
  calculateAgeYears, 
  extractId 
} from "./storage.js";
import {
  getBreedSelection,
  initializeBreedPickers,
  setBreedSelection,
} from "./breed-picker.js";

// -------------------------------------------------------------
// FIREBASE CONFIGURATION & INITIALIZATION
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAILS = [
  "dogtracksadmin@dogtracks.com",
  "admin@dogtracks.com"
];

function checkIsAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === String(email).trim().toLowerCase());
}

// -------------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------------
const root = document.querySelector('#app');
const dogDialog = document.querySelector('#dog-dialog');
const dogForm = document.querySelector('#dog-form');

// Trigger button used to open the add dog dialog.
const openDogDialogBtn = document.querySelector('#open-dog-dialog');
const closeDogDialogButtons = document.querySelectorAll('[data-close-dialog]');
const authBtn = document.querySelector('#auth-btn');

// -------------------------------------------------------------
// IN-MEMORY APPLICATION STATE
// -------------------------------------------------------------
let currentUser = null;
let activeAuthTab = 'login';
let unsubscribeDogs = null;
let unsubscribeSessions = null;

let rawAllDogs = [];
let rawAllSessions = [];

let state = {
  dogs: [],
  sessions: []
};

let selectedDogId = null;

// -------------------------------------------------------------
// UTILITY FUNCTIONS & VALIDATORS
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
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
      <p class="eyebrow">NOTICE / ERROR</p>
      <h1>DogTracks encountered an issue</h1>
      <p><strong>Details:</strong> ${escapeHtml(message)}</p>
    </section>`;
}

function lockDateInputsToToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const dobInputs = document.querySelectorAll('input[name="DateOfBirth"], #dog-dob-input');
  dobInputs.forEach((input) => {
    input.setAttribute('max', todayStr);
  });
}

// -------------------------------------------------------------
// ADMIN INSPECTION BAR COMPONENT
// -------------------------------------------------------------
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
        You have unrestricted access to all <strong>${rawAllDogs.length}</strong> dogs and <strong>${rawAllSessions.length}</strong> sessions across all users.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 11px;">
        <div style="background: white; border: 1px solid #e8eae4; border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
          <strong>All Dogs in Firestore (${rawAllDogs.length})</strong>
          ${
            rawAllDogs.length === 0
              ? '<p style="color: #728078; margin-top: 6px;">No documents in the "Dogs" collection.</p>'
              : `<pre style="margin-top: 6px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(JSON.stringify(rawAllDogs, null, 2))}</pre>`
          }
        </div>

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
            <input type="email" id="page-signup-email" required placeholder="user@example.com" autocomplete="email" />
          </label>

          <label>
            Password
            <input type="password" id="page-signup-password" required minlength="6" placeholder="At least 6 characters" autocomplete="new-password" />
          </label>

          <button type="submit" class="button button-primary" style="margin-top: 6px; width: 100%;">
            Create Account &amp; Send Verification
          </button>
        </form>
      </section>
    </div>
  `;

  document.querySelector('#auth-tab-login')?.addEventListener('click', () => {
    activeAuthTab = 'login';
    renderAuthPage();
  });

  document.querySelector('#auth-tab-signup')?.addEventListener('click', () => {
    activeAuthTab = 'signup';
    renderAuthPage();
  });

  document.querySelector('#page-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#page-login-email').value.trim();
    const password = document.querySelector('#page-login-password').value;

    if (!isValidEmail(email)) {
      window.alert("Invalid Email: Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified && !checkIsAdmin(user.email)) {
        await signOut(auth);
        window.alert("Please verify your email address before logging in. Check your inbox for the verification link.");
        return;
      }

      const pendingDataKey = `pending_signup_${email.toLowerCase()}`;
      const savedPending = localStorage.getItem(pendingDataKey);
      let signupInfo = { name: email.split('@')[0], email, password };

      if (savedPending) {
        try {
          signupInfo = JSON.parse(savedPending);
        } catch (_) {}
      }

      await ensureUserProfileCreated(db, user.uid, signupInfo);
      localStorage.removeItem(pendingDataKey);

    } catch (authError) {
      if (authError.code === 'auth/invalid-email') {
        window.alert("Invalid Email: The email address is badly formatted.");
        return;
      }

      try {
        const dbUser = await authenticateDatabaseUser(db, email, password);

        if (dbUser) {
          currentUser = dbUser;
          localStorage.setItem('dogtracks_db_user', JSON.stringify(dbUser));
          authBtn.textContent = 'Log Out';
          openDogDialogBtn.style.display = 'inline-flex';
          subscribeToDatabase();
          return;
        }

        window.alert("Invalid email or password. Please check your credentials.");
      } catch (dbError) {
        console.error("Database user check failed:", dbError);
        window.alert(`Login error: ${dbError.message}`);
      }
    }
  });

  document.querySelector('#page-signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.querySelector('#page-signup-name').value.trim();
    const email = document.querySelector('#page-signup-email').value.trim();
    const password = document.querySelector('#page-signup-password').value;

    if (!isValidEmail(email)) {
      window.alert("Invalid Email: Please provide a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      await sendEmailVerification(user);

      localStorage.setItem(`pending_signup_${email.toLowerCase()}`, JSON.stringify({
        name,
        email,
        password
      }));

      await signOut(auth);

      window.alert(
        `Verification email sent to ${email}!\n\nPlease check your inbox and click the verification link before logging in.`
      );

      activeAuthTab = 'login';
      renderAuthPage();
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        window.alert("Invalid Email: Please check the spelling of your email address.");
      } else if (error.code === 'auth/email-already-in-use') {
        window.alert("An account already exists with this email address. Please log in instead.");
      } else {
        window.alert(`Sign up failed: ${error.message}`);
      }
    }
  });
}

// -------------------------------------------------------------
// MAIN DASHBOARD RENDER FUNCTION
// -------------------------------------------------------------
function render() {
  if (!root) return;

  if (!currentUser) {
    renderAuthPage();
    return;
  }

  const dog = selectedDog();
  selectedDogId = dog ? dog.id : null;

  const sessions = dog
    ? state.sessions
        .filter((session) => extractId(session.DogId) === dog.id)
        .sort((a, b) => {
          const timeA = a.OccurredAt?.toMillis ? a.OccurredAt.toMillis() : new Date(a.OccurredAt).getTime();
          const timeB = b.OccurredAt?.toMillis ? b.OccurredAt.toMillis() : new Date(b.OccurredAt).getTime();
          return timeB - timeA;
        })
    : [];

  const isAdmin = checkIsAdmin(currentUser.email);
  const accountDogIds = new Set(
    rawAllDogs
      .filter((accountDog) => extractId(accountDog.OwnerId) === currentUser.uid)
      .map((accountDog) => accountDog.id)
  );
  const accountSessions = state.sessions.filter((session) =>
    accountDogIds.has(extractId(session.DogId))
  );
  const dashboardSessions = isAdmin ? state.sessions : accountSessions;
  const sessionCount = dashboardSessions.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = dashboardSessions.filter((s) => {
    const time = s.OccurredAt?.toMillis ? s.OccurredAt.toMillis() : new Date(s.OccurredAt).getTime();
    return time >= sevenDaysAgo;
  }).length;

  const activeDogAge = dog ? calculateAgeYears(dog.DateOfBirth) : 0;

  root.innerHTML = `
    ${buildAdminPanel()}

    <section class="welcome">
      <div>
        <h1>Small steps, stronger bonds.</h1>
        <p class="welcome-copy">A little consistency goes a long way. Here's your training progress so far.</p>
      </div>
    </section>

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
                    const itemColor = item.Color || '#315f4e';

                    return `
                      <button class="dog-item" type="button"
                        data-select-dog="${escapeHtml(item.id)}"
                        aria-pressed="${dog?.id === item.id}"
                        style="border-left: 4px solid ${escapeHtml(itemColor)};">
                        <span class="dog-avatar" aria-hidden="true" style="overflow: hidden; background: ${escapeHtml(itemColor)}22; color: ${escapeHtml(itemColor)};">
                          ${
                            item.PhotoDataUrl
                              ? `<img src="${escapeHtml(item.PhotoDataUrl)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />`
                              : escapeHtml(initial)
                          }
                        </span>
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

      ${
        dog
          ? `
      <article class="panel detail-panel" aria-labelledby="selected-dog-name">
        <div class="detail-top">
          <span class="detail-avatar" aria-hidden="true" style="overflow: hidden; background: ${escapeHtml(dog.Color || '#315f4e')}22; color: ${escapeHtml(dog.Color || '#315f4e')};">
            ${
              dog.PhotoDataUrl
                ? `<img src="${escapeHtml(dog.PhotoDataUrl)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />`
                : escapeHtml((dog.Name ? dog.Name.charAt(0) : '?').toUpperCase())
            }
          </span>
          <div class="detail-title">
            <h2 id="selected-dog-name">${escapeHtml(dog.Name || 'Unnamed')}</h2>
            <p style="display: flex; align-items: center; gap: 8px;">
              <span>${escapeHtml(dog.Breed || 'Breed not specified')} · ${activeDogAge} ${activeDogAge === 1 ? 'year' : 'years'} old</span>
              ${
                dog.Color
                  ? `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; background: #f0f1ed; padding: 2px 6px; border-radius: 4px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${escapeHtml(dog.Color)}; display: inline-block;"></span>
                      ${escapeHtml(dog.Color)}
                    </span>`
                  : ''
              }
            </p>
          </div>
          <button type="button" class="button" data-delete-dog="${escapeHtml(dog.id)}"
            style="background: #fff; color: #b73a3a; border: 1px solid #f1c5c5; font-size: 11px; padding: 0 12px; display: inline-flex; align-items: center; gap: 5px; height: 34px;"
            title="Delete ${escapeHtml(dog.Name)} profile">
            <span aria-hidden="true">🗑</span> Delete Dog
          </button>
        </div>

        ${dog.Notes ? `<p class="profile-notes">${escapeHtml(dog.Notes)}</p>` : ''}

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

    <!-- ACCOUNT SETTINGS & DANGER ZONE SECTION -->
    <section class="panel" style="margin-top: 32px; border-top: 2px solid #f1f2ec; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h3 style="margin: 0 0 4px; font-size: 14px; color: #b73a3a;">Account Settings</h3>
        <p style="margin: 0; font-size: 12px; color: var(--muted);">Permanently delete your user profile, all registered dogs, and training journals.</p>
      </div>
      <button type="button" id="delete-account-btn" class="button"
        style="background: #fff; color: #b73a3a; border: 1px solid #f1c5c5; font-size: 12px; padding: 0 16px; height: 36px; display: inline-flex; align-items: center; gap: 6px;">
        <span aria-hidden="true">⚠️</span> Delete Account
      </button>
    </section>
  `;

  root.querySelectorAll('[data-select-dog]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDogId = button.dataset.selectDog;
      render();
    });
  });

  root.querySelector('#session-form')?.addEventListener('submit', onSessionSubmit);
  root.querySelector('[data-delete-dog]')?.addEventListener('click', onDeleteDog);
  root.querySelector('#admin-seed-btn')?.addEventListener('click', injectTestData);
  root.querySelector('#delete-account-btn')?.addEventListener('click', onDeleteAccount);
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
  if (!dog) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${dog.Name}?\n\nThis will permanently remove their profile and all logged training entries. This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await deleteDog(db, dog.id);
    if (selectedDogId === dog.id) selectedDogId = null;
  } catch (error) {
    showError(error.message);
  }
}

// Reference to delete account dialog elements
const deleteAccountDialog = document.querySelector('#delete-account-dialog');
const deleteAccountInput = document.querySelector('#delete-account-confirm-input');
const confirmDeleteAccountBtn = document.querySelector('#confirm-delete-account-btn');
const closeDeleteAccountButtons = document.querySelectorAll('[data-close-delete-account]');

// Wire dismiss handlers for delete account dialog
closeDeleteAccountButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    deleteAccountDialog?.close();
  });
});

deleteAccountDialog?.addEventListener('click', (e) => {
  if (e.target === deleteAccountDialog) deleteAccountDialog.close();
});

// Trigger button opens the HTML dialog instead of calling prompt()
function onDeleteAccount() {
  if (!currentUser) {
    window.alert("No user is currently signed in.");
    return;
  }
  if (deleteAccountInput) deleteAccountInput.value = '';
  deleteAccountDialog?.showModal();
}

// Confirmed delete button execution
confirmDeleteAccountBtn?.addEventListener('click', async () => {
  const enteredText = (deleteAccountInput?.value || '').trim();

  if (enteredText !== "DELETE") {
    window.alert('Account deletion canceled. You must type "DELETE" exactly to confirm.');
    return;
  }

  // Dismiss modal before proceeding
  deleteAccountDialog?.close();

  const targetUserId = currentUser.uid;
  const targetEmail = currentUser.email;
  const authUser = auth.currentUser;
  const knownDogIds = state.dogs.map((d) => d.id);

  try {
    // 1. Delete Firestore records (dogs, sessions, Users doc)
    await deleteUserAccount(db, targetUserId, targetEmail, knownDogIds);

    // 2. Delete Firebase Authentication user record if present
    if (authUser) {
      try {
        await deleteUser(authUser);
      } catch (authErr) {
        if (authErr.code === 'auth/requires-recent-login') {
          window.alert(
            "Your database records were removed, but deleting your login credentials requires a fresh login.\n\nPlease log in again and click Delete Account once more to finish."
          );
          await signOut(auth);
          currentUser = null;
          render();
          return;
        }
        throw authErr;
      }
    } else {
      await signOut(auth).catch(() => {});
    }

    // 3. Clear local storage and active Firestore observers
    localStorage.removeItem('dogtracks_db_user');
    if (targetEmail) {
      localStorage.removeItem(`pending_signup_${targetEmail.toLowerCase()}`);
    }

    if (unsubscribeDogs) {
      unsubscribeDogs();
      unsubscribeDogs = null;
    }
    if (unsubscribeSessions) {
      unsubscribeSessions();
      unsubscribeSessions = null;
    }

    currentUser = null;
    rawAllDogs = [];
    rawAllSessions = [];
    state = { dogs: [], sessions: [] };
    selectedDogId = null;

    authBtn.textContent = 'Sign In';
    if (openDogDialogBtn) openDogDialogBtn.style.display = 'none';

    window.alert("Your account and all associated records have been permanently deleted.");
    render();

  } catch (error) {
    console.error("[DeleteAccount] Fatal error:", error);
    window.alert(`Could not delete account:\n${error.message}\n(Code: ${error.code || 'N/A'})`);
  }
});

async function injectTestData() {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const dogDocRef = await createDog(db, {
      Name: "Bailey (Admin Seed)",
      Breed: "Golden Retriever",
      Color: "#b77a34",
      PhotoDataUrl: "",
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
openDogDialogBtn?.addEventListener('click', () => {
  lockDateInputsToToday();
  dogDialog?.showModal();
});
closeDogDialogButtons.forEach((btn) => btn.addEventListener('click', () => dogDialog?.close()));

dogDialog?.addEventListener('click', (e) => { if (e.target === dogDialog) dogDialog.close(); });

dogForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(dogForm);
  const name = formData.get('Name');
  const breed = getBreedSelection(dogForm.querySelector("[data-breed-fields]"));
  const color = formData.get('Color') || '#315f4e';
  const dateOfBirth = formData.get('DateOfBirth');
  const notes = formData.get('Notes');
  const photoFile = formData.get('PhotoFile');

  if (!dateOfBirth) {
    window.alert("Invalid Date: Please choose a valid date of birth.");
    return;
  }

  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (selectedDate.getTime() > endOfToday.getTime()) {
    window.alert("Invalid Date: Date of birth cannot be in the future.");
    return;
  }

  try {
    let photoDataUrl = '';
    if (photoFile && photoFile.size > 0) {
      photoDataUrl = await readFileAsDataUrl(photoFile);
    }

    const docRef = await createDog(db, {
      Name: name,
      Breed: breed,
      Color: color,
      PhotoDataUrl: photoDataUrl,
      DateOfBirth: dateOfBirth,
      Notes: notes
    }, currentUser?.uid);

    selectedDogId = docRef.id;
    dogForm.reset();
    setBreedSelection(dogForm.querySelector("[data-breed-fields]"), "");
    dogDialog.close();
  } catch (error) {
    window.alert(`Could not add dog: ${error.message}`);
  }
});

authBtn?.addEventListener('click', async () => {
  if (currentUser) {
    if (!currentUser.isDatabaseUser) {
      await signOut(auth);
    }
    currentUser = null;
    localStorage.removeItem('dogtracks_db_user');

    authBtn.textContent = 'Sign In';
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
// REAL-TIME AUTH STATE LISTENER
// -------------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (!user.emailVerified && !checkIsAdmin(user.email)) {
      signOut(auth);
      currentUser = null;
      render();
      return;
    }

    const pendingDataKey = `pending_signup_${user.email.toLowerCase()}`;
    const savedPending = localStorage.getItem(pendingDataKey);
    let signupInfo = { name: user.email.split('@')[0], email: user.email, password: '' };

    if (savedPending) {
      try {
        signupInfo = JSON.parse(savedPending);
      } catch (_) {}
    }

    await ensureUserProfileCreated(db, user.uid, signupInfo);
    localStorage.removeItem(pendingDataKey);

    currentUser = user;
    localStorage.removeItem('dogtracks_db_user');

    authBtn.textContent = 'Log Out';
    openDogDialogBtn.style.display = 'inline-flex';
    subscribeToDatabase();
  } else if (!currentUser || !currentUser.isDatabaseUser) {
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

function subscribeToDatabase() {
  const isAdmin = checkIsAdmin(currentUser?.email);

  unsubscribeDogs = onSnapshot(
    collection(db, "Dogs"),
    (snapshot) => {
      rawAllDogs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

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

// Initial invocation: guarantees date constraints and immediate login view render if unauthenticated.
lockDateInputsToToday();
render();