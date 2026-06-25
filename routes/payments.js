import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import { verifyToken } from '../middleware/auth.js';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { classId, className, price, trainerName } = req.body;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: className, description: `Trainer: ${trainerName}` },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/class/${classId}`,
      metadata: { userId: req.user.id, classId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { sessionId, classId, className, trainerName, price } = req.body;

    const payment = await Payment.create({
      userId: req.user.id,
      userEmail: req.user.email,
      classId,
      className,
      amount: price,
      transactionId: sessionId,
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
