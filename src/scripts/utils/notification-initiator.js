// src/scripts/utils/notification-initiator.js

import CONFIG from '../config';
import StoryAPI from '../data/api';
import urlB64ToUint8Array from './web-push-helper';

const NotificationInitiator = {
  /**
   * Metode inisiasi utama.
   * @param {Object} args
   * @param {HTMLElement} args.buttonElement Tombol untuk memulai proses subscription.
   * @param {function} args.onSuccess Callback saat proses berhasil.
   * @param {function} args.onError Callback saat terjadi error.
   */
  async init({ buttonElement, onSuccess, onError }) {
    if (!('Notification' in window)) {
      onError('Browser tidak mendukung fitur Notification.');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      onError('Browser tidak mendukung Service Worker.');
      return;
    }

    // 1. Tambahkan listener pada tombol untuk memulai subscription
    buttonElement.addEventListener('click', async () => {
      // Nonaktifkan tombol saat proses dimulai
      buttonElement.disabled = true; 
      await this._requestPermission(onSuccess, onError);
      // Aktifkan kembali (jika gagal) atau tetap nonaktif (jika sukses) akan dihandle di dalam metode
    });
    
    // 2. Cek status subscription saat halaman dimuat
    await this._checkSubscription(buttonElement, onSuccess, onError);
  },

  async _requestPermission(onSuccess, onError) {
    const permission = await Notification.requestPermission();

    if (permission === 'denied') {
      onError('Pengguna tidak mengizinkan notifikasi.');
      return;
    }

    if (permission === 'granted') {
      await this._subscribePushNotification(onSuccess, onError);
    }
  },

  async _subscribePushNotification(onSuccess, onError) {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = CONFIG.VAPID_PUBLIC_KEY;
      // Memanggil helper untuk konversi
      const convertedVapidKey = urlB64ToUint8Array(publicVapidKey);

      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Kirim objek subscription ke API Dicoding
      const token = localStorage.getItem('story_app_token');
      if (!token) {
        // Jika token tidak ada, batalkan subscription lokal
        await subscription.unsubscribe(); 
        onError('Token autentikasi tidak ditemukan. Harap login.');
        return;
      }
      
      // Mengirim subscription ke API
      await StoryAPI.subscribe(subscription, token);
      
      onSuccess('Berhasil berlangganan notifikasi! Anda akan mendapat info story baru.');
      
    } catch (error) {
      console.error('Gagal berlangganan Push Notification:', error);
      onError(`Gagal berlangganan notifikasi: ${error.message}. Pastikan VAPID Key benar.`);
    }
  },

  /**
   * Memeriksa apakah pengguna sudah berlangganan dan memperbarui status tombol.
   * @param {HTMLElement} buttonElement Tombol subscribe.
   * @param {function} onSuccess Callback sukses.
   * @param {function} onError Callback error.
   */
  async _checkSubscription(buttonElement, onSuccess, onError) {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Jika sudah ada subscription
        onSuccess('Anda sudah berlangganan notifikasi.');
        // Menonaktifkan tombol subscribe karena sudah sukses
        buttonElement.disabled = true; 
        buttonElement.textContent = 'Sudah Berlangganan';
      } else {
        // Jika belum ada subscription, pastikan tombol aktif
        buttonElement.disabled = false;
        buttonElement.textContent = 'Berlangganan Notifikasi';
      }
    } catch (error) {
      console.error('Gagal mengecek subscription:', error);
      onError('Gagal mengecek status notifikasi.');
      // Jika terjadi error (misal SW tidak ready), aktifkan tombol
      buttonElement.disabled = false;
    }
  }
};

export default NotificationInitiator;