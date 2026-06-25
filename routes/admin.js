import express from 'express';
import User from '../models/User.js';
import FitnessClass from '../models/FitnessClass.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import ForumPost from '../models/ForumPost.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClasses = await FitnessClass.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({ totalUsers, totalClasses, totalBookings, totalRevenue: totalRevenue[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/block/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/unblock/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/make-admin/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/classes', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const classes = await FitnessClass.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/classes/approve/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const cls = await FitnessClass.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/classes/reject/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const cls = await FitnessClass.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/classes/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await FitnessClass.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/forum', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/forum/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
