import express from 'express';
import { 
  submitTransaction, 
  getPendingTransactions, 
  verifyTransaction,
  rejectTransaction 
} from '../controllers/transactionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', protect, submitTransaction);
router.get('/pending', protect, admin, getPendingTransactions);
router.put('/:id/verify', protect, admin, verifyTransaction);
router.put('/:id/reject', protect, admin, rejectTransaction);

export default router;
