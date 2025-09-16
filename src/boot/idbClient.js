import '../idb/idb.js'; // ensure window.idb is defined

import { getSavedRates } from '../services/ratesService';

let dbPromise = null;

export function getDB() {
    if (!dbPromise) {
        dbPromise = (async () => {
            const db = await window.idb.openCostsDB('costsdb', 2);
            const rates = getSavedRates();
            if (rates) {
                try { db.setRates(rates); } catch {}
            }
            return db;
        })();
    }
    return dbPromise;
}

export async function applyLatestRatesToDB() {
    const db = await getDB();
    const rates = getSavedRates();
    if (rates) db.setRates(rates);
}
