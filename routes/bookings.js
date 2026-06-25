import express from 'express';
import Booking from '../models/Booking.js';
import FitnessClass from '../models/FitnessClass.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('classId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/check/:classId', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ userId: req.user.id, classId: req.params.classId });
    res.json({ booked: !!booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ classId: req.params.classId }).populate('userId', 'name email photoURL');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { classId, transactionId } = req.body;
    const cls = await FitnessClass.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const existing = await Booking.findOne({ userId: req.user.id, classId });
    if (existing) return res.status(400).json({ message: 'Already booked' });

    const booking = await Booking.create({
      userId: req.user.id,
      classId,
      className: cls.className,
      trainerName: cls.trainerName,
      price: cls.price,
      transactionId,
    });

    await FitnessClass.findByIdAndUpdate(classId, { $inc: { bookingCount: 1 } });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
