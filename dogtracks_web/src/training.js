import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { loadState } from "./storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const trainingRoot = document.querySelector("#training-root");

const ADMIN_EMAILS = ["dogtracksadmin@dogtracks.com", "admin@dogtracks.com"];

function isAdmin(user) {
  return ADMIN_EMAILS.some(
    (email) => email.toLowerCase() === String(user?.email || "").trim().toLowerCase()
  );
}

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        localStorage.removeItem("dogtracks_db_user");
        resolve(firebaseUser);
        return;
      }

      const savedUser = localStorage.getItem("dogtracks_db_user");
      if (savedUser) {
        try {
          const databaseUser = JSON.parse(savedUser);
          if (!databaseUser?.uid) throw new Error("Saved user is missing an ID.");
          resolve(databaseUser);
          return;
        } catch (error) {
          console.error("Could not restore the saved user:", error);
          localStorage.removeItem("dogtracks_db_user");
        }
      }

      resolve(null);
    }, reject);
  });
}

let currentUser;
try {
  currentUser = await getCurrentUser();
} catch (error) {
  console.error("Could not determine the signed-in user:", error);
  const errorMessage = document.createElement("p");
  errorMessage.className = "error-panel";
  errorMessage.textContent = `Could not check your sign-in status: ${error.message}`;
  trainingRoot.replaceChildren(errorMessage);
  throw error;
}

