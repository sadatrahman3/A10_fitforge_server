import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessClass', required: true },
  className: { type: String, required: true },
  trainerName: { type: String, required: true },
  price: { type: Number, required: true },
  transactionId: { type: String, default: '' },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

bookingSchema.index({ userId: 1, classId: 1 }, { unique: true });

export default mongoose.model('Booking', bookingSchema);
