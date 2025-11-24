const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsOptions = require('./src/config/cors');
const {
    rateLimitMiddleware,
    loggerMiddleware,
    errorMiddleware,
    notFoundMiddleware
} = require('./src/middlewares');
const routes = require('./src/routes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors(corsOptions));

// Logger middleware (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use(loggerMiddleware);
}

// Rate limiting
app.use('/api/', rateLimitMiddleware);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'API funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

module.exports = app;
