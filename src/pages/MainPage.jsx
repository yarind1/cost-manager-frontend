/**
 * @file MainPage.jsx
 * This file provides the main page for the application.
 * It uses Material-UI components: Box, Typography.
 * It is intended for use in a React environment (ES Modules).
 *
 * Exports:
 *  MainPage: React component
 *
 * Example usage:
 *  import MainPage from './MainPage.jsx';
 *  ReactDOM.render(<MainPage />, document.getElementById('root'));
 */

// Import necessary modules
import  { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getLastNItems, deleteCost } from '../idb/idbModule';
import AddCostForm from '../components/AddCostForm';
import CostsTable from '../components/CostsTable';

/**
 * The main page for the application.
 * @returns {JSX.Element} - The main page content
 * @constructor
 */
function MainPage() {
    // Initialize state for costs
    const [costs, setCosts] = useState([]);

    // Fetch the last 15 cost items from the database
    const fetchLast15 = async () => {
        try {
            const data = await getLastNItems(15);
            setCosts(data);
        } catch (error) {
            console.error('Error fetching last 15 items:', error);
        }
    };

    // Fetch the last 15 items on initial render
    useEffect(() => {
        fetchLast15().then(() => console.log('Fetched last 15 items'));
    }, []);

    /**
     * Handle deletion of a cost record.
     */
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return;

        try {
            await deleteCost(id);
            // Refresh the table to reflect the deletion
            await fetchLast15();
        } catch (err) {
            console.error('Error deleting cost:', err);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Recent Costs
            </Typography>

            {/* Our new CostsTable component */}
            <CostsTable costs={costs} onDelete={handleDelete} />

            <Typography variant="h4" gutterBottom>
                Add a New Cost
            </Typography>

            {/* Pass fetchLast15 to refresh after adding a cost */}
            <AddCostForm onAddSuccess={fetchLast15} />
        </Box>
    );
}

export default MainPage;
