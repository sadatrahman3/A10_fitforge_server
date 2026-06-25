import express from 'express';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, photoURL });
    const token = generateToken(user);

    res.cookie('fitforge_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, photoURL: user.photoURL, status: user.status, trainerApplicationStatus: user.trainerApplicationStatus, rejectionFeedback: user.rejectionFeedback }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.cookie('fitforge_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, photoURL: user.photoURL, status: user.status, trainerApplicationStatus: user.trainerApplicationStatus, rejectionFeedback: user.rejectionFeedback }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('fitforge_token');
  res.json({ message: 'Logged out' });
});

export default router;
