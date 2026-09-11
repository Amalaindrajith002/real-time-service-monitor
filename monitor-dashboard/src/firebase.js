import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ඔයා කොපි කරගත්ත config එක මේකට දාන්න
const firebaseConfig = {
  apiKey: "AIzaSyBF2_O09ej8d2rT7ECu-_pUVOdB4UXkJq0",
  authDomain: "server-monitor-dashboard-785e5.firebaseapp.com",
  projectId: "server-monitor-dashboard-785e5",
  storageBucket: "server-monitor-dashboard-785e5.firebasestorage.app",
  messagingSenderId: "370706923479",
  appId: "1:370706923479:web:59567f4762025b819ed592",
  measurementId: "G-GGEYZR72JX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);