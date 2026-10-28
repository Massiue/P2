import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import lightRoutes from './routes/lightRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded image static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Smart LED Street Lighting API is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// API root info
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart LED Street Lighting API root',
    routes: [
      '/api/health',
      '/api/auth',
      '/api/complaints',
      '/api/lights',
      '/api/users',
      '/api/feedback',
      '/api/notifications'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/lights', lightRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Initialize Database & Start Server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Smart Street Light API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
};

startServer();
