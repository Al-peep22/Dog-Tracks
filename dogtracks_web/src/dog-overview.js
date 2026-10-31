
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteField,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { authenticateDatabaseUser, extractId } from "./storage.js";
import {
  countBreedOccurrences,
  getBreedSelection,
  initializeBreedPickers,
  setBreedSelection,
} from "./breed-picker.js";

// ---------- 1b. FIREBASE INIT (same project/config as app.js and analytics.js) ----------

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

// Authorized admin email addresses (same list as app.js)
const ADMIN_EMAILS = ["dogtracksadmin@dogtracks.com", "admin@dogtracks.com"];

function checkIsAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === String(email).trim().toLowerCase());
}

// ---------- 2. STATE & CONSTANTS ----------

// Active user: Firebase Auth user (admin) or a Users-collection record
let currentUser = null;

// Firestore listener handles + raw caches
let unsubDogs = null;
let unsubSessions = null;
let rawDogs = [];
let rawSessions = [];

// Default accent colors (a dog without a chosen Color gets one based on its id)
const PALETTE = ["#315f4e", "#b77a34", "#587080", "#94684c", "#71814f", "#725e43", "#6c8f7f", "#a35d4e"];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
initializeBreedPickers();

// ---------- 3. HELPERS ----------

// Accepts Firestore Timestamps, "YYYY-MM-DD" strings, ISO strings, or Dates
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d); // local date, avoids timezone off-by-one
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ageInMonths(dob, now = new Date()) {
  const b = toDate(dob);
  if (!b) return null;
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(months, 0);
}

function formatAge(months) {
  if (months === null) return "Age unknown";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}

function formatDate(date) {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function dateInputValue(value) {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Enter a valid birthday.");
  const [yearText, monthText, dayText] = match.slice(1);
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error("Enter a valid birthday.");
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date > today) {
    throw new Error("Birthday cannot be in the future.");
  }
  return date;
}

// Stable default color per dog so colors don't shift when dogs are added/removed
function defaultColor(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

const dogColor = (dog) => dog.Color || defaultColor(dog.id);

function isAdmin() {
  return checkIsAdmin(currentUser?.email);
}

// Regular users see their own dogs; admins can see the full roster.
function visibleDogs() {
  if (!currentUser) return [];
  return rawDogs
    .filter((dog) => isAdmin() || extractId(dog.OwnerId) === currentUser.uid)
    .sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
}

// Only admins and a dog's owner may open it in the journal or customize it
function canManage(dog) {
  return isAdmin() || extractId(dog.OwnerId) === currentUser?.uid;
}

// Per-dog stats derived from the Sessions collection
function statsForDog(dogId) {
  const sessions = rawSessions.filter((s) => extractId(s.DogId) === dogId);
  const times = sessions.map((s) => toDate(s.OccurredAt)).filter(Boolean);
  const last = times.length ? new Date(Math.max(...times.map((t) => t.getTime()))) : null;
  const skills = new Set(
    sessions.map((s) => String(s.Behavior || "").trim().toLowerCase()).filter(Boolean)
  );
  return { sessions: sessions.length, lastTrained: last, skills: skills.size };
}

function breedCounts(dogs) {
  return countBreedOccurrences(dogs);
}

function setAvatar(avatarEl, { name, color, photo }) {
  avatarEl.style.setProperty("--dog-color", color);
  const img = $(".dog-avatar-img", avatarEl);
  const initial = $(".dog-avatar-initial", avatarEl);
  initial.textContent = (name || "?").charAt(0).toUpperCase();
  if (photo) {
    img.src = photo;
    img.hidden = false;
    initial.hidden = true;
  } else {
    img.removeAttribute("src");
    img.hidden = true;
    initial.hidden = false;
  }
}

// Crop to a centered square and downscale to a small JPEG data URL
// (keeps the Dogs document far below Firestore's 1 MB limit)
function resizeImage(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const size = Math.min(max, side);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- 4. RENDERERS ----------

function renderOverallStats(dogs) {
  const ages = dogs.map((d) => ageInMonths(d.DateOfBirth)).filter((a) => a !== null);
  const avg = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  const dogIds = new Set(dogs.map((d) => d.id));
  const sessions = rawSessions.filter((s) => dogIds.has(extractId(s.DogId))).length;
  const breeds = breedCounts(dogs).length;

  // [icon glyph, label, value] rendered with the journal's .stat-card
  const tiles = [
    ["♧", isAdmin() ? "All dogs in database" : "Your dogs", dogs.length],
    ["◔", "Average age", avg === null ? "—" : formatAge(avg)],
    ["✓", "Training entries", sessions],
    ["✦", "Breeds", breeds],
  ];

  $("#overall-stats-grid").replaceChildren(
    ...tiles.map(([icon, label, value]) => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `<span class="stat-icon" aria-hidden="true"></span>
        <div><p class="stat-value"></p><p class="stat-label"></p></div>`;
      $(".stat-icon", card).textContent = icon;
      $(".stat-value", card).textContent = value;
      $(".stat-label", card).textContent = label;
      return card;
    })
  );
}

function renderDogCards(dogs) {
  const grid = $("#dog-grid");
  const template = $("#dog-card-template");

  if (!dogs.length) {
    grid.innerHTML = `<p class="empty-state">No dog profiles yet. Add one from the journal.</p>`;
    return;
  }

  grid.replaceChildren(
    ...dogs.map((dog) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const color = dogColor(dog);
      const stats = statsForDog(dog.id);

      card.dataset.dogId = dog.id;
      card.style.setProperty("--dog-color", color);
      setAvatar($(".dog-avatar", card), { name: dog.Name, color, photo: dog.PhotoDataUrl });

      $(".dog-name", card).textContent = dog.Name || "Unnamed";
      $(".dog-breed", card).textContent = dog.Breed || "Breed not specified";
      $(".dog-age", card).textContent = formatAge(ageInMonths(dog.DateOfBirth));

      $('[data-stat="sessions"]', card).textContent = stats.sessions;
      $('[data-stat="last-trained"]', card).textContent = formatDate(stats.lastTrained);
      $('[data-stat="skills"]', card).textContent = stats.skills;

      // index.html reads ?dog=<id> (see the note about app.js)
      $('[data-action="open"]', card).href = `./index.html?dog=${encodeURIComponent(dog.id)}`;

      // The journal only lists a user's own dogs, so only owners/admins get actions
      if (!canManage(dog)) $(".dog-card-actions", card).remove();

      return card;
    })
  );
}

