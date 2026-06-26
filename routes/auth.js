import express from 'express';
import crypto from 'node:crypto';
import User from '../models/User.js';
import { authCookieOptions, clearAuthCookieOptions } from '../config/app.js';
import { generateToken, verifyToken, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  photoURL: user.photoURL,
  status: user.status,
  trainerApplicationStatus: user.trainerApplicationStatus,
  rejectionFeedback: user.rejectionFeedback,
});

const setAuthCookie = (res, user) => {
  const token = generateToken(user);
  res.cookie('fitforge_token', token, authCookieOptions);
  return token;
};

const isValidPassword = (password) => (
  typeof password === 'string'
  && password.length >= 6
  && /[A-Z]/.test(password)
  && /[a-z]/.test(password)
);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters and include uppercase and lowercase letters' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, photoURL });
    const token = setAuthCookie(res, user);

    res.status(201).json({ user: publicUser(user), token });
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

    const token = setAuthCookie(res, user);

    res.json({ user: publicUser(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google login is not configured on the server' });
    }

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!googleRes.ok) return res.status(401).json({ message: 'Invalid Google credential' });

    const profile = await googleRes.json();
    if (profile.aud !== process.env.GOOGLE_CLIENT_ID || (profile.email_verified !== 'true' && profile.email_verified !== true)) {
      return res.status(401).json({ message: 'Google credential could not be verified' });
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        photoURL: profile.picture || undefined,
        password: `Google${crypto.randomUUID()}a`,
      });
    } else {
      const updates = {};
      if (!user.photoURL && profile.picture) updates.photoURL = profile.picture;
      if (!user.name && profile.name) updates.name = profile.name;
      if (Object.keys(updates).length) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      }
    }

    const token = setAuthCookie(res, user);
    res.json({ user: publicUser(user), token });
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

router.put('/update-profile', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const { name, photoURL } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('fitforge_token', clearAuthCookieOptions);
  res.json({ message: 'Logged out' });
});

export default router;
