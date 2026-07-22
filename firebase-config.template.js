// firebase-config.template.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase 설정값 (Vercel 환경 변수로 빌드 타임에 주입됨)
const firebaseConfig = {
  apiKey: "%%FIREBASE_API_KEY%%",
  authDomain: "%%FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%FIREBASE_PROJECT_ID%%",
  storageBucket: "%%FIREBASE_STORAGE_BUCKET%%",
  messagingSenderId: "%%FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%FIREBASE_APP_ID%%"
};

// Cloudinary 설정값 (Vercel 환경 변수로 빌드 타임에 주입됨)
export const CLOUDINARY_CONFIG = {
  cloudName: "%%CLOUDINARY_CLOUD_NAME%%",
  uploadPreset: "%%CLOUDINARY_UPLOAD_PRESET%%"
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
