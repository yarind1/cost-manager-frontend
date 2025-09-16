/**
 * @file ReportPage.jsx
 * Displays a table + pie chart for a single month/year.
 * Currency-aware via vanilla idb.js getReport(year, month, currency).
 */

import { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { getDB } from '../boot/idbClient';
import { getSavedRates } from '../services/ratesService';

import MonthYearControls from '../components/MonthYearControls';
import CostsTable from '../components/CostsTable';
import CategoryPieChart from '../components/CategoryPieChart';

// Map month names → numbers (1..12)
const MONTH_MAP = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
function toMonthNumber(val) {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    const s = String(val);
    if (/^\d+$/.test(s)) return Number(s);
    const key = s.toLowerCase();
    return MONTH_MAP[key] || null;
}

const pad2 = (n) => String(n).padStart(2, '0');
function withDate(year, month, items) {
    return items.map((c) => ({
        ...c,
        date: `${year}-${pad2(month)}-${pad2(c?.Date?.day ?? 1)}`,
    }));
}

/**
 * Helper: build category totals from a report in the requested currency.
 */
async function buildCategoryTotalsFromReport(rep, db) {
    const target = rep.total?.currency || 'USD';
    const catMap = new Map();
    for (const item of rep.costs) {
        const val = db.convert(item.sum, item.currency, target);
        catMap.set(item.category, (catMap.get(item.category) || 0) + Number(val || 0));
    }
    return Array.from(catMap.entries()).map(([category, value]) => ({
        category,
        total: Math.round(value * 100) / 100,
    }));
}

function ReportPage() {
    const now = new Date();
    const defaultMonth = now.getMonth() + 1;
    const defaultYearDate = new Date(now.getFullYear(), 0, 1);

    // Filters
    const [month, setMonth] = useState(defaultMonth);
    const [yearDate, setYearDate] = useState(defaultYearDate);

    // Data
    const [costs, setCosts] = useState([]);
    const [chartData, setChartData] = useState([]);

    // Currency selection
    const [currency, setCurrency] = useState('USD');

    // Error banner
    const [error, setError] = useState('');

    // Limit year selection to current year or earlier
    const currentYear = now.getFullYear();
    const maxYearDate = new Date(currentYear, 11, 31);

    /** Load the current selection using vanilla idb.js getReport */
    const fetchReportData = async () => {
        setError('');
        if (!yearDate) return;

        const rates = getSavedRates();
        if (!rates) {
            setCosts([]);
            setChartData([]);
            setError('No exchange rates found. Go to Settings and fetch rates (USD, ILS, GBP, EURO).');
            return;
        }

        const yearNum = yearDate.getFullYear();
        const db = await getDB();

        try {
            const monthNum = toMonthNumber(month);
            if (!monthNum) {
                setError('Invalid month selection.');
                return;
            }
            const rep = await db.getReport(yearNum, monthNum, currency);
            setCosts(withDate(yearNum, monthNum, rep.costs));
            const pie = await buildCategoryTotalsFromReport(rep, db);
            setChartData(pie);
        } catch (err) {
            console.error('Error fetching report:', err);
            setCosts([]);
            setChartData([]);
            setError(String(err?.message || err));
        }
    };

    // Load once on mount
    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGetReport = () => {
        fetchReportData();
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Report</Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <MonthYearControls
                showAllYear={false}
                month={month}
                onMonthChange={setMonth}
                yearDate={yearDate}
                onYearChange={setYearDate}
                maxYearDate={maxYearDate}
                currency={currency}
                onCurrencyChange={setCurrency}
                onGetReport={handleGetReport}
            />

            <CostsTable costs={costs} />

            <Typography variant="h4" gutterBottom>Category Totals</Typography>
            <CategoryPieChart chartData={chartData} currency={currency} />
        </Box>
    );
}

export default ReportPage;
