import express from 'express';
import { protect } from '../middleware/auth.js';
import { startTime, stopTime, getWeeklyReport } from '../controllers/timeTrackingController.js';

const router = express.Router();

// Time Tracking Routes
router.post('/start', protect, startTime);
router.post('/stop/:id', protect, stopTime);
router.get('/report/weekly', protect, getWeeklyReport);

export default router;
