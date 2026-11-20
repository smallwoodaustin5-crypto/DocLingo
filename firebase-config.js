
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmpQMQrL7MCsjtf9pB0pCu4aw6QCq-Z4",
  authDomain: "doclingo-85b13.firebaseapp.com",
  projectId: "doclingo-85b13",
  storageBucket: "doclingo-85b13.firebasestorage.app",
  messagingSenderId: "314066605804",
  appId: "1:314066605804:web:e173df07610d961245b7c9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
