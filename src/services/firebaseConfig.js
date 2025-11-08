// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getAnalytics } from "firebase/analytics";

// ✅ Use your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBWPYz03ZgEf5ENPH8cC_hAElUKmdrQzjI",
  authDomain: "ai-learning-platform-c47b2.firebaseapp.com",
  projectId: "ai-learning-platform-c47b2",
  storageBucket: "ai-learning-platform-c47b2.appspot.com",  // 🔥 fix: should end with .appspot.com
  messagingSenderId: "925423842997",
  appId: "1:925423842997:web:2263241c7ca55bc3fa30fc",
  measurementId: "G-73KTZ8R08Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
