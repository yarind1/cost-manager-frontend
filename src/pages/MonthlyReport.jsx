/**
 * @file MonthYearControls.jsx
 * Shared controls for month/year/currency selection with an action button.
 * Now supports:
 *  - showMonth (default true)
 *  - showAllYear (default true)
 */

import React from 'react';
import {
    Box,
    Grid,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    MenuItem,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MONTHS = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
];

const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

function MonthYearControls({
                               // visibility flags
                               showMonth = true,
                               showAllYear = true,

                               // month (1..12 or string label your parent keeps) + setter
                               month,
                               onMonthChange,

                               // year handled via date picker bound to Jan 1 of selected year
                               yearDate,
                               onYearChange,
                               maxYearDate,

                               // all year toggle
                               allYear,
                               onAllYearChange,

                               // currency
                               currency,
                               onCurrencyChange,

                               // action
                               onGetReport,
                           }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                {showMonth && (
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Month"
                            value={month ?? ''}
                            onChange={(e) => onMonthChange?.(e.target.value)}
                        >
                            {MONTHS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Year"
                            views={['year']}
                            value={yearDate}
                            onChange={(v) => onYearChange?.(v)}
                            maxDate={maxYearDate}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Currency"
                        value={currency}
                        onChange={(e) => onCurrencyChange?.(e.target.value)}
                    >
                        {CURRENCIES.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {showAllYear && (
                    <Grid item xs={12} md={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!allYear}
                                    onChange={(e) => onAllYearChange?.(e.target.checked)}
                                />
                            }
                            label="All Year?"
                        />
                    </Grid>
                )}

                <Grid item xs={12} md={showAllYear ? 12 : 3}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onGetReport}
                        sx={{ mt: { xs: 1, md: 0 } }}
                    >
                        GET REPORT
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MonthYearControls;
