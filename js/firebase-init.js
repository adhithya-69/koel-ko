import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, getDocs, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "koel-and-ko-18",
  appId: "1:5916865570:web:a5109d8a194c00e487067b",
  storageBucket: "koel-and-ko-18.firebasestorage.app",
  apiKey: "AIzaSyA58JDtSqsgf9If7G-dKMcM0TFII56uqog",
  authDomain: "koel-and-ko-18.firebaseapp.com",
  messagingSenderId: "5916865570",
  measurementId: "G-P7GZL9LJYM"
};

const app = initializeApp(firebaseConfig);
window.firebaseDB = getFirestore(app);
window.firestoreSDK = { doc, setDoc, updateDoc, getDocs, getDoc, collection };
window.firebaseReady = true;
document.dispatchEvent(new CustomEvent('firebase-ready'));
