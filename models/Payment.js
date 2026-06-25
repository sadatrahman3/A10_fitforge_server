import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessClass', required: true },
  className: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
