
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmpQMQrL7MCsjtf9pB0pCu4aw6QCqZ-Q4",
  authDomain: "doclingo-85b13.firebaseapp.com",
  projectId: "doclingo-85b13",
  storageBucket: "doclingo-85b13.firebasestorage.app",
  messagingSenderId: "314066605804",
  appId: "1:314066605804:web:e173df07610d961245b7c9",
  measurementId: "G-JNRVLY6HJK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics = null;

if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
