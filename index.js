import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import FitnessClass from './models/FitnessClass.js';
import ForumPost from './models/ForumPost.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FitForge API' });
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalClasses = await FitnessClass.countDocuments({ status: 'approved' });
    const totalPosts = await ForumPost.countDocuments();
    const totalUsers = await User.countDocuments();
    res.json({ totalClasses, totalPosts, totalUsers });
  } catch (error) {
    res.json({ totalClasses: 0, totalPosts: 0, totalUsers: 0 });
  }
});

import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import bookingRoutes from './routes/bookings.js';
import favoriteRoutes from './routes/favorites.js';
import forumRoutes from './routes/forum.js';
import commentRoutes from './routes/comments.js';
import trainerRoutes from './routes/trainers.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FitForge server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
