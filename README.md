# DocLingo GitHub Pages files

These files are a static GitHub Pages-friendly starter with Firebase Email/Password, Google sign-in, Phone SMS authentication, a signed-in welcome dashboard, and random language/country facts.

## Install
1. Add/replace `index.html`, `style.css`, `main.js`, and `firebase-config.js` in the root of your `doclingo2` branch.
2. In `firebase-config.js`, replace `PASTE_API_KEY`, `PASTE_MESSAGING_SENDER_ID`, and `PASTE_APP_ID` with the Web App config from Firebase Console > Project settings > Your apps.
3. In Firebase Authentication > Sign-in method, enable Email/Password, Google, and Phone.
4. Authentication > Settings: add `smallwoodaustin5-crypto.github.io` to Authorized domains.
5. For phone auth, enable Phone and use reCAPTCHA. For testing, configure test phone numbers in Firebase Auth.
6. In Firestore, create a database and add rules. The client writes a basic `users/{uid}` profile document after login. Suggested starting rules:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Notes
- GitHub Pages deployment is static; the relative script and stylesheet paths work under `/DocLingo/`.
- Firebase web config values are not server secrets. Security comes from Authentication and Firestore Security Rules. Do not put private service-account keys in this repository.
- The translation panel is UI-only and does not call a translation provider yet.
- After committing, wait for GitHub Pages to deploy and refresh with Ctrl+Shift+R.
