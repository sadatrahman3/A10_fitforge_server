import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: Number, required: true },
  schedule: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('FitnessClass', classSchema);
