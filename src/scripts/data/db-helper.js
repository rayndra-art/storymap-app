// src/scripts/data/db-helper.js

import { openDB } from 'idb';

const DATABASE_NAME = 'storymap-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories'; // Nama Object Store untuk menyimpan data cerita

/**
 * Membuka koneksi ke IndexedDB.
 * Jika database belum ada atau versi di-upgrade, fungsi 'upgrade' akan dijalankan.
 * @returns {Promise<IDBPDatabase>}
 */
const openStoryDB = () => {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      // Membuat Object Store baru jika belum ada
      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        // Gunakan 'id' sebagai primary key (keyPath)
        database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

const StoryDBHelper = {
  /**
   * Mengambil semua cerita dari Object Store.
   * @returns {Promise<Array<Object>>}
   */
  async getAllStories() {
    // Membuka database, lalu memanggil metode getAll() pada Object Store
    return (await openStoryDB()).getAll(OBJECT_STORE_NAME);
  },

  /**
   * Mengambil satu cerita berdasarkan ID.
   * @param {string} id ID cerita.
   * @returns {Promise<Object | undefined>}
   */
  async getStory(id) {
    if (!id) {
      return;
    }
    return (await openStoryDB()).get(OBJECT_STORE_NAME, id);
  },

  /**
   * Menyimpan atau memperbarui data cerita.
   * @param {Object} story Objek cerita yang memiliki properti 'id'.
   * @returns {Promise<string>} ID dari cerita yang disimpan.
   */
  async putStory(story) {
    if (!story.id) {
      console.error('Story must have an ID to be saved in IndexedDB.');
      return;
    }
    // Menggunakan metode 'put' untuk menambahkan atau mengganti data berdasarkan keyPath ('id')
    return (await openStoryDB()).put(OBJECT_STORE_NAME, story);
  },

  /**
   * Menghapus cerita dari Object Store berdasarkan ID.
   * @param {string} id ID cerita yang akan dihapus.
   * @returns {Promise<void>}
   */
  async deleteStory(id) {
    if (!id) {
      return;
    }
    // Menggunakan metode 'delete' untuk menghapus data berdasarkan keyPath ('id')
    return (await openStoryDB()).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryDBHelper;