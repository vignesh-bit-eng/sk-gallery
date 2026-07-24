import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const seedOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const ownerEmail = 'vlss15092005vignesh@gmail.com';
    const existingOwner = await User.findOne({ email: ownerEmail });

    if (existingOwner) {
      console.log('Owner already exists!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const owner = await User.create({
      name: 'SK Art Gallery Owner',
      email: ownerEmail,
      password: hashedPassword,
      role: 'owner',
      isVerified: true,
    });

    console.log(`Owner created successfully with email ${owner.email} and password admin123`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedOwner();
