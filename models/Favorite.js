import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessClass', required: true },
}, { timestamps: true });

favoriteSchema.index({ userId: 1, classId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
