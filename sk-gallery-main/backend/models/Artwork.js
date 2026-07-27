import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  priceType: { type: String, enum: ['Free', 'Paid'], required: true },
  price: { type: Number, default: 0, min: 0, max: 100000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  is4K: { type: Boolean, default: false },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Artwork', artworkSchema);
