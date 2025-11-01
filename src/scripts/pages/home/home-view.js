// src/scripts/pages/home/home-view.js

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class HomeView {
    constructor(presenter) {
        this._presenter = presenter;
        this._map = null;
        this._markers = {};
    }

    render() {
        // Pastikan ID di sini konsisten dengan ID di index.html Anda
        return `
            <main id="main-content" class="container">
                <h1 tabindex="0">StoryMap: Cerita di Sekitarmu</h1>

                <div class="notification-container">
                    <h2>Notifikasi Cerita Baru</h2>
                    <p id="notification-status">Status Notifikasi: Belum Berlangganan</p>
                    <button id="subscribe-button" class="primary-btn">Aktifkan Notifikasi</button>
                </div>
                                <div id="status-message" class="status-message" role="status" style="display:none;"></div>
                <div id="loading-indicator" style="text-align:center; display:none;">
                    <p>Memuat cerita...</p>
                </div>
                
                <div id="story-map" style="height: 400px; width: 100%; margin-bottom: 20px;"></div>
                <h2 tabindex="0">Daftar Cerita</h2>
                <div id="story-list" class="story-list">
                                    </div>
            </main>
        `;
    }

    async afterRender() {
        this._initMap();
        this._setupListeners();
        // Panggil metode baru untuk setup notifikasi
        this._setupNotificationListener();
    }

    _initMap() {
        // Hapus map lama jika ada untuk mencegah konflik
        if (this._map) {
            this._map.remove();
        }
        
        // Inisialisasi map baru
        this._map = L.map('story-map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this._map);
        
        this._markers = {};
    }

    _setupNotificationListener() {
        const subscribeButton = document.getElementById('subscribe-button');
        if (subscribeButton) {
            subscribeButton.addEventListener('click', () => {
                // Panggil metode Presenter untuk menangani logika PWA/Notification
                this._presenter.subscribeToNotifications(); 
            });
        }
    }

    _setupListeners() {
        const listContainer = document.getElementById('story-list');
        if (listContainer) {
            listContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('focus-map-btn')) {
                    const id = target.dataset.storyId;
                    const lat = parseFloat(target.dataset.lat);
                    const lon = parseFloat(target.dataset.lon);
                    this._presenter.focusOnStory(id, lat, lon);
                }
            });
        }
    }

    // Metode BARU: untuk memperbarui status notifikasi di UI
    updateNotificationStatus(status) {
        const statusElement = document.getElementById('notification-status');
        const button = document.getElementById('subscribe-button');
        
        if (statusElement) {
            if (status === 'subscribed') {
                statusElement.textContent = 'Status Notifikasi: Berlangganan (Aktif)';
                statusElement.style.color = 'green';
                if (button) {
                    button.textContent = 'Batalkan Langganan';
                    button.classList.add('warning-btn'); // Tambahkan class untuk style berbeda (jika ada)
                    button.classList.remove('primary-btn');
                }
            } else if (status === 'unsubscribed') {
                statusElement.textContent = 'Status Notifikasi: Belum Berlangganan';
                statusElement.style.color = 'red';
                if (button) {
                    button.textContent = 'Aktifkan Notifikasi';
                    button.classList.add('primary-btn');
                    button.classList.remove('warning-btn');
                }
            } else if (status === 'loading') {
                statusElement.textContent = 'Status Notifikasi: Sedang Memproses...';
                statusElement.style.color = 'orange';
            } else {
                statusElement.textContent = `Status Notifikasi: ${status}`;
                statusElement.style.color = 'black';
            }
        }
    }

    displayStories(stories) {
        // ... (metode ini tetap sama)
        const listContainer = document.getElementById('story-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        this._markers = {};

        stories.forEach(story => {
            listContainer.innerHTML += this._createStoryItemTemplate(story);

            if (story.lat && story.lon) {
                const marker = L.marker([story.lat, story.lon])
                    .addTo(this._map)
                    .bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}...`);
                
                this._markers[story.id] = marker;
            }
        });
        
        // Perbaiki tampilan map jika ada perubahan data
        if (this._map) {
            setTimeout(() => {
                this._map.invalidateSize();
            }, 100);
        }
    }

    focusMapOn(id, lat, lon) {
        // ... (metode ini tetap sama)
        if (this._map) {
            this._map.flyTo([lat, lon], 13);
            
            const marker = this._markers[id];
            if (marker) {
                marker.openPopup();
            }
        }
    }

    showLoading(isVisible) {
        // ... (metode ini tetap sama)
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = isVisible ? 'block' : 'none';
        }
    }

    showStatus(type, message) {
        // ... (metode ini tetap sama)
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            statusElement.style.display = 'block';
            setTimeout(() => statusElement.style.display = 'none', 5000);
        }
    }

    _formatDate(isoString) {
        // ... (metode ini tetap sama)
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'Tanggal tidak valid';
        }
    }

    _createStoryItemTemplate(story) {
        // ... (metode ini tetap sama)
        const locationText = story.lat ? 'Lokasi Tersedia' : 'Lokasi Tidak Tersedia';
        const formattedDate = this._formatDate(story.createdAt); 

        return `
            <article class="story-item" tabindex="0">
                <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}">
                <h3>${story.name}</h3>
                
                <p class="story-date">Dibuat: ${formattedDate}</p> 
                <p class="story-location">${locationText}</p>
                <p class="story-description">${story.description ? story.description.substring(0, 100) + '...' : 'Tidak ada deskripsi.'}</p>
                
                ${story.lat ? `<button class="focus-map-btn" data-story-id="${story.id}" data-lat="${story.lat}" data-lon="${story.lon}">Lihat di Peta</button>` : ''}
            </article>
        `;
    }
    
    // FIX PENTING: Metode untuk membersihkan Leaflet Map saat berpindah halaman
    cleanup() {
        if (this._map) {
            this._map.remove(); // Hapus peta dari DOM dan memori
            this._map = null;
        }
        this._markers = {};
        
    }

    resizeMap() {
        if (this._map) {
            this._map.invalidateSize();
        }
    }
}

export default HomeView;