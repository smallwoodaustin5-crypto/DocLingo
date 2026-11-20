# DocLingo Web starter

A polished responsive frontend prototype for DocLingo. Includes dark/light mode, navigation, translation workspace, auth modal, glossary, study mode, history, cloud import placeholders, and Firebase SDK wiring.

## Run
1. Install Node.js.
2. Copy `.env.example` to `.env`.
3. Replace Firebase placeholders with your Firebase Web App config.
4. `npm install`
5. `npm run dev`

## Firebase
- Enable Email/Password, Google, Apple, Microsoft in Firebase Authentication.
- Add your deployed domains under Authentication > Settings > Authorized domains.
- This app intentionally does **not** automatically sign users in. Users must click Sign in or Create account.
- Firebase auth actions are wired in `src/App.jsx`; Firebase config is in `src/firebase.js`.

## Not yet connected
Translation/OCR/document parsing, real cloud-drive OAuth, export, billing, sharing, back-translation, confidence scores, and server-side APIs are UI placeholders. Connect secure server functions/APIs before production. Do not put secret API keys in frontend environment variables.
