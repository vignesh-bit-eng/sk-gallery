import express from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword, getMe, googleLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google/callback', (req, res) => {
  const redirectUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sk-gallery-1.onrender.com/dashboard' 
    : 'http://localhost:5173/dashboard';
  res.redirect(redirectUrl);
});
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;
