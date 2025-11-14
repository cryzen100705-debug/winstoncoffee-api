// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Jangan impor analytics jika belum perlu, agar tidak error di Node environment
// import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDba4pISEVpqFrZ3Th_gATySWFfVtBWeUg",
  authDomain: "winstoncoffee-9fe35.firebaseapp.com",
  databaseURL:
    "https://winstoncoffee-9fe35-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "winstoncoffee-9fe35",
  storageBucket: "winstoncoffee-9fe35.appspot.com",
  messagingSenderId: "50957334037",
  appId: "1:50957334037:web:e56358a97e1ed66965c01c",
  measurementId: "G-P0BRVNCFEG",
};

// Inisialisasi Firebase
export const app = initializeApp(firebaseConfig); // 🔹 tambahkan export di sini

// ✅ Firestore
export const db = getFirestore(app);

// ❌ Nonaktifkan sementara analytics agar Firestore selalu aktif
// export let analytics = null;
// isSupported().then((yes) => {
//   if (yes) analytics = getAnalytics(app);
// });
