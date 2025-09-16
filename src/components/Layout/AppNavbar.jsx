/**
 * @file AppNavbar.jsx
 * Updated for FED V2 requirements:
 *  - Added navigation to Bar Chart view
 *  - Added navigation to Settings view
 *  - Preserves theme toggle (dark/light)
 */

//import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Icons
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

function AppNavbar({ toggleTheme, isDarkMode }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Cost Manager
                </Typography>

                {/* Dark/Light Mode Toggle */}
                <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        <DarkModeIcon fontSize="large" />
                    </IconButton>
                </Tooltip>

                {/* Home */}
                <Tooltip title="Home">
                    <IconButton color="inherit" component={Link} to="/">
                        <HomeIcon fontSize="large" />
                    </IconButton>
                </Tooltip>

                {/* Monthly Report (Pie Chart) */}
                <Tooltip title="Report (Pie Chart)">
                    <IconButton color="inherit" component={Link} to="/report">
                        <AssessmentIcon fontSize="large" />
                    </IconButton>
                </Tooltip>

                {/* Yearly Report (Bar Chart) */}
                <Tooltip title="Yearly Report (Bar Chart)">
                    <IconButton color="inherit" component={Link} to="/yearly">
                        <BarChartIcon fontSize="large" />
                    </IconButton>
                </Tooltip>

                {/* Settings */}
                <Tooltip title="Settings">
                    <IconButton color="inherit" component={Link} to="/settings">
                        <SettingsIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}

AppNavbar.propTypes = {
    toggleTheme: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
};

export default AppNavbar;
