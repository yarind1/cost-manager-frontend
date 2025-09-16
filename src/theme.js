/**
 * @file theme.js
 * Provides Material-UI theme for the application.
 */

import { createTheme } from '@mui/material/styles';

// Default (green) theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#16A34A', // green-600
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#22C55E', // green-500
        },
        background: {
            default: '#F9FAF9',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h5: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow:
                        '0 1px 2px rgba(0,0,0,0.06), 0 4px 20px rgba(22,163,74,0.06)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#DCFCE7', // green-100
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#166534', // green-800
                },
            },
        },
    },
});

// Light mode (explicit)
export const lightTheme = createTheme({
    ...theme,
    palette: {
        ...theme.palette,
        mode: 'light',
    },
});

// Dark mode (unchanged from your original)
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default theme;
