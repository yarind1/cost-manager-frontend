import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Typography, Box, Card, CardContent } from '@mui/material';
import PropTypes from 'prop-types';

const CATEGORY_COLORS = {
    Food: '#FF6384',
    Transportation: '#ff974a',
    Rent: '#80ff53',
    Utilities: '#4BC0C0',
    Entertainment: '#9966FF',
    Other: '#858585',
};

function CategoryPieChart({ chartData, currency }) {
    if (!chartData || chartData.length === 0) {
        return <Typography>No data to display.</Typography>;
    }

    return (
        <Card sx={{ maxWidth: 900, mx: 'auto' }}>
            <CardContent>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Totals shown in {currency}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <PieChart width={460} height={320} style={{ fontFamily: 'Inter, Arial', fontSize: '14px' }}>
                            <Pie data={chartData} dataKey="total" nameKey="category" outerRadius={120} label>
                                {chartData.map((entry) => (
                                    <Cell
                                        key={entry.category}
                                        fill={CATEGORY_COLORS[entry.category] || '#999999'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => `${val} ${currency}`} />
                            <Legend />
                        </PieChart>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

CategoryPieChart.propTypes = {
    chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
    currency: PropTypes.string,
};

CategoryPieChart.defaultProps = {
    chartData: [],
    currency: 'USD',
};

export default CategoryPieChart;
