import express from 'express';
import User from '../models/User.js';
import { verifyToken, requireRole, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const { experience, specialty, availability } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.trainerApplicationStatus = 'pending';
    user.trainerDetails = { experience, specialty, availability };
    await user.save();

    res.json({ message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/applications', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const applications = await User.find({ trainerApplicationStatus: 'pending' }).select('-password');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/approve/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'trainer', trainerApplicationStatus: 'approved' }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/reject/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { feedback } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { trainerApplicationStatus: 'rejected', rejectionFeedback: feedback }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/demote/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'user' }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
