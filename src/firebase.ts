// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "winchester-budget",
  appId: "1:314259165471:web:6084c57d4ef1d7dff5202a",
  storageBucket: "winchester-budget.firebasestorage.app",
  apiKey: "AIzaSyDayATrt99qhkzci8cUg0pd_3Z_523JKSs",
  authDomain: "winchester-budget.firebaseapp.com",
  messagingSenderId: "314259165471"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
