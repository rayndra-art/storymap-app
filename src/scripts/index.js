// src/scripts/index.js

// ✅ FIX 1 — Import runtime TANPA ekstensi ".js"
// Vite sudah otomatis mencari ekstensi JS
import 'regenerator-runtime/runtime';

// ✅ FIX 2 — Import CSS
import '../styles/styles.css';

// ✅ FIX 3 — Import modul utama
import App from './pages/app.js'; // tambahkan ".js" kalau file app.js memang pakai ekstensi

// ✅ FIX 4 — Service Worker & DB Helper
import swRegister from './utils/sw-register.js';
import StoryDB from './data/db-helper.js';

// 1️⃣ Inisialisasi APP
const app = new App({
  content: document.querySelector('#main-app-content'),
});

// 2️⃣ Drawer Logic
function attachDrawerEvents() {
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');
  const navList = document.querySelector('#nav-list');

  if (drawerButton && navigationDrawer && navList) {
    drawerButton.addEventListener('click', (event) => {
      navigationDrawer.classList.toggle('open');
      event.stopPropagation();
    });

    navList.addEventListener('click', () => {
      navigationDrawer.classList.remove('open');
    });
  } else {
    console.error('❌ Drawer elements not found in DOM.');
  }
}

// 3️⃣ Auth UI Logic
function updateAuthUI() {
  const token = localStorage.getItem('story_app_token');

  const authLinks = document.querySelector('#auth-links');
  const logoutContainer = document.querySelector('#logout-container');
  const logoutButton = document.querySelector('#logout-button');

  if (token) {
    if (authLinks) authLinks.style.display = 'none';
    if (logoutContainer) logoutContainer.style.display = 'list-item';

    if (logoutButton) {
      const newLogoutButton = logoutButton.cloneNode(true);
      logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

      newLogoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('story_app_token');
        window.location.hash = '#/';
        updateAuthUI();
      });
    }
  } else {
    if (authLinks) authLinks.style.display = 'list-item';
    if (logoutContainer) logoutContainer.style.display = 'none';
  }
}

// 4️⃣ Global Listeners
window.addEventListener('hashchange', () => {
  app.renderPage();
  updateAuthUI();
});

window.addEventListener('load', () => {
  StoryDB.init();
  app.renderPage();
  attachDrawerEvents();
  updateAuthUI();
  swRegister.register();
});
