// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "connectnow-89ia8",
  appId: "1:408268586855:web:7c4f84dd62f86af78639c2",
  storageBucket: "connectnow-89ia8.firebasestorage.app",
  apiKey: "AIzaSyBV1kSQSNFAOmEzQH00K1GPd1P0nbXCDCE",
  authDomain: "connectnow-89ia8.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "408268586855"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
