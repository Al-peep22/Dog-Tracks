# DogTracks Web Application

DogTracks is a responsive browser application for dog owners, trainers, and shelters to track dog profiles and training observations. This starter uses semantic HTML, responsive CSS, vanilla JavaScript ES modules, and browser `localStorage`; it has no framework or runtime dependencies.

## Run locally

1. Install a current Node.js LTS release (Node 20 or newer) and Git. Install Visual Studio Code if it is not already available.
2. Open this `dogtracks_app` folder in VS Code.
3. Install the **Live Server** VS Code extension, then right-click `index.html` and choose **Open with Live Server**. This serves JavaScript modules over HTTP at a local address such as `http://127.0.0.1:5500`.
4. Use the app in a current browser. Sample profiles are loaded on first run; profiles and entries you add are saved in that browser on that device.
5. Run the storage logic tests from this folder:

   ```powershell
   npm test
   ```

No `npm install` is required: the tests use Node's built-in test runner and the app uses no external packages. Do not open the page directly as a `file://` URL; ES modules and browser storage should be tested from a local web server.

## Structure

```text
dogtracks_app/
├── index.html           # Semantic page shell, accessible forms, dialog
├── styles.css           # Theme, responsive layout, component styles
├── src/
│   ├── app.js            # DOM rendering and user interactions
│   └── storage.js        # Data model operations and localStorage boundary
├── test/
│   └── storage.test.js   # Node tests for profile/session storage logic
├── package.json          # Node test command; no runtime dependencies
└── README.md
```

The browser prototype supports sample dog profiles, adding/deleting profiles, logging training entries with optional trigger and notes, profile history, and overview counts. Data is local to the browser; authentication, cross-device sync, Firebase, charts, goals, reminders, and image upload are not implemented.

See [../AWaldsmith_AIMarkdown.md](../AWaldsmith_AIMarkdown.md) for the new-hire onboarding and development guide.