function renderAgeTimeline(dogs) {
  const chart = $("#timeline-chart");
  const rows = dogs
    .map((dog) => ({ dog, color: dogColor(dog), months: ageInMonths(dog.DateOfBirth) }))
    .filter((r) => r.months !== null)
    .sort((a, b) => b.months - a.months);

  if (!rows.length) {
    chart.replaceChildren();
    return;
  }

  const maxYears = Math.max(Math.ceil(Math.max(...rows.map((r) => r.months)) / 12), 1);

  const els = rows.map(({ dog, color, months }) => {
    const row = document.createElement("div");
    row.className = "timeline-row";

    const name = document.createElement("span");
    name.className = "timeline-name";
    name.textContent = dog.Name || "Unnamed";

    const track = document.createElement("div");
    track.className = "timeline-track";

    const bar = document.createElement("div");
    bar.className = "timeline-bar";
    bar.style.setProperty("--dog-color", color);
    bar.style.width = `${(months / (maxYears * 12)) * 100}%`;
    bar.textContent = formatAge(months);

    track.append(bar);
    row.append(name, track);
    return row;
  });

  // Axis: birth (0) to the oldest dog's age, in whole years
  const axis = document.createElement("div");
  axis.className = "timeline-axis";
  const step = Math.max(1, Math.ceil(maxYears / 5));
  for (let y = 0; y <= maxYears; y += step) {
    const tick = document.createElement("span");
    tick.textContent = `${y} yr`;
    axis.append(tick);
  }

  chart.replaceChildren(...els, axis);
}

