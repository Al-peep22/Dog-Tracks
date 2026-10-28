import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { loadState } from "./storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7TWP-avTLAy-TlxfZhN-Ck3pR-fp6su0",
  authDomain: "dog-tracks-24243.firebaseapp.com",
  projectId: "dog-tracks-24243",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const trainingRoot = document.querySelector("#training-root");

let state;

try {
  state = await loadState(db);
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
  context.textContent = [
    dogName,
    session.trigger ? `Trigger: ${session.trigger}` : "",
    session.notes || "",
  ].filter(Boolean).join(" · ");

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

  item.append(icon, details, date);
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

renderSessions();