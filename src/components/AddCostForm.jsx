import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { addCost } from '../idb/idbModule';
import PropTypes from 'prop-types';

const CATEGORIES = ['Food', 'Transportation', 'Rent', 'Utilities', 'Entertainment', 'Other'];
const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

function AddCostForm({ onAddSuccess }) {
    const [sum, setSum] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sumNumber = parseFloat(sum);
        if (!sum || isNaN(sumNumber) || sumNumber <= 0) return alert('Sum must be a positive number!');
        if (!category) return alert('Category is required!');
        try {
            await addCost({ sum: sumNumber, currency, category, description });
            setSum(''); setCurrency('USD'); setCategory(''); setDescription('');
            onAddSuccess?.();
        } catch (e) {
            console.error(e); alert('Failed to add cost.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField label="Sum" value={sum} onChange={(e) => setSum(e.target.value)}
                       type="number" inputProps={{ min: 0, step: '0.01' }} required />
            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select labelId="currency-label" label="Currency" value={currency}
                        onChange={(e) => setCurrency(e.target.value)} required>
                    {CURRENCIES.map((cur) => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select labelId="category-label" label="Category" value={category}
                        onChange={(e) => setCategory(e.target.value)} required>
                    {CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
            </FormControl>
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button variant="contained" type="submit">Add</Button>
        </Box>
    );
}

AddCostForm.propTypes = { onAddSuccess: PropTypes.func };
AddCostForm.defaultProps = { onAddSuccess: null };
export default AddCostForm;