function renderBreedDistribution(dogs) {
  const chart = $("#breed-chart");
  const legend = $("#breed-legend");
  const counts = breedCounts(dogs);
  const total = counts.reduce((sum, [, count]) => sum + count, 0);

  if (!total) {
    chart.style.background = "";
    chart.dataset.total = "0";
    legend.replaceChildren();
    return;
  }

  // Donut via conic-gradient
  let acc = 0;
  const stops = counts.map(([, n], i) => {
    const start = (acc / total) * 100;
    acc += n;
    const end = (acc / total) * 100;
    return `${PALETTE[i % PALETTE.length]} ${start}% ${end}%`;
  });
  chart.style.background = `conic-gradient(${stops.join(", ")})`;
  chart.dataset.total = String(counts.length);
  chart.setAttribute(
    "aria-label",
    "Breed distribution, counting mixed-breed dogs under each selected breed: " +
      counts.map(([b, n]) => `${b} ${n}`).join(", ")
  );

  legend.replaceChildren(
    ...counts.map(([breed, n], i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="breed-swatch"></span><span class="breed-name"></span><span class="breed-count"></span>`;
      $(".breed-swatch", li).style.background = PALETTE[i % PALETTE.length];
      $(".breed-name", li).textContent = breed;
      $(".breed-count", li).textContent = `${n} (${Math.round((n / total) * 100)}%)`;
      return li;
    })
  );
}

// Signed-out notice shown in place of the sections
function ensureSignedOutNotice() {
  let notice = $("#signed-out-notice");
  if (!notice) {
    notice = document.createElement("p");
    notice.id = "signed-out-notice";
    notice.className = "loading-state";
    notice.textContent = "Please sign in to view your dogs.";
    $(".welcome").after(notice);
  }
  return notice;
}

function renderAll() {
  const signedIn = Boolean(currentUser);
  ensureSignedOutNotice().hidden = signedIn;
  $$("#dog-overview-root section, #dog-overview-root .overview-split").forEach(
    (el) => (el.hidden = !signedIn)
  );

  // Eyebrow mirrors the journal: role + email
  $("#overview-eyebrow").textContent = signedIn
    ? `${isAdmin() ? "★ ADMINISTRATOR" : "LOGGED IN AS"}: ${currentUser.email}`
    : "♧ THE WHOLE PACK";
  if (!signedIn) return;

  const dogs = visibleDogs();
  $("#dog-count").textContent = dogs.length;
  renderOverallStats(dogs);
  renderDogCards(dogs);
  renderAgeTimeline(dogs);
  renderBreedDistribution(dogs);
}

// ---------- 5. FIRESTORE SYNC ----------

function showDataError(message) {
  $("#dog-grid").innerHTML = `<p class="error-panel"></p>`;
  $("#dog-grid .error-panel").textContent = message;
}

function startSync() {
  stopSync();
  unsubDogs = onSnapshot(
    collection(db, "Dogs"),
    (snap) => {
      rawDogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderAll();
    },
    (err) => showDataError(`Dogs query error: ${err.message}`)
  );
  unsubSessions = onSnapshot(
    collection(db, "Sessions"),
    (snap) => {
      rawSessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderAll();
    },
    (err) => showDataError(`Sessions query error: ${err.message}`)
  );
}

function stopSync() {
  if (unsubDogs) unsubDogs();
  if (unsubSessions) unsubSessions();
  unsubDogs = unsubSessions = null;
  rawDogs = [];
  rawSessions = [];
}

// ---------- 6. SESSION / AUTH ----------

const authBtn = $("#auth-btn");
const authDialog = $("#auth-dialog");
const loginForm = $("#login-form");
const signupForm = $("#signup-form");
const tabLogin = $("#tab-login-btn");
const tabSignup = $("#tab-signup-btn");

function signedIn(user) {
  currentUser = user;
  authBtn.textContent = "Log Out";
  authDialog.open && authDialog.close();
  startSync();
  renderAll();
}

function signedOut() {
  currentUser = null;
  authBtn.textContent = "Sign In";
  stopSync();
  renderAll();
}

function showAuthTab(which) {
  const login = which === "login";
  loginForm.style.display = login ? "" : "none";
  signupForm.style.display = login ? "none" : "";
  tabLogin.className = `button ${login ? "button-primary" : "button-quiet"}`;
  tabSignup.className = `button ${login ? "button-quiet" : "button-primary"}`;
  for (const t of [tabLogin, tabSignup]) {
    t.style.flex = "1";
    t.style.minHeight = "34px";
    t.style.fontSize = "12px";
  }
}

authBtn.addEventListener("click", async () => {
  if (currentUser) {
    // Firebase Auth users (admin) sign out of Firebase; database users just clear the saved session
    if (!currentUser.isDatabaseUser) await signOut(auth);
    localStorage.removeItem("dogtracks_db_user");
    signedOut();
  } else {
    showAuthTab("login");
    authDialog.showModal();
  }
});

tabLogin.addEventListener("click", () => showAuthTab("login"));
tabSignup.addEventListener("click", () => showAuthTab("signup"));
$$("[data-close-auth]").forEach((btn) => btn.addEventListener("click", () => authDialog.close()));

// Dual-mode login: Firebase Auth (admin) first, then the Users collection
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged takes it from here
  } catch {
    try {
      const dbUser = await authenticateDatabaseUser(db, email, password);
      if (dbUser) {
        localStorage.setItem("dogtracks_db_user", JSON.stringify(dbUser));
        signedIn(dbUser);
        loginForm.reset();
        return;
      }
      window.alert("Invalid email or password. Please check your credentials.");
    } catch (dbError) {
      console.error("Database user check failed:", dbError);
      window.alert(`Login error: ${dbError.message}`);
    }
  }
});

// Sign up creates a Firebase Auth account and requires email verification
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("#signup-name").value.trim();
  const email = $("#signup-email").value.trim();
  const password = $("#signup-password").value;

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    localStorage.setItem(`pending_signup_${email.toLowerCase()}`, JSON.stringify({
      name,
      email,
      password,
    }));
    await signOut(auth);
    signupForm.reset();
    showAuthTab("login");
    window.alert(
      `Verification email sent to ${email}!\n\nPlease check your inbox and click the verification link before logging in.`
    );
  } catch (error) {
    console.error("Sign up error:", error);
    if (error.code === "auth/invalid-email") {
      window.alert("Invalid Email: Please check the spelling of your email address.");
    } else if (error.code === "auth/email-already-in-use") {
      window.alert("An account already exists with this email address. Please log in instead.");
    } else {
      window.alert(`Sign up failed: ${error.message}`);
    }
  }
});

// Same restore logic as app.js: Firebase Auth user, else a saved database user
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.removeItem("dogtracks_db_user");
    signedIn(user);
    return;
  }
  if (!currentUser || !currentUser.isDatabaseUser) {
    const saved = localStorage.getItem("dogtracks_db_user");
    if (saved) {
      try {
        signedIn(JSON.parse(saved));
        return;
      } catch {
        localStorage.removeItem("dogtracks_db_user");
      }
    }
    signedOut();
  }
});

// ---------- 7. EDIT PROFILE DIALOG ----------

const customizeDialog = $("#customize-dialog");
const customizeForm = $("#customize-form");
const customizeName = $("#customize-name");
const customizeBreedFields = $("#customize-breed").closest("[data-breed-fields]");
const customizeBirthday = $("#customize-birthday");
const customizeColor = $("#customize-color");
const customizePhoto = $("#customize-photo");
const previewAvatar = $("#customize-preview-avatar");

// undefined = photo unchanged, null = remove it, string = new data URL
let pendingPhoto;
let editingDogId = null;
customizeBirthday.max = dateInputValue(new Date());

function editingDog() {
  return rawDogs.find((d) => d.id === editingDogId) || null;
}

function refreshPreview() {
  const dog = editingDog();
  if (!dog) return;
  setAvatar(previewAvatar, {
    name: customizeName.value.trim() || dog.Name,
    color: customizeColor.value || dogColor(dog),
    photo: pendingPhoto === undefined ? dog.PhotoDataUrl : pendingPhoto,
  });
}

function openCustomize(dogId) {
  const dog = rawDogs.find((d) => d.id === dogId);
  if (!dog || !canManage(dog)) return;
  editingDogId = dogId;
  pendingPhoto = undefined;
  customizePhoto.value = "";

  $("#customize-dog-name").textContent = dog.Name || "dog";
  $("#customize-dog-id").value = dog.id;
  customizeName.value = dog.Name || "";
  setBreedSelection(customizeBreedFields, dog.Breed || "");
  customizeBirthday.value = dateInputValue(dog.DateOfBirth);
  customizeColor.value = dogColor(dog);
  refreshPreview();
  customizeDialog.showModal();
}

customizePhoto.addEventListener("change", async () => {
  const file = customizePhoto.files?.[0];
  if (!file) return;
  try {
    pendingPhoto = await resizeImage(file);
    refreshPreview();
  } catch (err) {
    console.error("Could not read image:", err);
    window.alert("Sorry, that image could not be loaded.");
  }
});

customizeColor.addEventListener("input", refreshPreview);
customizeName.addEventListener("input", () => {
  $("#customize-dog-name").textContent = customizeName.value.trim() || "dog";
  refreshPreview();
});

$("#customize-remove-photo").addEventListener("click", () => {
  pendingPhoto = null;
  customizePhoto.value = "";
  refreshPreview();
});

customizeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!editingDogId) return;

  const name = customizeName.value.trim();
  if (!name) {
    window.alert("Enter a name for the dog.");
    customizeName.focus();
    return;
  }

  try {
    const patch = {
      Name: name,
      Breed: getBreedSelection(customizeBreedFields),
      Color: customizeColor.value,
      DateOfBirth: customizeBirthday.value
        ? Timestamp.fromDate(dateFromInput(customizeBirthday.value))
        : deleteField(),
    };
    if (pendingPhoto === null) patch.PhotoDataUrl = deleteField();
    else if (pendingPhoto !== undefined) patch.PhotoDataUrl = pendingPhoto;

    // The snapshot listener re-renders the cards once Firestore confirms
    await updateDoc(doc(db, "Dogs", editingDogId), patch);
    customizeDialog.close();
  } catch (err) {
    console.error("Save failed:", err);
    window.alert(`Could not save changes: ${err.message}`);
  }
});

$$("[data-close-customize]").forEach((btn) =>
  btn.addEventListener("click", () => customizeDialog.close())
);

// Event delegation for each card's Customize button
$("#dog-grid").addEventListener("click", (event) => {
  const btn = event.target.closest('[data-action="customize"]');
  if (btn) openCustomize(btn.closest(".dog-card").dataset.dogId);
});

// ---------- 8. INIT ----------
renderAll();

// Tells the page's diagnostic script that startup finished
window.__overviewReady = true;