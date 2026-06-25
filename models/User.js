import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  photoURL: { type: String, default: 'https://i.ibb.co/MBtjqXQ/no-avatar.gif' },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  trainerApplicationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  trainerDetails: {
    experience: Number,
    specialty: String,
    availability: String,
  },
  rejectionFeedback: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
