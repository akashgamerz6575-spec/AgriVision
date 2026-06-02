import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static assets (if we want to serve uploaded files in the future)
// app.use('/uploads', express.static('uploads'));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'AgriShield API server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Backend Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  🌾 AgriShield API Server is Live 🌾  `);
  console.log(`  PORT: ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
