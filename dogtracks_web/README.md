# DogTracks Web Application

The active DogTracks application is a multi-page browser app for managing dog
profiles and training journals. It uses Firebase Authentication for accounts
and Cloud Firestore for dog profiles and training sessions. See the repository
[README](../README.md) for a project overview and site usage instructions.

## Run locally

The app uses browser JavaScript modules and Firebase modules loaded from Google
CDNs. Serve this folder over HTTP; opening `index.html` directly as a `file://`
URL will not work.

With Python installed, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` and sign in. Alternatively, open this folder
in VS Code and serve `index.html` with the Live Server extension.

The web modules contain the Firebase web-app configuration for the DogTracks
project. Running against another Firebase project requires changing the
configuration consistently and setting up Firebase Authentication, Firestore,
and appropriate security rules. The browser app does not use Data Connect for
its current data operations.

## Pages

- `index.html` — account sign-in, dog profiles, training journal, and memorial
  archives.
- `dogs-overview.html` — dog cards, profile editing, age summaries, and breed
  distribution.
- `training-log.html` — searchable, filterable, sortable training sessions.
- `analytics.html` — training timeline, behavior frequency, and weekly activity
  charts.
- `statistics.html` — an earlier localStorage-based prototype, separate from
  the active Firebase-backed pages.

## Breed selections

The main-page add-dog form and Dogs Overview profile editor share
`src/breed-picker.js`. Users can choose from breed suggestions or enter custom
breeds and mixes, and add up to three breed selections. The Dogs Overview counts
a dog under each selected breed. A fourth selection or more is stored as
`Mutt`.

## Source layout

```text
dogtracks_web/
├── index.html
├── dogs-overview.html
├── training-log.html
├── analytics.html
├── statistics.html
├── styles.css
├── package.json
├── src/
│   ├── app.js
│   ├── dog-overview.js
│   ├── training.js
│   ├── analytics.js
│   ├── storage.js
│   ├── breed-picker.js
│   └── dataconnect-generated/
├── test/
└── dataconnect/
```

## Tests

Install dependencies and run all Node tests:

```powershell
npm install
npm test
```

Run the breed-picker tests alone with:

```powershell
node --test test/breed-picker.test.js
```

The storage tests import Firebase modules from Google CDN URLs. Node's default
ESM loader does not support HTTPS imports, so the complete test suite currently
requires a browser-compatible test setup.

## Firebase Data Connect

Firebase Data Connect schema and example connector files are included in
`dataconnect/`, along with a generated SDK under `src/dataconnect-generated/`.
They are not currently used by the active web pages, which read and write
Firestore directly.
