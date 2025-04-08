const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, checkConnection } = require('./config/db');
const propertyRoutes = require('./routes/property');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbStatus = checkConnection();
    res.json({
        status: 'ok',
        database: dbStatus.status,
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 