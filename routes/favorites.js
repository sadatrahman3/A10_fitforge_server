import express from 'express';
import Favorite from '../models/Favorite.js';
import { verifyToken, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).populate('classId');
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/check/:classId', verifyToken, async (req, res) => {
  try {
    const fav = await Favorite.findOne({ userId: req.user.id, classId: req.params.classId });
    res.json({ favorited: !!fav });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const { classId } = req.body;
    const existing = await Favorite.findOne({ userId: req.user.id, classId });
    if (existing) return res.status(400).json({ message: 'Already in favorites' });

    const fav = await Favorite.create({ userId: req.user.id, classId });
    res.status(201).json(fav);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:classId', verifyToken, requireActiveUser, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ userId: req.user.id, classId: req.params.classId });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
