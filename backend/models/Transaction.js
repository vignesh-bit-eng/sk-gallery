import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }, // Optional, for purchasing art
  transactionId: { type: String, required: true },
  type: { type: String, enum: ['ArtworkPurchase', 'ArtistUploadSlot'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
