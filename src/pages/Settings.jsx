import { useEffect, useState } from 'react';
import { Card, CardContent, TextField, Button, Typography } from '@mui/material';
import { getRatesURL, saveRatesURL, fetchRates, getSavedRates } from '../services/ratesService';
import { applyLatestRatesToDB } from '../boot/idbClient';

export default function Settings() {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('');
    const [rates, setRates] = useState(null);

    useEffect(() => {
        setUrl(getRatesURL());
        setRates(getSavedRates());
    }, []);

    async function handleSave() {
        saveRatesURL(url.trim());
        setStatus('Saved URL.');
    }

    async function handleFetch() {
        try {
            setStatus('Fetching…');
            const data = await fetchRates(url.trim());  // GET the JSON from the URL
            setRates(data);
            await applyLatestRatesToDB();               // push into vanilla idb (db.setRates)
            setStatus('Rates fetched & applied.');
        } catch (e) {
            setStatus(`Error: ${e.message}`);
        }
    }

    return (
        <Card sx={{ maxWidth: 720, mx: 'auto', mt: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Settings</Typography>
                <TextField
                    label="Rates JSON URL"
                    fullWidth
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    helperText='Expected JSON: {"USD":A,"GBP":B,"EURO":C,"ILS":D}'
                    margin="normal"
                />
                <Button onClick={handleSave} variant="contained" sx={{ mr: 1 }}>Save URL</Button>
                <Button onClick={handleFetch} variant="outlined">Fetch & Apply</Button>
                <Typography variant="body2" sx={{ mt: 2 }}>{status}</Typography>

                {rates && (
                    <pre style={{ background: '#f5f5f5', padding: 8, marginTop: 12 }}>
            {JSON.stringify(rates, null, 2)}
          </pre>
                )}
            </CardContent>
        </Card>
    );
}
