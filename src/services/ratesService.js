const RATES_KEY = 'cm_rates';
const RATES_URL_KEY = 'cm_rates_url';
const REQUIRED = ['USD', 'ILS', 'GBP', 'EURO'];

export function getSavedRates() {
    try { return JSON.parse(localStorage.getItem(RATES_KEY) || 'null'); }
    catch { return null; }
}
export function saveRates(obj) {
    localStorage.setItem(RATES_KEY, JSON.stringify(obj));
}
export function getRatesURL() {
    return localStorage.getItem(RATES_URL_KEY) || '';
}
export function saveRatesURL(url) {
    localStorage.setItem(RATES_URL_KEY, url || '');
}

function validateRates(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('Invalid rates JSON');
    for (const k of REQUIRED) {
        if (typeof obj[k] !== 'number' || !isFinite(obj[k])) {
            throw new Error(`Missing/invalid rate: ${k}`);
        }
    }
}

export async function fetchRates(url) {
    if (!url) throw new Error('Rates URL is empty');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Rates fetch failed: ${res.status}`);
    const data = await res.json();
    validateRates(data);
    saveRates(data);
    return data;
}
