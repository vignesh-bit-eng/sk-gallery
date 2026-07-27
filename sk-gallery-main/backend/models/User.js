import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'artist', 'customer'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  artistUploadCount: { type: Number, default: 0 },
  avatarUrl: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
