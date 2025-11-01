import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class AddView {
    constructor(presenter) {
        this._presenter = presenter;
        this._map = null;
        this._marker = null;
        this._videoStream = null;
        this._activeInput = 'file'; // State: 'file' atau 'camera'
    }

    render() {
        // Menggunakan ID "main-content" untuk konsistensi di dalam View
        return `
            <main id="main-content" class="container"> 
                <h1 tabindex="0">Bagikan Cerita Barumu</h1>
                
                <div id="status-message" class="status-message" role="status" style="display:none;"></div>

                <form id="addStoryForm" class="add-form">
                    
                    <div class="form-group">
                        <label for="description">Deskripsi Cerita *</label>
                        <textarea id="description" rows="5" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>Pilih Lokasi (Opsional)</label>
                        <p class="info-text">Klik di peta untuk menentukan koordinat.</p>
                        <div id="map-mini" style="height: 300px; width: 100%;"></div>
                        <input type="hidden" id="latitude" name="lat">
                        <input type="hidden" id="longitude" name="lon">
                    </div>

                    <div class="form-group">
                        <label>Unggah Gambar Cerita *</label>
                        <div class="input-toggle">
                            <button type="button" id="toggleFileBtn" class="primary-btn">Pilih File</button>
                            <button type="button" id="toggleCameraBtn" class="primary-btn">Ambil Gambar</button>
                        </div>
                        
                        <button type="button" id="cancelCameraBtn" class="primary-btn" style="display:none; margin-top: 10px;">Batalkan Ambil Gambar</button>
                        
                        <input type="file" id="photo" accept="image/*" required style="display:block;">

                        <video id="cameraFeed" autoplay style="display:none; width: 100%; max-height: 400px;"></video>
                        <canvas id="photoCanvas" style="display:none; width: 100%; max-height: 400px;"></canvas>

                        <button type="button" id="takePhotoBtn" class="primary-btn" style="display:none; margin-top: 10px;">Ambil Foto</button>

                    </div>

                    <button type="submit" class="primary-btn" style="margin-top: 20px;">Kirim Cerita</button>
                </form>
            </main>
        `;
    }

    async afterRender() {
        this._initMap();
        this._initListeners();
    }

    _initMap() {
        // Pastikan Map container sudah ada sebelum inisialisasi
        const mapElement = document.getElementById('map-mini');
        if (!mapElement) return;

        this._map = L.map('map-mini').setView([-6.2088, 106.8456], 13); // Default ke Jakarta

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this._map);

        this._map.on('click', (e) => {
            this._placeMarker(e.latlng.lat, e.latlng.lng);
        });

        // Posisikan marker di pusat peta saat pertama kali dimuat (opsional)
        // this._placeMarker(-6.2088, 106.8456); 
    }

    _placeMarker(lat, lon) {
        if (this._marker) {
            this._map.removeLayer(this._marker);
        }
        
        this._marker = L.marker([lat, lon]).addTo(this._map)
            .bindPopup(`Lokasi: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
            .openPopup();
            
        // Update input hidden
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;
    }

    _initListeners() {
        const form = document.getElementById('addStoryForm');
        const toggleFileBtn = document.getElementById('toggleFileBtn');
        const toggleCameraBtn = document.getElementById('toggleCameraBtn');
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const photoInput = document.getElementById('photo');
        
        // FIX BARU: Dapatkan tombol batal
        const cancelCameraBtn = document.getElementById('cancelCameraBtn'); 

        // Listener Submit Form
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });

        // Listener Tombol Toggle File
        toggleFileBtn.addEventListener('click', () => {
            this._resetCameraInput(); // Pastikan kamera di-reset saat pindah ke input file
        });

        // Listener Tombol Toggle Camera
        toggleCameraBtn.addEventListener('click', () => {
            this._startCamera();
        });

        // FIX BARU: Listener Tombol Batalkan Ambil Gambar
        cancelCameraBtn.addEventListener('click', () => {
            this._resetCameraInput();
        });

        // Listener Ambil Foto
        takePhotoBtn.addEventListener('click', () => {
            this._takePhoto();
        });
        
        // Listener untuk preview foto yang diupload
        photoInput.addEventListener('change', () => {
            if (photoInput.files && photoInput.files[0]) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(photoInput.files[0]);
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.marginTop = '10px';
                
                const existingPreview = document.getElementById('file-preview');
                if (existingPreview) existingPreview.remove();

                img.id = 'file-preview';
                photoInput.parentNode.insertBefore(img, photoInput.nextSibling);
            }
        });
    }

    async _startCamera() {
        const cameraFeed = document.getElementById('cameraFeed');
        const photoInput = document.getElementById('photo');
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const toggleFileBtn = document.getElementById('toggleFileBtn');
        const toggleCameraBtn = document.getElementById('toggleCameraBtn');
        const cancelCameraBtn = document.getElementById('cancelCameraBtn'); // FIX

        // Cek jika browser mendukung kamera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showStatus('error', 'Kamera tidak didukung oleh browser ini.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Sembunyikan Input File, tampilkan Video Feed & Tombol Ambil Foto
            photoInput.style.display = 'none';
            photoInput.required = false;
            if (document.getElementById('file-preview')) document.getElementById('file-preview').remove();

            cameraFeed.srcObject = stream;
            cameraFeed.style.display = 'block';
            takePhotoBtn.style.display = 'block';
            
            toggleFileBtn.style.display = 'none';
            toggleCameraBtn.style.display = 'none';
            
            // FIX BARU: Tampilkan tombol batal
            cancelCameraBtn.style.display = 'block'; 

            this._videoStream = stream;
            this._activeInput = 'camera';

        } catch (err) {
            console.error("Gagal mengakses kamera: ", err);
            this.showStatus('error', 'Gagal mengakses kamera. Pastikan izin kamera diberikan.');
            this._resetCameraInput(); // Reset ke input file jika gagal
        }
    }

    _stopCamera() {
        if (this._videoStream) {
            this._videoStream.getTracks().forEach(track => track.stop());
            this._videoStream = null;
        }
    }

    // FIX BARU: Fungsi untuk mereset input dan tampilan saat tombol Batal diklik
    _resetCameraInput() {
        this._stopCamera();
        
        // Elemen
        const photoInput = document.getElementById('photo');
        const cameraFeed = document.getElementById('cameraFeed');
        const photoCanvas = document.getElementById('photoCanvas');
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const toggleFileBtn = document.getElementById('toggleFileBtn');
        const toggleCameraBtn = document.getElementById('toggleCameraBtn');
        const cancelCameraBtn = document.getElementById('cancelCameraBtn');

        // 1. Kembalikan ke Input File
        photoInput.style.display = 'block';
        photoInput.required = true;
        photoInput.value = ''; // Reset input file

        // 2. Sembunyikan elemen kamera/canvas/tombol foto/tombol batal
        cameraFeed.style.display = 'none';
        photoCanvas.style.display = 'none';
        takePhotoBtn.style.display = 'none';
        cancelCameraBtn.style.display = 'none';
        
        // 3. Tampilkan kembali tombol toggle
        toggleFileBtn.style.display = 'block';
        toggleCameraBtn.style.display = 'block';
        
        this._activeInput = 'file'; 
    }

    _takePhoto() {
        const cameraFeed = document.getElementById('cameraFeed');
        const photoCanvas = document.getElementById('photoCanvas');
        const takePhotoBtn = document.getElementById('takePhotoBtn');

        if (cameraFeed.style.display === 'block') {
            // Atur ukuran canvas sesuai dengan video feed
            photoCanvas.width = cameraFeed.videoWidth;
            photoCanvas.height = cameraFeed.videoHeight;
            
            const context = photoCanvas.getContext('2d');
            context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);

            // Sembunyikan video, tampilkan canvas (foto)
            cameraFeed.style.display = 'none';
            photoCanvas.style.display = 'block';

            // Ganti teks tombol: Ambil Ulang vs Ambil Foto
            takePhotoBtn.textContent = 'Ambil Ulang Foto';
            
            // Hentikan stream kamera setelah foto diambil (memenuhi saran reviewer)
            this._stopCamera(); 

        } else if (photoCanvas.style.display === 'block') {
            // Jika sudah ada foto (canvas tampil), kembali ke mode kamera (ambil ulang)
            photoCanvas.style.display = 'none';
            
            // Mulai ulang kamera
            this._startCamera(); 
            
            takePhotoBtn.textContent = 'Ambil Foto';
        }
    }

    _getPhotoBlobFromCanvas() {
        const canvas = document.getElementById('photoCanvas');
        if (canvas.style.display === 'block') {
            // Jika canvas berisi gambar (sudah diambil), konversi ke Blob
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/jpeg');
            });
        }
        return null; // Tidak ada foto yang diambil
    }

    _handleSubmit() {
        const description = document.getElementById('description').value;
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        let photoFile = null;

        if (this._activeInput === 'file') {
            photoFile = document.getElementById('photo').files[0];
        } else if (this._activeInput === 'camera') {
            photoFile = this._getPhotoBlobFromCanvas(); // Dapatkan Blob dari Canvas jika pakai kamera
        }
        
        // Cek jika photoFile valid
        if (!photoFile && this._activeInput === 'file' && document.getElementById('photo').required) {
             this.showStatus('error', 'Foto wajib diisi (Pilih File).');
             return;
        }
        if (!photoFile && this._activeInput === 'camera') {
             this.showStatus('error', 'Foto wajib diisi (Ambil Foto).');
             return;
        }

        // Kirim data ke Presenter
        this._presenter.submitStory({
            description,
            photoFile,
            lat,
            lon
        });
    }


    showStatus(type, message) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            statusElement.style.display = 'block';
            setTimeout(() => statusElement.style.display = 'none', 5000);
        }
    }
    
    resizeMap() {
        if (this._map) {
            this._map.invalidateSize();
        }
    }

    // Metode penting yang dipanggil oleh router saat berpindah halaman
    cleanup() {
        this._stopCamera(); // FIX: Pastikan kamera dihentikan saat pindah halaman
        if (this._map) {
            this._map.remove(); // Hapus peta dari DOM dan memori
            this._map = null;
        }
    }
}

export default AddView;