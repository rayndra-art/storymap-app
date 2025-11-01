// src/scripts/data/api.js

const API_ENDPOINT = 'https://story-api.dicoding.dev/v1';
const LOCAL_STORAGE_KEY = 'dicoding_story_token'; // Kunci penyimpanan token

const StoryAPI = {
  // 1. FUNGSI REGISTER
  async register({ name, email, password }) {
    try {
      const response = await fetch(`${API_ENDPOINT}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error('API ERROR (REGISTER):', error.message);
      return {
        error: true,
        message: `Gagal melakukan registrasi: ${error.message}`,
      };
    }
  },

  // 2. FUNGSI LOGIN: Menyimpan Token ke Local Storage
  async login({ email, password }) {
    try {
      const response = await fetch(`${API_ENDPOINT}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (!responseJson.error) {
        // Menyimpan Token setelah Login Berhasil
        const token = responseJson.loginResult.token;
        localStorage.setItem(LOCAL_STORAGE_KEY, token);
      }

      return responseJson;
    } catch (error) {
      console.error('API ERROR (LOGIN):', error.message);
      return {
        error: true,
        message: `Gagal melakukan login: ${error.message}`,
      };
    }
  },

  // 3. FUNGSI LOGOUT
  logout() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },

  // 4. FUNGSI GET STORIES: Mengambil Token dan Menggunakannya
  async getStories() {
    try {
      // Mengambil Token dari Local Storage
      const token = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!token) {
        throw new Error('Unauthorized: Token tidak ditemukan.');
      }

      // Menggunakan token untuk otentikasi
      const response = await fetch(`${API_ENDPOINT}/stories?location=1`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.listStory;
    } catch (error) {
      console.error('API ERROR (GET STORIES):', error.message);
      throw new Error(`Gagal mengambil data cerita: ${error.message}`);
    }
  },

  // 5. FUNGSI ADD STORY (Dibutuhkan untuk Tambah Cerita)
  async addStory(formData) {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!token) {
        throw new Error('Unauthorized: Token tidak ditemukan. Harap login.');
      }

      const response = await fetch(`${API_ENDPOINT}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Tidak perlu set 'Content-Type' untuk FormData
        },
        body: formData, // Mengirim FormData (yang berisi file gambar)
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('API ERROR (ADD STORY):', error.message);
      return {
        error: true,
        message: error.message
      };
    }
  },

  // 6. FUNGSI UNTUK BERLANGGANAN WEB PUSH NOTIFICATION (NEW)
  /**
   * Mengirim objek PushSubscription ke server untuk berlangganan notifikasi.
   * @param {PushSubscription} subscription Objek yang dihasilkan oleh pushManager.subscribe().
   * @param {string} token Token autentikasi user.
   */
  async subscribe(subscription, token) {
    // Ambil data endpoint, p256dh, dan auth dari objek subscription
    const subscriptionData = subscription.toJSON();
    const {
      endpoint,
      keys
    } = subscriptionData;
    const {
      p256dh,
      auth
    } = keys;

    const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Kirim Token yang dilewatkan
      },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth
      }),
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson.message;
  },

  // 7. FUNGSI PEMBANTU: Cek Status Login
  isUserLoggedIn() {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY);
  },
};

export default StoryAPI;