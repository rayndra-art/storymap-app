// src/scripts/pages/home/HomePresenter.js

class HomePresenter {
    constructor({ view, apiService }) {
        this._view = view;
        this._apiService = apiService;
    }

    async init() {
        // ... (Logika inisialisasi pemuatan cerita tetap sama) ...
        if (typeof this._view.showLoading !== 'function' || typeof this._view.displayStories !== 'function') {
            console.error('HomeView does not implement necessary methods (showLoading/displayStories).');
            return;
        }

        try {
            this._view.showLoading(true);

            const stories = await this._apiService.getStories();

            const sortedStories = stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            this._view.displayStories(sortedStories);

            this._view.showStatus('success', 'Data cerita berhasil dimuat.');

        } catch (error) {
            console.error('Gagal memuat cerita:', error);
            
            // --- FIX PENTING: Cek dan Redirect jika Unauthorized ---
            if (error.message.includes('Unauthorized') || error.message.includes('Token tidak ditemukan')) {
                // Tampilkan pesan error dan alihkan ke Login
                this._view.showStatus('error', 'Anda harus login untuk melihat cerita.');
                
                setTimeout(() => {
                    window.location.hash = '/login'; // <--- REDIRECT KE LOGIN
                }, 1000); // Tunggu sebentar sebelum redirect
                
            } else {
                // Error lain (jaringan, server down, dll.)
                this._view.showStatus('error', `Gagal memuat data cerita: ${error.message}`);
            }
        } finally {
            if (typeof this._view.showLoading === 'function') {
                this._view.showLoading(false); 
            }
        }

        // Panggil inisialisasi status notifikasi setelah semua selesai
        this._checkNotificationStatus();
    }

    focusOnStory(id, lat, lon) {
        if (typeof this._view.focusMapOn === 'function') {
            this._view.focusMapOn(id, lat, lon);
        }
    }

    // Metode BARU: Cek status awal notifikasi
    _checkNotificationStatus() {
        // Asumsi ini adalah logika sederhana untuk memeriksa status PWA/Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            this._view.updateNotificationStatus('subscribed');
        } else {
            this._view.updateNotificationStatus('unsubscribed');
        }
    }

    // Metode BARU: Menangani proses langganan/unsubscribe
    async subscribeToNotifications() {
        this._view.updateNotificationStatus('loading');
        
        // 1. Cek Service Worker & Notification API
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
            this._view.updateNotificationStatus('Notifikasi tidak didukung di browser ini');
            this._view.showStatus('error', 'Notifikasi tidak didukung oleh browser Anda.');
            return;
        }

        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            this._view.updateNotificationStatus('Izin ditolak');
            this._view.showStatus('error', 'Izin notifikasi ditolak.');
            return;
        }

        // Logika lengkap untuk langganan/unsubscribe memerlukan kode Service Worker 
        // dan interaksi dengan server (untuk Web Push API), yang di luar konteks ini.
        // Untuk tujuan demonstrasi UI, kita asumsikan sukses/gagal.

        try {
            // Tentukan apakah user ingin subscribe atau unsubscribe (logika sederhana)
            // Ini akan bergantung pada state dari tombol Anda.
            // Untuk sementara, kita hanya simulasi subscribe.
            
            // Logika simulasi subscribe/unsubscribe
            if (this._view._isSubscribed) { // Asumsi ada state _isSubscribed di View
                 // Logika unsubscribe
                 this._view.updateNotificationStatus('unsubscribed');
                 this._view.showStatus('success', 'Langganan notifikasi dibatalkan.');
                 this._view._isSubscribed = false; 

            } else {
                // Logika subscribe
                this._view.updateNotificationStatus('subscribed');
                this._view.showStatus('success', 'Berhasil berlangganan notifikasi!');
                this._view._isSubscribed = true; // Set state
            }
            
        } catch (error) {
            this._view.updateNotificationStatus('unsubscribed');
            this._view.showStatus('error', `Gagal berlangganan: ${error.message}`);
        }
    }
}

export default HomePresenter;