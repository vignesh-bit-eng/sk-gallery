import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '61291256925-6us84l9324uuf90v78e875mqgrfqtt1c.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sk_gallery_secret_key', { expiresIn: '30d' });
};

export const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    
    let decoded;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      decoded = ticket.getPayload();
    } catch (verifyErr) {
      console.log('Google verification failed, falling back to manual decode:', verifyErr.message);
      decoded = jwt.decode(token);
    }
    
    if (!decoded || !decoded.email) {
      console.log('Failed to decode Google token or missing email');
      return res.status(400).json({ message: 'Invalid Google token structure' });
    }

    const { email, name, picture } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      try {
        const finalRole = (role === 'artist' || role === 'owner') ? role : 'customer';
        user = await User.create({
          name: name || 'Google User',
          email,
          password: await bcrypt.hash(email + (process.env.JWT_SECRET || 'fallback'), 10),
          role: finalRole,
          isVerified: true,
          avatarUrl: picture
        });
      } catch (dbErr) {
        console.error('Error creating user in DB:', dbErr);
        return res.status(500).json({ message: 'Database error creating user: ' + dbErr.message });
      }
    } else {
      let changed = false;
      if (!user.isVerified) {
        user.isVerified = true;
        changed = true;
      }
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      artistUploadCount: user.artistUploadCount,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Outer Google Login Error:', error);
    res.status(500).json({ message: 'Server error during Google Login: ' + error.message });
  }
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Determine allowed roles. Owner is usually seeded, but maybe they try to register? 
    // We enforce 'customer' or 'artist'.
    const finalRole = (role === 'artist') ? 'artist' : 'customer';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      verificationCode,
    });

    if (user) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your SK Art Gallery account',
          text: `Your verification code is: ${verificationCode}`,
          html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        });
      } catch (emailError) {
        console.warn('Warning: Failed to send verification email. Missing SMTP config on Render?', emailError.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Registration successful. Please verify your email.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified && user.role !== 'owner') {
        return res.status(401).json({ message: 'Please verify your email first', needsVerification: true });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Code - SK Art Gallery',
        text: `Your password reset code is: ${verificationCode}`,
        html: `<p>Your password reset code is: <strong>${verificationCode}</strong></p>`,
      });
    } catch (emailError) {
      console.warn('Warning: Failed to send password reset email. Missing SMTP config on Render?', emailError.message);
      // We can still proceed, but the user won't get the email unless SMTP is configured.
    }

    res.json({ message: 'Verification code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === code) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.verificationCode = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
