/**
 * @file main.jsx
 * This file provides the main entry point for the application.
 * It uses React and Material-UI components.
 * It is intended for use in a React environment (ES Modules).
 */

// Import necessary modules
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
  </StrictMode>,
)
