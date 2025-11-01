// src/scripts/utils/sw-register.js (Diperbarui untuk Vite)

const swRegister = {
    async register() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker tidak didukung di browser ini.');
            return;
        }

        try {
            // Menggunakan 'sw.js' sebagai nama file output Service Worker
            await navigator.serviceWorker.register('./sw.js'); 
            console.log('Service Worker berhasil didaftarkan.');
        } catch (error) {
            console.log('Gagal mendaftarkan Service Worker. Error:', error);
        }
    },
};

export default swRegister;