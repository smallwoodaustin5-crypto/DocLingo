# DocLingo Web (working prototype)

This is an interactive website prototype. It includes functional navigation, dark/light mode, local history/glossary persistence, text-file import, browser speech recognition/text-to-speech, export, copy, phrasebook translation, and Firebase email/provider auth hooks.

## Start
- Install Node.js
- Copy `.env.example` to `.env` and fill in Firebase Web config values.
- `npm install`
- `npm run dev`

## Firebase
Enable Email/Password, Google, Apple, and Microsoft providers in Firebase Authentication. Add the deployed site domain under Authentication > Settings > Authorized domains. Login is never automatic; auth only happens when the user clicks a login/register/provider button.

## Honest limitations
- Translation is a tiny built-in phrasebook demo, not a real translation engine. Configure a secure backend for Google Cloud Translation or DeepL; do not expose provider secret keys in frontend code.
- Camera/scanner features are deliberately disabled for the website.
- PDF/DOCX/PPTX text extraction and cloud-drive OAuth are placeholders.
- History and glossary are persisted in localStorage. Firebase Auth is wired; Firestore sync is not fully implemented.
