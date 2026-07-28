import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import artworkRoutes from './routes/artworkRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://sk-gallery-1.onrender.com'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('FATAL ERROR: MONGO_URI environment variable is missing or undefined! Please set MONGO_URI in your Render environment variables.');
      throw new Error("MONGO_URI is undefined in environment variables. Connection aborted.");
    }

    await mongoose.connect(uri);
    console.log('Database Connected Successfully');

    // Seed Owner
    const ownerEmail = 'vlss15092005vignesh@gmail.com';
    const existingOwner = await User.findOne({ email: ownerEmail });
    if (!existingOwner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'SK Art Gallery Owner',
        email: ownerEmail,
        password: hashedPassword,
        role: 'owner',
        isVerified: true,
      });
      console.log('Owner seeded successfully (email: vlss15092005vignesh@gmail.com, password: admin123)');
    }
  } catch (err) {
    if (err.name === 'MongoServerError' && (err.code === 8000 || err.code === 18)) {
      console.error('Database Authentication Failed! Please verify your MongoDB username and password in the MONGODB_URI.');
    } else {
      console.error('Database Connection Error:', err.message);
    }
  }
};
connectDB();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Determine frontend build directory path accurately
const possibleFrontendPaths = [
  path.join(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.join(__dirname, '../dist'),
  path.join(__dirname, 'dist'),
  path.resolve(process.cwd(), 'dist'),
];

const frontendPath = possibleFrontendPaths.find(p => fs.existsSync(p)) || possibleFrontendPaths[0];

// Serve static build files from frontend build directory
app.use(express.static(frontendPath));

// Wildcard catch-all route for SPA routing (must be placed AFTER express.static and all API routes)
app.get(/^[\s\S]*$/, (req, res) => {
  // If request is for a missing static asset or file extension, return 404 instead of index.html
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff|woff2|ttf|eot|map)$/)) {
    return res.status(404).send('Asset not found');
  }

  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send('Error serving application index.html. Please ensure frontend build exists.');
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
