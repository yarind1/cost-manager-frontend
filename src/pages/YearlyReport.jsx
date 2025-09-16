import { useMemo, useState } from 'react';
import {
    Card, CardContent, Typography, Alert, Box, TextField, MenuItem, Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { getDB } from '../boot/idbClient';
import { getSavedRates } from '../services/ratesService';

const MONTHS_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

export default function YearlyReport() {
    const now = new Date();
    const [yearDate, setYearDate] = useState(new Date(now.getFullYear(), 0, 1));
    const [currency, setCurrency] = useState('USD');
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const maxYearDate = useMemo(() => new Date(now.getFullYear(), 11, 31), [now]);

    async function handleGetReport() {
        setError('');
        const rates = getSavedRates();
        if (!rates) {
            setData([]);
            setError('No exchange rates found. Go to Settings and fetch rates (USD, ILS, GBP, EURO).');
            return;
        }

        const db = await getDB();
        const year = yearDate.getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        try {
            const reports = await Promise.all(months.map((m) => db.getReport(year, m, currency)));
            setData(reports.map((rep, idx) => ({ month: idx + 1, total: rep.total.total })));
        } catch (e) {
            console.error(e);
            setData([]);
            setError(String(e?.message || e));
        }
    }

    return (
        <Card sx={{ maxWidth: 1100, mx: 'auto', mt: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Yearly Report</Typography>

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Controls: ONLY year + currency + button */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Year"
                            views={['year']}
                            value={yearDate}
                            onChange={(v) => v && setYearDate(v)}
                            maxDate={maxYearDate}
                            slotProps={{ textField: { sx: { minWidth: 180 } } }}
                        />
                    </LocalizationProvider>

                    <TextField
                        select
                        label="Currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        sx={{ minWidth: 140 }}
                    >
                        {CURRENCIES.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                    </TextField>

                    <Button variant="contained" onClick={handleGetReport}>
                        GET REPORT
                    </Button>
                </Box>

                <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={data}>
                        <XAxis dataKey="month" tickFormatter={(m) => MONTHS_ABBR[m - 1]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name={`Total (${currency})`} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
