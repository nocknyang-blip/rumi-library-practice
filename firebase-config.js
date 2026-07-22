// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Firebase 설정값을 여기에 붙여넣으세요.
const firebaseConfig = {
  apiKey: "AIzaSyDZTm6qxFiDh--aTMCrHx51snchnUTg7sY",
  authDomain: "rumi-library-23b2a.firebaseapp.com",
  projectId: "rumi-library-23b2a",
  storageBucket: "rumi-library-23b2a.firebasestorage.app",
  messagingSenderId: "377660803375",
  appId: "1:377660803375:web:52433a4e8d1401ec2579da"
};

// TODO: Cloudinary 설정값을 여기에 입력하세요.
export const CLOUDINARY_CONFIG = {
  cloudName: "jmfzubc1",
  uploadPreset: "rumi_uploads" // Unsigned preset
};

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 초기화 에러. 설정값을 확인해주세요:", error);
}

export { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc };
