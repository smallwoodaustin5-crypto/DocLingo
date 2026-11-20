import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmpQMQrL7MCsjtf9pB0pCu4aw6QCqZ-Q4",
  authDomain: "doclingo-85b13.firebaseapp.com",
  projectId: "doclingo-85b13",
  storageBucket: "doclingo-85b13.firebasestorage.app",
  messagingSenderId: "314066605804",
  appId: "1:314066605804:web:e173df07610d961245b7c9",
  measurementId: "G-JNRVLY6HJK"
};

export const configured = !!(
  c.apiKey &&
  !c.apiKey.includes("PASTE_") &&
  c.appId &&
  !c.appId.includes("PASTE_")
);

export const app = configured ? initializeApp(c) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
