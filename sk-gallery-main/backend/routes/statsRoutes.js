import express from 'express';
import { getStats, recordVisit, recordDownload } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, admin, getStats);
router.post('/visit', recordVisit);
router.post('/download', recordDownload);

export default router;
