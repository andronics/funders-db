import { openDB } from 'idb';

const DB_NAME = 'funders-db';
const DB_VERSION = 1;
const STORE_NAME = 'funders';
const META_STORE = 'meta';

/**
 * Open the funders database, creating stores if needed
 */
export async function openFundersDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Funders store with id as key
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      // Meta store for version/timestamp
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    },
  });
}

/**
 * Get all funders from IndexedDB
 */
export async function getAllFunders(db) {
  return db.getAll(STORE_NAME);
}

/**
 * Get count of funders in IndexedDB
 */
export async function getFundersCount(db) {
  return db.count(STORE_NAME);
}

/**
 * Save a batch of funders to IndexedDB
 */
export async function saveFundersBatch(db, funders) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...funders.map(f => tx.store.put(f)),
    tx.done
  ]);
}

/**
 * Get the stored data version
 */
export async function getDataVersion(db) {
  return db.get(META_STORE, 'version');
}

/**
 * Set the data version
 */
export async function setDataVersion(db, version) {
  return db.put(META_STORE, version, 'version');
}

/**
 * Clear all funders from the store
 */
export async function clearFunders(db) {
  return db.clear(STORE_NAME);
}
