import StoryAPI from '../../data/api.js';

const LoginView = {
  render() {
    return `
      <div class="container auth-form">
        <h1>Login ke StoryMap</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          
          <button type="submit" class="primary-btn">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        
        <div id="loginStatusMessage" class="status-message info" style="display:none;"></div>
      </div>
    `;
  },

  async afterRender() {
    const loginForm = document.querySelector('#loginForm');
    const statusMessage = document.querySelector('#loginStatusMessage');
    
    // Pastikan elemen ditemukan sebelum memasang listener
    if (loginForm && statusMessage) {
        
        // Menampilkan pesan info awal (opsional)
        statusMessage.textContent = 'Masukkan email dan password Anda.';
        statusMessage.style.display = 'block';

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Mencegah form melakukan reload halaman

            // Ambil data form
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            
            // Bersihkan pesan status sebelum proses baru
            statusMessage.textContent = 'Sedang memproses...';
            statusMessage.className = 'status-message info';
            statusMessage.style.display = 'block';

            try {
                // Panggil fungsi API Login
                const response = await StoryAPI.login({ email, password });

                if (response.error) {
                    // Login gagal (error dari API, e.g., password salah)
                    statusMessage.textContent = `Login Gagal: ${response.message}`;
                    statusMessage.className = 'status-message error';
                } else {
                    // Login berhasil
                    statusMessage.textContent = 'Login Berhasil! Mengalihkan ke Beranda...';
                    statusMessage.className = 'status-message success';
                    
                    // Tunggu sebentar sebelum redirect
                    setTimeout(() => {
                        window.location.hash = '/'; // Kunci: Melakukan redirect ke halaman utama
                    }, 500);
                }
            } catch (error) {
                // Error koneksi/jaringan
                statusMessage.textContent = `Terjadi kesalahan saat menghubungi server: ${error.message}`;
                statusMessage.className = 'status-message error';
            }
        });
    } else {
        console.error('Login form atau status message element tidak ditemukan.');
    }
  },
};

export default LoginView;