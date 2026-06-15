/**
 * Firebase Config - Smart Home IoT Modern Dashboard
 * Menggunakan Firebase Modular SDK CDN versi 10.12.2
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Konfigurasi Firebase dari akun Anda
const firebaseConfig = {
  apiKey: "AIzaSyBlpIk2pBFCzS-ZNzVwFLzYzgpDnAOV90o",
  authDomain: "aprilfirebase-70d0b.firebaseapp.com",
  // TODO: Silakan ganti URL dibawah ini dengan URL Realtime Database Anda
  // Contoh: "https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app"
  databaseURL: "https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aprilfirebase-70d0b",
  storageBucket: "aprilfirebase-70d0b.firebasestorage.app",
  messagingSenderId: "735646932371",
  appId: "1:735646932371:web:f5b47b4908546e5a4f1c66",
  measurementId: "G-NV8VJ00LJL"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export db agar bisa digunakan di file script.js
export { db };
