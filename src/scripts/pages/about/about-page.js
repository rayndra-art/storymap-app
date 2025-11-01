import NotificationInitiator from '../../utils/notification-initiator';

const AboutPage = {
  render() {
    // FIX PENTING: Mengganti ID "mainContent" menjadi "main-content"
    // (sesuai dengan ID di index.html dan file View lain yang Anda berikan)
    return `
      <main id="main-content" class="container">
        <h1 tabindex="0">Halaman About</h1>
        <p>StoryMap adalah sebuah aplikasi web yang memungkinkan pengguna untuk berbagi dan menemukan cerita yang terikat pada lokasi geografis tertentu. Ini adalah wadah digital di mana kenangan, pengalaman, atau informasi dapat diabadikan dan ditampilkan langsung pada sebuah peta interaktif.</p>
        
        <section class="notification-section">
            <h2>🔔 Notifikasi Cerita Baru</h2>
            <p id="notification-status" class="status-message">Mengecek status notifikasi...</p>
            
            <button id="subscribe-button" class="primary-btn">
                Berlangganan Notifikasi
            </button>
            <p class="info-text">Anda akan menerima notifikasi jika ada cerita baru yang dibagikan.</p>
        </section>

      </main>
    `;
  },

  async afterRender() {
    // 1. Ambil elemen tombol dan status
    const button = document.getElementById('subscribe-button');
    const status = document.getElementById('notification-status');

    if (button && status) {
      // 2. Inisiasi NotificationInitiator
      NotificationInitiator.init({
        buttonElement: button,
        onSuccess: (message) => {
          status.textContent = message;
          status.className = 'status-message success'; // Tambahkan class untuk styling sukses
        },
        onError: (message) => {
          status.textContent = message;
          status.className = 'status-message error'; // Tambahkan class untuk styling error
          // Pastikan tombol diaktifkan kembali jika gagal agar bisa dicoba lagi
          button.disabled = false; 
          button.textContent = 'Berlangganan Notifikasi';
        },
      });
    }
  },
};

export default AboutPage;