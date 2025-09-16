/**
 * @file idb.js (V2-ready, vanilla)
 * Provides a Promise-based wrapper for IndexedDB and exposes `idb` on window.
 * Required API (per FED V2): openCostsDB, addCost, getReport.
 * - Costs include: sum, currency, category, description
 * - The date attached to each cost is the *add time*
 * - addCost resolves to the newly added cost *object* (sum, currency, category, description)
 *
 * Notes:
 * - We also expose `setRates(rates)` so the app can provide FX rates before calling getReport.
 *   Expected shape: { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 } (example)
 * - We also expose `convert(amount, fromCur, toCur)` so the UI can compute currency-aware pie totals.
 * - You can add more functions (allowed by V2 Q&A).
 */

(function () {
    'use strict';

    const DB_NAME = 'costsdb';
    //const DB_VERSION = 2; //
    const STORE = 'costs';

    // -------- Helpers --------
    function ensureStore(db) {
        if (!db.objectStoreNames.contains(STORE)) {
            const os = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            os.createIndex('byYearMonth', ['createdYear', 'createdMonth'], { unique: false });
            os.createIndex('byCategory', 'category', { unique: false });
        }
    }

    function toISODateOnly(d) {
        // "YYYY-MM-DD"
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function round2(n) {
        return Math.round(Number(n) * 100) / 100;
    }

    function openNativeDB(factory, databaseName, databaseVersion) {
        return new Promise((resolve, reject) => {
            const tryOpen = (ver) => {
                const req = (ver != null) ? factory.open(databaseName || DB_NAME, ver)
                    : factory.open(databaseName || DB_NAME);

                req.onupgradeneeded = () => {
                    const db = req.result;
                    ensureStore(db);
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => {
                    if (req.error && req.error.name === 'VersionError' && ver != null) {
                        // Retry without version → use existing DB version
                        const fallback = factory.open(databaseName || DB_NAME);
                        fallback.onsuccess = () => resolve(fallback.result);
                        fallback.onerror = () => reject(fallback.error);
                    } else {
                        reject(req.error);
                    }
                };
            };

            tryOpen(databaseVersion);
        });
    }


    // -------- Build a DB interface (what openCostsDB resolves to) --------
    function wrapDB(nativeDB) {
        let rates = null; // { USD:1, GBP:1.8, EURO:0.7, ILS:3.4 } – set via setRates()

        function addCost(cost) {
            // V2 requires: { sum:number, currency:string, category:string, description:string }
            const now = new Date();
            const rec = {
                sum: Number(cost?.sum ?? 0),
                currency: String(cost?.currency || 'USD'), // back-compat default
                category: String(cost?.category || ''),
                description: String(cost?.description || ''),
                // V2: the date attached is the add time
                createdAt: now.toISOString(),
                createdYear: now.getFullYear(),
                createdMonth: now.getMonth() + 1, // 1..12
                createdDay: now.getDate(),        // 1..31
                // convenience
                date: toISODateOnly(now),
            };

            return new Promise((resolve, reject) => {
                const tx = nativeDB.transaction(STORE, 'readwrite');
                const store = tx.objectStore(STORE);
                const req = store.add(rec);
                tx.onabort = () => reject(tx.error);
                req.onsuccess = () => {
                    // V2: resolve *the cost object*, not a boolean
                    resolve({
                        sum: rec.sum,
                        currency: rec.currency,
                        category: rec.category,
                        description: rec.description,
                    });
                };
                req.onerror = () => reject(req.error);
            });
        }

        function setRates(r) {
            // App will call this after fetching rates via Settings.
            rates = { ...r };
        }

        function convert(amount, fromCur, toCur) {
            if (!rates || rates[fromCur] == null || rates[toCur] == null) {
                throw new Error('Exchange rates are not set or missing currencies. Call setRates({USD,GBP,EURO,ILS}).');
            }
            // Interpret rates as: 1 <CUR> equals `rates[CUR]` in USD.
            // Convert `amount` from `fromCur` → USD → `toCur`.
            const inUSD = Number(amount) * Number(rates[fromCur]);
            return inUSD / Number(rates[toCur]);
        }

        function getReport(year, month, currency) {
            // V2 signature & return shape (includes costs list with Date:{day}, and total in requested currency)
            year = Number(year);
            month = Number(month);
            const targetCurrency = String(currency || 'USD');

            return new Promise((resolve, reject) => {
                const tx = nativeDB.transaction(STORE, 'readonly');
                const store = tx.objectStore(STORE);
                const idx = store.index('byYearMonth');
                const keyRange = IDBKeyRange.only([year, month]);
                const req = idx.getAll(keyRange);

                req.onsuccess = () => {
                    let items = req.result || [];

                    // Normalize possible V1 records
                    items = items.map((rec) => {
                        const cur = rec.currency || 'USD';
                        const day = rec.createdDay ?? (rec.date ? new Date(rec.date).getDate() : 1);
                        return {
                            sum: Number(rec.sum),
                            currency: cur,
                            category: String(rec.category || ''),
                            description: String(rec.description || ''),
                            Date: { day: Number(day) },
                            __raw: rec, // keep original (not returned)
                        };
                    });

                    // Compute total in requested currency
                    let totalInTarget = 0;
                    try {
                        for (const it of items) {
                            totalInTarget += convert(it.sum, it.currency, targetCurrency);
                        }
                    } catch (e) {
                        reject(e);
                        return;
                    }

                    // Strip internal field without triggering ESLint no-unused-vars
                    const costsOut = items.map((it) => ({
                        sum: it.sum,
                        currency: it.currency,
                        category: it.category,
                        description: it.description,
                        Date: it.Date,
                    }));

                    const report = {
                        year,
                        month,
                        costs: costsOut,
                        total: { currency: targetCurrency, total: round2(totalInTarget) },
                    };

                    resolve(report);
                };

                req.onerror = () => reject(req.error);
            });
        }

        // Expose convert so UI (pie) can use the same validated rates
        return { addCost, getReport, setRates, convert };
    }

    // -------- Public API required by V2 --------
    const idb = {
        /**
         * openCostsDB(databaseName, databaseVersion) → Promise<DBInterface>
         */
        openCostsDB(databaseName, databaseVersion) {
            // Detect factory (do NOT assign to window.indexedDB; it’s a read-only getter)
            const w = /** @type any */ (window);
            const factory = w.indexedDB || w.mozIndexedDB || w.webkitIndexedDB || w.msIndexedDB;

            if (!factory) {
                return Promise.reject('IndexedDB not supported');
            }
            return openNativeDB(factory, databaseName, databaseVersion).then(wrapDB);
        },
    };

    // Expose globally for the vanilla test HTML (as per V2)
    window.idb = idb;
})();
