import StoryAPI from '../../data/api'; 

class AddPresenter {
    constructor({ view, apiService }) {
        this._view = view;
        this._apiService = apiService;

        // --- FIX PENTING: Cek Login saat inisialisasi Presenter ---
        if (!this._apiService.isUserLoggedIn()) {
            // Pastikan view memiliki showStatus sebelum memanggilnya
            if (this._view && typeof this._view.showStatus === 'function') {
                this._view.showStatus('error', 'Anda harus login untuk membagikan cerita.');
            }
            setTimeout(() => { 
                window.location.hash = '/login'; // <--- REDIRECT SAAT INIT
            }, 1000);
        }
    }

    // Metode utama yang dipanggil oleh AddView saat form disubmit
    async submitStory({ description, photoFile, lat, lon }) {
        // 1. Cek Autentikasi (Pengecekan di sini tetap perlu untuk berjaga-jaga)
        if (!this._apiService.isUserLoggedIn()) {
            this._view.showStatus('error', 'Anda harus login untuk membagikan cerita.');
            setTimeout(() => { window.location.hash = '/login'; }, 1000);
            return;
        }

        // 2. Validasi Data
        if (!description || !photoFile) {
            this._view.showStatus('error', 'Deskripsi dan Foto wajib diisi.');
            return;
        }
        
        // 3. Persiapan FormData
        const formData = new FormData();
        formData.append('description', description);
        
        // Cek jika photoFile adalah Promise (dari kamera), tunggu hingga resolve
        if (photoFile instanceof Promise) {
            photoFile = await photoFile;
        }
        
        // photoFile bisa berupa Blob (dari kamera) atau File (dari input file)
        formData.append('photo', photoFile);

        // Tambahkan lokasi jika ada
        if (lat && lon) {
            formData.append('lat', lat);
            formData.append('lon', lon);
        }

        // 4. Kirim ke API
        this._view.showStatus('info', 'Sedang mengunggah cerita, mohon tunggu...');
        try {
            const response = await this._apiService.addStory(formData);

            if (response.error) {
                // Error dari API
                this._view.showStatus('error', `Gagal Tambah Cerita: ${response.message}`);
            } else {
                // Sukses
                this._view.showStatus('success', 'Cerita berhasil ditambahkan!');
                
                // Redirect ke halaman utama
                setTimeout(() => {
                    window.location.hash = '/';
                }, 1500);
            }
        } catch (error) {
            // Error jaringan atau error dari API (misalnya token expired)
            this._view.showStatus('error', `Terjadi kesalahan: ${error.message}`);
        }
    }
}

export default AddPresenter;