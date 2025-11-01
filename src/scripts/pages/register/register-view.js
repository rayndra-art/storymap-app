import StoryAPI from '../../data/api'; // Pastikan path ini benar

const RegisterView = {
    render() {
        // Tampilan formulir registrasi yang menggunakan class CSS auth-form
        return `
        <div class="container auth-form">
            <h1>Daftar Akun Baru</h1>
            
            <form id="registerForm">
                <div class="form-group">
                    <label for="name">Nama Lengkap</label>
                    <input type="text" id="name" required>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                
                <button type="submit" class="primary-btn">Daftar</button>
            </form>

            <div id="registerStatusMessage" class="status-message info" style="display:none;"></div>

            <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </div>
        `;
    },

    async afterRender() {
        const registerForm = document.querySelector('#registerForm');
        const statusMessage = document.querySelector('#registerStatusMessage');
        
        if (registerForm && statusMessage) {

            registerForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Mencegah form reload halaman
                
                // Ambil nilai input
                const name = document.querySelector('#name').value;
                const email = document.querySelector('#email').value;
                const password = document.querySelector('#password').value;
                
                // Tampilkan status loading
                statusMessage.textContent = 'Sedang mendaftarkan akun...';
                statusMessage.className = 'status-message info';
                statusMessage.style.display = 'block';

                try {
                    // Panggil fungsi register dari api.js
                    const response = await StoryAPI.register({ name, email, password });

                    if (response.error) {
                        // Registrasi gagal (email sudah terdaftar, dll.)
                        statusMessage.textContent = `Registrasi Gagal: ${response.message}`;
                        statusMessage.className = 'status-message error';
                    } else {
                        // Registrasi berhasil
                        statusMessage.textContent = 'Registrasi Berhasil! Silakan Login.';
                        statusMessage.className = 'status-message success';

                        // Redirect ke halaman Login setelah 1 detik
                        setTimeout(() => {
                            window.location.hash = '/login'; 
                        }, 1000);
                    }
                } catch (error) {
                    // Error koneksi/jaringan
                    statusMessage.textContent = `Terjadi kesalahan jaringan: ${error.message}`;
                    statusMessage.className = 'status-message error';
                }
            });
        } else {
            console.error('Register form atau status message element tidak ditemukan.');
        }
    },
};

export default RegisterView;
