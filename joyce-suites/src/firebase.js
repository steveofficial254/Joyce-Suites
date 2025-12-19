import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For Authentication
import { getFirestore } from "firebase/firestore"; // For Database (Roles)
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDEGxTX6FNdvNzifecJlb3m-JZAZ9NHZQw",
  authDomain: "joyce-suites.firebaseapp.com",
  projectId: "joyce-suites",
  storageBucket: "joyce-suites.firebasestorage.app",
  messagingSenderId: "9053217875",
  appId: "1:9053217875:web:86318d2f865ee6133c52a6",
  measurementId: "G-JFL0X3LQSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;