/**
 * @file CostsTable.jsx
 * Generic table for costs.
 * Columns: Date, Category, Sum, Currency, Description, (optional) Actions
 */

import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CostsTable({ costs, onDelete }) {
    const showActions = typeof onDelete === 'function';

    return (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Sum</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Description</TableCell>
                        {showActions && <TableCell align="center">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(costs || []).map((c, idx) => (
                        <TableRow key={c.id ?? `${c.date ?? ''}-${c.category ?? ''}-${idx}`}>
                            <TableCell>{c.date ?? ''}</TableCell>
                            <TableCell>{c.category}</TableCell>
                            <TableCell>{c.sum}</TableCell>
                            <TableCell>{c.currency}</TableCell>
                            <TableCell>{c.description}</TableCell>
                            {showActions && (
                                <TableCell align="center">
                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => onDelete?.(c.id)}
                                        disabled={c.id == null}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {(costs || []).length === 0 && (
                        <TableRow>
                            <TableCell colSpan={showActions ? 6 : 5} align="center">
                                No data to display.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

CostsTable.propTypes = {
    costs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        date: PropTypes.string,
        category: PropTypes.string,
        sum: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        currency: PropTypes.string,
        description: PropTypes.string,
    })),
    onDelete: PropTypes.func, // if omitted, Actions column is hidden
};

CostsTable.defaultProps = {
    costs: [],
    onDelete: undefined,
};

export default CostsTable;
