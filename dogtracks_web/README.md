# DogTracks Web Application

DogTracks is a responsive browser application for dog owners, trainers, and
shelters to track dog profiles and training observations. The current browser
prototype saves profiles and training entries in `localStorage`. Data Connect
configuration and a generated SDK are included, but the prototype does not yet
read or write application data through Data Connect.

## Run locally

1. Install Node.js 20 or newer and the Firebase CLI if you plan to use Firebase.
2. Open `dogtracks_web` in VS Code.
3. Install dependencies and run the storage tests:

   ```powershell
   npm install
   npm test
   ```

4. Serve `index.html` with a local web server such as Live Server. Do not open it
   directly as a `file://` URL; the app uses JavaScript modules and browser
   storage.

Run Firebase CLI commands from this folder. `firebase.json`, `.firebaserc`, and
the Data Connect configuration are all located here.

## Structure

```text
dogtracks_web/
├── dataconnect/                  # Firebase Data Connect schema and connector
├── index.html                    # Browser app shell
├── package.json                  # Dependencies and test command
├── src/
│   ├── app.js                    # UI rendering and interactions
│   ├── storage.js                # Browser-local data operations
│   └── dataconnect-generated/    # Generated Data Connect JavaScript SDK
├── styles.css                    # Theme and responsive styles
└── test/
    └── storage.test.js           # Storage logic tests
```
