/**
 * @file MonthYearControls.jsx
 * Shared controls for month/year/currency selection with an action button.
 * Visibility flags:
 *   - showMonth   (default true)
 *   - showAllYear (default true)
 */

import {
    Box,
    Grid,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

export default function MonthYearControls({
                                              // visibility
                                              showMonth = true,
                                              showAllYear = true,

                                              // month (1..12)
                                              month,
                                              onMonthChange,

                                              // year (Date object; only year is used)
                                              yearDate,
                                              onYearChange,
                                              maxYearDate,

                                              // all-year toggle
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
                {/* Month selector (optional) */}
                {showMonth && (
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Month"
                            value={month ?? ''}
                            onChange={(e) => onMonthChange?.(Number(e.target.value))}
                        >
                            {MONTHS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Year picker */}
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

                {/* Currency */}
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

                {/* All Year? (optional) */}
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

                {/* Action button */}
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
