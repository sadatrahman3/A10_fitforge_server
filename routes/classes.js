import express from 'express';
import FitnessClass from '../models/FitnessClass.js';
import { verifyToken, requireRole, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 9 } = req.query;
    const query = { status: 'approved' };

    if (search) {
      query.className = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = { $in: category.split(',') };
    }

    const total = await FitnessClass.countDocuments(query);
    const classes = await FitnessClass.find(query)
      .sort({ bookingCount: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ classes, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const classes = await FitnessClass.find({ status: 'approved' }).sort({ bookingCount: -1 }).limit(6);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', verifyToken, requireRole('trainer', 'admin'), async (req, res) => {
  try {
    const classes = await FitnessClass.find({ trainerId: req.user.id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cls = await FitnessClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, requireActiveUser, requireRole('trainer', 'admin'), async (req, res) => {
  try {
    const cls = await FitnessClass.create({ ...req.body, trainerId: req.user.id, status: 'pending' });
    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, requireActiveUser, requireRole('trainer', 'admin'), async (req, res) => {
  try {
    const cls = await FitnessClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (req.user.role !== 'admin' && cls.trainerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await FitnessClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, requireActiveUser, requireRole('trainer', 'admin'), async (req, res) => {
  try {
    const cls = await FitnessClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (req.user.role !== 'admin' && cls.trainerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await FitnessClass.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
