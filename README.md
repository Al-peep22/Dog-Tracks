DogTracks — Behavior & Training Tracker
DogTracks is a web application designed to help dog owners, trainers, and shelters track training sessions, record behaviors, identify triggers, and visualize long‑term progress. Many owners struggle to stay consistent with training or remember what caused certain behaviors. DogTracks solves this by providing structured logging, multi‑dog profiles, and clear visual insights that reveal patterns over time. Built using modern web technologies and Firebase, the app is lightweight, accessible, and designed for quick, intuitive interaction.

Team Members
- Landon Cardenas
- Kyler Cradic
- Noel Martinson
- Alison Waldsmith

Technologies Used
- HTML, CSS, JavaScript — Front‑end web development
- Firebase — Backend database, authentication, hosting
- JSON — Data formatting and storage
- Node.js — Backend logic and tooling
- Visual Studio Code — Primary development environment
- Git + GitHub — Version control and collaboration

## Project setup

The web application and Firebase project configuration are in `dogtracks_web`.

1. Clone the repository and enter the application folder:

   ```powershell
   git clone <your-repo-url>
   cd <cloned-repository>\dogtracks_web
   ```

2. Install dependencies and run the storage tests:

   ```powershell
   npm install
   npm test
   ```

3. Run Firebase CLI commands from `dogtracks_web`, where `firebase.json`,
`.firebaserc`, and the Data Connect configuration are located.

4. To run the browser application, open `dogtracks_web` in VS Code and serve
   `index.html` with a local web server such as Live Server.