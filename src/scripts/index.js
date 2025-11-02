// Import CSS (✅ gunakan relative path)
import '../styles/styles.css';

// Import modul utama
import App from './pages/app.js';

// Import helper & service worker
import swRegister from './utils/sw-register.js';
import StoryDB from './data/db-helper.js';

// 🔹 Inisialisasi aplikasi
const app = new App({
  content: document.querySelector('#main-app-content'),
});

// 🔹 Drawer navigation logic
function attachDrawerEvents() {
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');
  const navList = document.querySelector('#nav-list');

  if (!drawerButton || !navigationDrawer || !navList) {
    console.error('❌ Elemen drawer tidak ditemukan di DOM.');
    return;
  }

  drawerButton.addEventListener('click', (event) => {
    navigationDrawer.classList.toggle('open');
    event.stopPropagation();
  });

  navList.addEventListener('click', () => {
    navigationDrawer.classList.remove('open');
  });
}

// 🔹 Update tampilan login/logout
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

      newLogoutButton.addEventListener('click', (e) => {
        e.preventDefault();
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

// 🔹 Listener global
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