if (!currentUser) {
  const signInMessage = document.createElement("section");
  signInMessage.className = "panel training-panel";
  signInMessage.innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">TRAINING JOURNAL</p>
        <h1>Training log</h1>
        <p class="welcome-copy">Sign in on the home page to view your training sessions.</p>
      </div>
    </div>
    <a class="button button-primary" href="index.html">Go to sign in</a>
  `;
  trainingRoot.replaceChildren(signInMessage);
} else {
let state;

try {
  state = await loadState(db, {
    ownerId: currentUser.uid,
    isAdmin: isAdmin(currentUser),
  });
} catch (error) {
  trainingRoot.innerHTML = "";
  const errorMessage = document.createElement("p");
  errorMessage.className = "error-panel";
  errorMessage.textContent = `Could not load training sessions: ${error.message}`;
  trainingRoot.append(errorMessage);
  throw error;
}

const dogNames = new Map(state.dogs.map((dog) => [dog.id, dog.name || "Unknown dog"]));
const controls = document.createElement("section");
controls.className = "panel training-panel";
controls.innerHTML = `
  <div class="panel-heading">
    <div>
      <p class="eyebrow">TRAINING JOURNAL</p>
      <h1>Training log</h1>
      <p class="welcome-copy">Search, filter, and review every training session.</p>
    </div>
  </div>
  <section class="training-filters" aria-labelledby="training-filters-title">
    <div class="training-filters-heading">
      <div>
        <h2 id="training-filters-title">Find a session</h2>
        <p>Filter by dog, behavior, trigger, or date.</p>
      </div>
      <button type="button" class="button button-quiet" data-clear-filters>Clear filters</button>
    </div>
    <div class="training-filter-grid">
      <label class="training-search">
        Search all sessions
        <input type="search" data-search placeholder="Search dog, behavior, trigger, or notes">
      </label>
      <label>
        Dog
        <select data-dog-filter>
          <option value="">All dogs</option>
        </select>
      </label>
      <label>
        Behavior
        <select data-behavior-filter>
          <option value="">All behaviors</option>
        </select>
      </label>
      <label>
        Trigger
        <input type="search" data-trigger-filter placeholder="Any trigger">
      </label>
      <fieldset class="training-date-filter">
        <legend>Date range</legend>
        <label>
          From
          <input type="date" data-date-from>
        </label>
        <label>
          To
          <input type="date" data-date-to>
        </label>
      </fieldset>
      <label>
        Sort by
        <select data-sort>
          <option value="recent">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="dog">Dog name</option>
          <option value="behavior">Behavior</option>
        </select>
      </label>
    </div>
  </section>
  <section class="training-results" aria-labelledby="training-results-title">
    <div class="history-heading">
      <h2 id="training-results-title">All sessions</h2>
      <span data-session-count></span>
    </div>
    <div class="session-list" data-session-list></div>
  </section>
  <dialog class="session-dialog" aria-labelledby="session-dialog-title">
    <div class="dialog-card session-dialog-card">
      <div class="dialog-header">
        <h2 id="session-dialog-title" data-dialog-behavior></h2>
        <button type="button" class="icon-button" data-close-session-dialog aria-label="Close session details">×</button>
      </div>
      <p class="session-dialog-dog" data-dialog-dog></p>
      <p class="session-dialog-date" data-dialog-date></p>
      <section class="session-dialog-field" aria-labelledby="session-dialog-trigger-label">
        <h3 id="session-dialog-trigger-label">Trigger</h3>
        <p data-dialog-trigger></p>
      </section>
      <section class="session-dialog-field" aria-labelledby="session-dialog-notes-label">
        <h3 id="session-dialog-notes-label">Notes</h3>
        <p data-dialog-notes></p>
      </section>
    </div>
  </dialog>
`;

trainingRoot.replaceChildren(controls);

const dogFilter = controls.querySelector("[data-dog-filter]");
const behaviorFilter = controls.querySelector("[data-behavior-filter]");
const searchInput = controls.querySelector("[data-search]");
const triggerInput = controls.querySelector("[data-trigger-filter]");
const dateFromInput = controls.querySelector("[data-date-from]");
const dateToInput = controls.querySelector("[data-date-to]");
const sortInput = controls.querySelector("[data-sort]");
const sessionList = controls.querySelector("[data-session-list]");
const sessionCount = controls.querySelector("[data-session-count]");
const sessionDialog = controls.querySelector(".session-dialog");
const dialogBehavior = controls.querySelector("[data-dialog-behavior]");
const dialogDog = controls.querySelector("[data-dialog-dog]");
const dialogDate = controls.querySelector("[data-dialog-date]");
const dialogTrigger = controls.querySelector("[data-dialog-trigger]");
const dialogNotes = controls.querySelector("[data-dialog-notes]");

state.dogs
  .slice()
  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  .forEach((dog) => {
    const option = document.createElement("option");
    option.value = dog.id;
    option.textContent = dog.name || "Unknown dog";
    dogFilter.append(option);
  });

Array.from(new Set(state.sessions.map((session) => session.behavior?.trim()).filter(Boolean)))
  .sort((a, b) => a.localeCompare(b))
  .forEach((behavior) => {
    const option = document.createElement("option");
    option.value = behavior;
    option.textContent = behavior;
    behaviorFilter.append(option);
  });

function sessionDate(session) {
  const date = new Date(session.occurredAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSessionDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sessionMatches(session) {
  const dogName = dogNames.get(session.dogId) || "Unknown dog";
  const behavior = session.behavior || "";
  const trigger = session.trigger || "";
  const notes = session.notes || "";
  const date = sessionDate(session);
  const search = searchInput.value.trim().toLocaleLowerCase();
  const searchableText = [dogName, behavior, trigger, notes].join(" ").toLocaleLowerCase();
  const from = dateFromInput.value;
  const to = dateToInput.value;
  const dateKey = date ? dateInputValue(date) : "";

  return (!dogFilter.value || session.dogId === dogFilter.value)
    && (!behaviorFilter.value || behavior === behaviorFilter.value)
    && (!triggerInput.value.trim()
      || trigger.toLocaleLowerCase().includes(triggerInput.value.trim().toLocaleLowerCase()))
    && (!search || searchableText.includes(search))
    && (!from || (dateKey && dateKey >= from))
    && (!to || (dateKey && dateKey <= to));
}

function renderSession(session) {
  const item = document.createElement("article");
  item.className = "session-item";

  const openButton = document.createElement("button");
  openButton.className = "session-open-button";
  openButton.type = "button";
  openButton.setAttribute("aria-label", `View session: ${session.behavior || "Unspecified behavior"}`);

  const icon = document.createElement("span");
  icon.className = "session-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✓";

  const details = document.createElement("div");
  const behavior = document.createElement("h3");
  behavior.className = "session-behavior";
  behavior.textContent = session.behavior || "Unspecified behavior";

  const context = document.createElement("p");
  context.className = "session-context";
  const dogName = dogNames.get(session.dogId) || "Unknown dog";
  context.textContent = dogName;

  details.append(behavior, context);

  const date = document.createElement("time");
  date.className = "session-date";
  const occurredAt = sessionDate(session);
  if (occurredAt) {
    date.dateTime = occurredAt.toISOString();
    date.textContent = formatSessionDate(occurredAt);
  } else {
    date.textContent = "Date unavailable";
  }

  const toggleHint = document.createElement("span");
  toggleHint.className = "session-open-icon";
  toggleHint.setAttribute("aria-hidden", "true");
  toggleHint.textContent = "›";

  const metadata = document.createElement("span");
  metadata.className = "session-metadata";
  metadata.append(date, toggleHint);
  openButton.append(icon, details, metadata);

  openButton.addEventListener("click", () => {
    dialogBehavior.textContent = session.behavior || "Unspecified behavior";
    dialogDog.textContent = dogName;
    dialogDate.textContent = occurredAt ? formatSessionDate(occurredAt) : "Date unavailable";
    dialogTrigger.textContent = session.trigger || "No trigger recorded.";
    dialogNotes.textContent = session.notes || "No notes recorded.";
    sessionDialog.showModal();
  });

  item.append(openButton);
  return item;
}

function renderSessions() {
  const sessions = state.sessions.filter(sessionMatches);
  const sortBy = sortInput.value;

  sessions.sort((a, b) => {
    if (sortBy === "dog") {
      return (dogNames.get(a.dogId) || "").localeCompare(dogNames.get(b.dogId) || "");
    }
    if (sortBy === "behavior") {
      return (a.behavior || "").localeCompare(b.behavior || "");
    }

    const firstDate = sessionDate(a)?.getTime() ?? 0;
    const secondDate = sessionDate(b)?.getTime() ?? 0;
    return sortBy === "oldest" ? firstDate - secondDate : secondDate - firstDate;
  });

  sessionCount.textContent = `${sessions.length} of ${state.sessions.length} sessions`;
  sessionList.replaceChildren();

  if (sessions.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = state.sessions.length
      ? "No sessions match these filters. Try changing or clearing your filters."
      : "No training sessions have been logged yet.";
    sessionList.append(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  sessions.forEach((session) => fragment.append(renderSession(session)));
  sessionList.append(fragment);
}

[dogFilter, behaviorFilter, searchInput, triggerInput, dateFromInput, dateToInput, sortInput]
  .forEach((input) => input.addEventListener("input", renderSessions));

controls.querySelector("[data-clear-filters]").addEventListener("click", () => {
  dogFilter.value = "";
  behaviorFilter.value = "";
  searchInput.value = "";
  triggerInput.value = "";
  dateFromInput.value = "";
  dateToInput.value = "";
  sortInput.value = "recent";
  renderSessions();
});

controls.querySelector("[data-close-session-dialog]")
  .addEventListener("click", () => sessionDialog.close());

sessionDialog.addEventListener("click", (event) => {
  if (event.target === sessionDialog) sessionDialog.close();
});

renderSessions();
}