import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getDashboardAnalytics,
    getActivityTimeline
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/:workspaceId/dashboard', protect, getDashboardAnalytics);
router.get('/:workspaceId/activity', protect, getActivityTimeline);

export default router;
