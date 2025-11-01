import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';
import StoryAPI from '../data/api';
import HomeView from './home/home-view';
import HomePresenter from './home/HomePresenter';
import AddView from './add/add-view';
import AddPresenter from './add/AddPresenter';
import LoginView from './login/login-view'; 
import RegisterView from './register/register-view';
import AboutPage from './about/about-page'; 

class App {
    constructor({ content }) {
        this._content = content;
        this._lastView = null; 
    }

    async renderPage() {
        await this._renderPage();
    }

    async _renderPage() {
        const url = UrlParser.getActiveRoute();
        const Page = routes[url];

        // 1. Handle 404
        if (!Page) {
            window.location.hash = '/';
            return;
        }

        // FIX PENTING: Panggil cleanup pada view terakhir sebelum berpindah
        // Ini akan menghapus Leaflet Map yang lama dari DOM dan memori.
        if (this._lastView && typeof this._lastView.cleanup === 'function') {
            this._lastView.cleanup();
        }

        let presenter = null;
        let viewInstance = null;
        let contentToRender = '';

        // 2. Tentukan View Instance dan Presenter (MVP Pattern)
        if (Page === HomeView) {
            viewInstance = new HomeView();
            presenter = new HomePresenter({ view: viewInstance, apiService: StoryAPI });

        } else if (Page === AddView) {
            presenter = new AddPresenter({ view: null, apiService: StoryAPI });
            viewInstance = new AddView(presenter);
            presenter._view = viewInstance;

        } else {
            // View berbasis Object literal (Login, Register, About)
            viewInstance = Page;
        }

        // 3. Logika Rendering dengan View Transition API
        const renderLogic = async () => {
            // Cek render() untuk MVP Views atau Static Views
            if (typeof viewInstance.render === 'function') {
                contentToRender = viewInstance.render();
            } else if (viewInstance.template) { // Jika static view menggunakan properti template
                contentToRender = viewInstance.template;
            } else {
                console.error('View tidak memiliki metode render atau properti template:', viewInstance);
                return;
            }
            
            this._content.innerHTML = contentToRender;

            // Jalankan afterRender (di sini map akan diinisiasi ulang)
            if (typeof viewInstance.afterRender === 'function') {
                await viewInstance.afterRender();
            }

            // Inisialisasi presenter
            if (presenter && typeof presenter.init === 'function') {
                presenter.init();
            }
            
            // Khusus AddView: Resize map setelah DOM di-render (jika ada)
            if (viewInstance instanceof AddView && typeof viewInstance.resizeMap === 'function') {
                viewInstance.resizeMap();
            }
            
            this._lastView = viewInstance;
            this._updateNavigation();
            
            // FIX AKSE: Pindahkan fokus ke elemen utama (untuk Skip Link)
            const mainContent = document.querySelector('#main-content');
            if (mainContent) {
                mainContent.focus(); 
            }
        };

        // FIX PENTING: Implementasi View Transition
        if (document.startViewTransition) {
            document.startViewTransition(renderLogic);
        } else {
            // Fallback untuk browser lama
            await renderLogic();
        }
    }

    // --- Manajemen Navigasi (Logout/Login/Register Link) ---
    _updateNavigation() {
        const isLoggedIn = StoryAPI.isUserLoggedIn();
        const authLinks = document.getElementById('auth-links');
        const logoutContainer = document.getElementById('logout-container');
        const logoutButton = document.getElementById('logout-button');

        if (authLinks && logoutContainer) {
            authLinks.style.display = isLoggedIn ? 'none' : 'block'; 
            logoutContainer.style.display = isLoggedIn ? 'block' : 'none'; 
        }

        if (logoutButton) {
            // FIX: Clone node untuk menghilangkan listener lama dan menghindari double click
            const newLogoutButton = logoutButton.cloneNode(true);
            logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

            newLogoutButton.addEventListener('click', () => {
                StoryAPI.logout();
                window.location.hash = '/login';
                this._updateNavigation();
            });
        }
    }
}

export default App;