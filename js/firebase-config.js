// StyleIQ - Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCv3jBUoTMvPBIqrwlDKSALfhKBV9eAkBY",
  authDomain: "styleiq-le50314.firebaseapp.com",
  projectId: "styleiq-le50314",
  storageBucket: "styleiq-le50314.firebasestorage.app",
  messagingSenderId: "388956763756",
  appId: "1:388956763756:web:29bcbe8c27108357748a49"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);


// Export services
export {
    app,
    auth,
    db
};
