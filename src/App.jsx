/**
 * @file App.jsx
 * @description Main component of the application
 * @module App
 *
 * @createdBy Yotam Haimovitch & Raziel Otick
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import AppNavbar from './components/Layout/AppNavbar';

// Pages
import MainPage from './pages/MainPage';
import ReportPage from './pages/ReportPage';
import YearlyReport from './pages/YearlyReport';   // ✅ new
import Settings from './pages/Settings';           // ✅ new

import './styles.css';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
    }, [isDarkMode]);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <Router>
                <AppNavbar toggleTheme={toggleTheme} isDarkMode={isDarkMode}/>
                <Routes>
                    <Route path="/FED/" element={<MainPage />} />
                    <Route path="/FED/report" element={<ReportPage />} />
                    <Route path="/FED/yearly" element={<YearlyReport />} />   {/* ✅ new */}
                    <Route path="/FED/settings" element={<Settings />} />     {/* ✅ new */}
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
