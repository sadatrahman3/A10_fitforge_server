import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import FitnessClass from '../models/FitnessClass.js';
import { getClientUrl } from '../config/app.js';
import { verifyToken, requireActiveUser } from '../middleware/auth.js';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-checkout-session', verifyToken, requireActiveUser, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe secret key is not configured' });
    }

    const { classId } = req.body;
    const cls = await FitnessClass.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const existingBooking = await Booking.findOne({ userId: req.user.id, classId });
    if (existingBooking) return res.status(400).json({ message: 'Already booked' });

    const clientUrl = getClientUrl();

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: cls.className, description: `Trainer: ${cls.trainerName}` },
          unit_amount: Math.round(cls.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${clientUrl}/payment/${classId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/class/${classId}`,
      metadata: { userId: req.user.id, classId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const { sessionId, classId } = req.body;
    if (!sessionId || !classId) {
      return res.status(400).json({ message: 'Session ID and class ID are required' });
    }

    const cls = await FitnessClass.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (process.env.STRIPE_SECRET_KEY && sessionId.startsWith('cs_')) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment has not been completed' });
      }
      if (session.metadata?.userId !== req.user.id || session.metadata?.classId !== classId) {
        return res.status(403).json({ message: 'Payment session does not match this booking' });
      }
    }

    let payment = await Payment.findOne({ userId: req.user.id, transactionId: sessionId });
    if (!payment) {
      payment = await Payment.create({
        userId: req.user.id,
        userEmail: req.user.email,
        classId,
        className: cls.className,
        amount: cls.price,
        transactionId: sessionId,
      });
    }

    let booking = await Booking.findOne({ userId: req.user.id, classId });
    if (!booking) {
      booking = await Booking.create({
        userId: req.user.id,
        classId,
        className: cls.className,
        trainerName: cls.trainerName,
        price: cls.price,
        transactionId: sessionId,
      });
      await FitnessClass.findByIdAndUpdate(classId, { $inc: { bookingCount: 1 } });
    }

    res.json({ payment, booking });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Already booked' });
    res.status(500).json({ message: error.message });
  }
});

export default router;
