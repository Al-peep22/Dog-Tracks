# DogTracks

DogTracks is a browser-based dog training journal for owners and trainers. It
provides dog profiles, training-session records, an overview of a user's dogs,
and charts for reviewing training activity. The active web application is in
[`dogtracks_web`](./dogtracks_web/).

## What the site can do

- Sign up with Firebase Authentication, verify an email address, and sign in.
- Create dog profiles with a name, birthday, optional passing date, breed or
  breed mix, profile picture, color, and notes.
- Add up to three breeds to a dog. The overview counts a dog under each of its
  selected breeds; adding a fourth breed saves the profile as **Mutt**.
- Record training entries for a dog, including a behavior or activity and
  optional trigger and notes.
- Browse dog profiles, ages, training summaries, and breed distribution on the
  Dogs Overview page. Owners can edit a dog's name, breeds, birthday, picture,
  and color there.
- Review and filter training sessions on the Training Log page.
- View training trends by dog and behavior on the Analytics page.
- Archive a dog as a memorial profile by recording its date of passing. Archived
  profiles and their training history remain available in read-only mode.

## Run the web app locally

### Requirements

- A modern browser with internet access (the app loads Firebase browser modules
  and Chart.js from CDNs).
- A local static web server. Do not open the HTML files as `file://` URLs:
  JavaScript modules need to be served over HTTP.
- To run the Node tests: Node.js 20 or newer and npm.

### Start a local server

Open a terminal in `dogtracks_web` and start a static server. For example, if
Python is installed:

```powershell
cd dogtracks_web
python -m http.server 8000
```

Or open `dogtracks_web` in VS Code and use the Live Server extension. Then visit
`http://localhost:8000` (or the URL shown by Live Server). The main journal is
`index.html`.

The web app connects to the DogTracks Firebase project configured in its
JavaScript modules. To use a different Firebase project, update the Firebase
configuration consistently in the app modules and configure Authentication,
Firestore, and the required security rules for that project. Do not put
server-side credentials in browser code.

## Using the site

1. On the main page, choose **Sign In**. Create an account if needed and verify
   your email using the link Firebase sends you.
2. Choose **+ Add Dog** to create a profile. Enter the dog's name and birthday;
   the breed, picture, theme color, passing date, and notes are optional.
3. Use **Add another breed** for a mix. Three breed selections are retained and
   counted separately; a fourth or more is recorded as **Mutt**.
4. Select a dog and add training entries from its profile. Behavior/activity is
   required; trigger and notes are optional.
5. Use the dashboard links to open **Dogs Overview**, **Training Log**, and
   **Analytics**. In Dogs Overview, choose **Edit profile** to update profile
   details and appearance. Choose **Open** on a dog card to open that dog's
   profile on the main page.
6. To preserve a dog's profile and journal after its passing, record a passing
   date and use the Memorial Archives view. Archived profiles are read-only.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Main journal | [`index.html`](./dogtracks_web/index.html) | Sign-in, dog profiles, and training journal |
| Dogs Overview | [`dogs-overview.html`](./dogtracks_web/dogs-overview.html) | Dog cards, profile editing, ages, and breed distribution |
| Training Log | [`training-log.html`](./dogtracks_web/training-log.html) | Search, filter, sort, and review sessions |
| Analytics | [`analytics.html`](./dogtracks_web/analytics.html) | Training timeline, behavior frequency, and weekly activity |
| Legacy statistics prototype | [`statistics.html`](./dogtracks_web/statistics.html) | Earlier standalone localStorage-based prototype; separate from the active Firebase-backed app |

## Project layout

```text
Dog-Tracks/
├── README.md
├── dogtracks_web/
│   ├── index.html                 # Main journal and add-dog dialog
│   ├── dogs-overview.html         # Dog overview and profile editor
│   ├── training-log.html          # Training session search and filters
│   ├── analytics.html             # Training charts
│   ├── statistics.html            # Legacy standalone prototype
│   ├── styles.css                 # Shared styles
│   ├── src/
│   │   ├── app.js                 # Main journal and Firebase auth flow
│   │   ├── dog-overview.js        # Overview, profile editing, Firestore sync
│   │   ├── training.js            # Training Log page
│   │   ├── analytics.js           # Analytics charts
│   │   ├── storage.js             # Firestore data operations
│   │   └── breed-picker.js        # Breed suggestions and mix handling
│   ├── test/                      # Node tests
│   └── dataconnect/               # Data Connect schema and example connector
├── dataconnect/                   # Root-level Data Connect configuration
├── src/dataconnect-generated/     # Generated Data Connect SDK
└── dog_tracks/                    # Android/IDE scaffold; no Dart app source is present
```

## Firebase and Data Connect

The active web pages use Firebase Authentication and Cloud Firestore directly.
The Firebase web configuration is in the page modules under `dogtracks_web/src`.
Firebase CLI configuration and the Data Connect schema/example connector are
also included. Data Connect is not the active web app's data path; the current
pages read and write the `Users`, `Dogs`, and `Sessions` Firestore collections.

The `dog_tracks` directory contains Android and IDE scaffold files, but no
Flutter `pubspec.yaml` or Dart application source. It is not currently a
standalone runnable Flutter app.

## Tests

From `dogtracks_web`, install the Node development dependencies and run the test
script:

```powershell
npm install
npm test
```

The focused breed-picker tests can also be run with:

```powershell
node --test test/breed-picker.test.js
```

`npm test` runs every `node:test` file. The storage tests currently import
Firebase modules from `https://www.gstatic.com`; Node's default ESM loader does
not load HTTPS imports, so that part of the suite requires a browser-compatible
test setup.

## Team

- Landon Cardenas
- Kyler Cradic
- Noel Martinson
- Alison Waldsmith
