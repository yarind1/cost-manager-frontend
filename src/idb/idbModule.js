/**
 * @file idbModule.js (ESM for React)
 * V2-ready storage (currency + add-time timestamp), while keeping your V1 app API working.
 *
 * Exports (unchanged for your app):
 *   addCost(costData): Promise<number>                 // returns the new record ID (your app expects this)
 *   getCostsForMonth(month, year): Promise<Array<object>>
 *   getCostsForYear(year): Promise<Array<object>>
 *   getLastNItems(n): Promise<Array<object>>
 *   deleteCost(id): Promise<void>
 *
 * Internal changes:
 * - DB bumped to version 2; store records include:
 *   sum, currency, category, description, createdAt (ISO), createdYear, createdMonth (1..12), createdDay (1..31)
 * - We still write a "date" (YYYY-MM-DD) for your existing components that display/sort by date.
 * - If UI doesn't pass currency yet, we default to "USD" (V2's main currency).
 */

const DB_NAME = 'costsdb';      // align with vanilla
const DB_VERSION = 2;           // bumped for new fields
const STORE_NAME = 'costs';

function ensureStore(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const os = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        os.createIndex('byYearMonth', ['createdYear', 'createdMonth'], { unique: false });
        os.createIndex('byCategory', 'category', { unique: false });
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => ensureStore(req.result);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function toISODateOnly(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Adds a cost. If your current UI doesn't supply `currency`, we default to "USD".
 * @param {{ sum:number, category:string, description:string, date?:string, currency?: 'USD'|'ILS'|'GBP'|'EURO' }} costData
 * @returns {Promise<number>} new record ID
 */
export async function addCost(costData) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const now = new Date();
    // If your UI still sends a 'date' string, keep it; else derive today's date-only.
    const uiDate = costData.date || toISODateOnly(now);

    const rec = {
        sum: Number(costData.sum ?? 0),
        currency: String(costData.currency || 'USD'), // default for back-compat with V1 UI
        category: String(costData.category || ''),
        description: String(costData.description || ''),
        createdAt: now.toISOString(),
        createdYear: now.getFullYear(),
        createdMonth: now.getMonth() + 1,
        createdDay: now.getDate(),
        // keep V1-friendly field:
        date: uiDate,
    };

    return new Promise((resolve, reject) => {
        const req = store.add(rec);
        req.onsuccess = () => resolve(req.result); // return ID (keeps app behavior)
        req.onerror = () => reject(req.error);
    });
}

/**
 * Returns all cost records for a given month and year.
 * Uses createdYear/createdMonth when present, and falls back to parsing 'date'.
 */
export async function getCostsForMonth(month, year) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    // Try the index first (fast path)
    let items = await new Promise((resolve, reject) => {
        let arr = [];
        const hasIndex = store.indexNames.contains('byYearMonth');
        if (hasIndex) {
            const idx = store.index('byYearMonth');
            const range = IDBKeyRange.only([Number(year), Number(month)]);
            const req = idx.getAll(range);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        } else {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        }
    });

    // Normalize + fallback filter
    items = items.filter((rec) => {
        const y = rec.createdYear ?? (rec.date ? new Date(rec.date).getFullYear() : null);
        const m = rec.createdMonth ?? (rec.date ? new Date(rec.date).getMonth() + 1 : null);
        return Number(y) === Number(year) && Number(m) === Number(month);
    });

    // Sort ascending by date/time for your UI
    items.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : Date.parse(a.date);
        const tb = b.createdAt ? Date.parse(b.createdAt) : Date.parse(b.date);
        return (ta || 0) - (tb || 0);
    });

    return items;
}

/**
 * Returns all cost records for a given year.
 */
export async function getCostsForYear(year) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const all = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });

    const items = all.filter((rec) => {
        const y = rec.createdYear ?? (rec.date ? new Date(rec.date).getFullYear() : null);
        return Number(y) === Number(year);
    });

    items.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : Date.parse(a.date);
        const tb = b.createdAt ? Date.parse(b.createdAt) : Date.parse(b.date);
        return (ta || 0) - (tb || 0);
    });

    return items;
}

/**
 * Returns the *last* N items added (most recent first).
 */
export async function getLastNItems(n = 15) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const all = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });

    // Sort by createdAt (desc), then by id (desc)
    all.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : Date.parse(a.date);
        const tb = b.createdAt ? Date.parse(b.createdAt) : Date.parse(b.date);
        if (isFinite(ta) && isFinite(tb) && ta !== tb) return tb - ta;
        return (b.id || 0) - (a.id || 0);
    });

    return all.slice(0, n);
}

/**
 * Deletes a record by ID.
 */
export async function deleteCost(id) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const req = store.delete(Number(id));
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
