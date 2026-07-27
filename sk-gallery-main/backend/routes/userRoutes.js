import express from 'express';
import { searchUsers, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchUsers);
router.put('/profile', protect, updateUserProfile);

export default router;
