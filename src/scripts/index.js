// src/scripts/index.js

import 'regenerator-runtime/runtime'; 
import '../styles/styles.css';
import App from './pages/app'; 

// Import pendaftar Service Worker
import swRegister from './utils/sw-register'; 


// 1. Inisiasi APP dan Kontainer Konten
const app = new App({
  // Menggunakan ID wrapper utama dari index.html
  content: document.querySelector('#app-content'), 
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
    app.renderPage();
    attachDrawerEvents(); 
    
    // Panggil di awal untuk menampilkan status awal
    updateAuthUI(); 
    
    // KODE KRITIS: Daftarkan Service Worker
    swRegister.register();
});