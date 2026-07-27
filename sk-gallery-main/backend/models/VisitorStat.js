import mongoose from 'mongoose';

const visitorStatSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('VisitorStat', visitorStatSchema);
