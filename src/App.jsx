/**
 * @file App.jsx
 * @description Main component of the application
 * @module App
 *

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
import YearlyReport from './pages/YearlyReport';   
import Settings from './pages/Settings';         

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
                    <Route path="/" element={<MainPage />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/yearly" element={<YearlyReport />} />   {/* */}
                    <Route path="/settings" element={<Settings />} />     {/* */}
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
