// src/scripts/index.js

// FIX KRITIS #1: Tambahkan ekstensi .js untuk mengatasi Rollup/Vite bare module import error
import 'regenerator-runtime/runtime.js'; 

import './src/styles/styles.css';
import App from './pages/app'; 

// Import pendaftar Service Worker
import swRegister from './utils/sw-register'; 
import StoryDB from './data/db-helper'; // NEW: Import DB Helper Anda


// 1. Inisiasi APP dan Kontainer Konten
const app = new App({
  // FIX KRITIS #2: Pastikan ID ini konsisten dengan tag <main> di index.html
  // Di index.html Anda menggunakan <main id="main-app-content">, maka kita gunakan ID itu.
  content: document.querySelector('#main-app-content'), 
});


// 2. Fungsi Logika Drawer 
function attachDrawerEvents() {
    const drawerButton = document.querySelector('#drawer-button');
    const navigationDrawer = document.querySelector('#navigation-drawer');
    const navList = document.querySelector('#nav-list');

    if (drawerButton && navigationDrawer) {
        console.log('Drawer elements found. Attaching listeners.');
        // Buka/Tutup Drawer saat tombol ☰ diklik
        drawerButton.addEventListener('click', (event) => {
            navigationDrawer.classList.toggle('open');
            event.stopPropagation();
        });

        // Tutup Drawer saat link navigasi diklik
        navList.addEventListener('click', () => {
            navigationDrawer.classList.remove('open');
        });
    } else {
        console.error('Drawer elements not found in DOM.');
    }
}


// ===============================================
// BARU: FUNGSI UNTUK MANAJEMEN AUTENTIKASI UI
// ===============================================
function updateAuthUI() {
    // Kunci Token Anda
    const token = localStorage.getItem('story_app_token'); 
    
    const authLinks = document.querySelector('#auth-links'); // Login | Register
    const logoutContainer = document.querySelector('#logout-container');
    const logoutButton = document.querySelector('#logout-button');

    if (token) {
        // User Sudah Login: Sembunyikan Login, Tampilkan Logout
        if (authLinks) authLinks.style.display = 'none';
        if (logoutContainer) logoutContainer.style.display = 'list-item';
        
        // Tambahkan Listener Logout
        if (logoutButton) {
            // Hapus listener lama jika ada
            const newLogoutButton = logoutButton.cloneNode(true);
            logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

            newLogoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('story_app_token');
                // Arahkan ke homepage dan update UI
                window.location.hash = '#/';
                updateAuthUI(); 
            });
        }
    } else {
        // User Belum Login: Tampilkan Login, Sembunyikan Logout
        if (authLinks) authLinks.style.display = 'list-item';
        if (logoutContainer) logoutContainer.style.display = 'none';
    }
}


// 3. Listener Global
window.addEventListener('hashchange', () => {
    app.renderPage();
    // Panggil setiap kali halaman berubah
    updateAuthUI(); 
});

window.addEventListener('load', () => {
    // Panggil untuk inisiasi IndexedDB di awal
    StoryDB.init(); 

    app.renderPage();
    attachDrawerEvents(); 
    
    // Panggil di awal untuk menampilkan status awal
    updateAuthUI(); 
    
    // KODE KRITIS: Daftarkan Service Worker
    swRegister.register();
});