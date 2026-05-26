import express from 'express';
import { protect } from '../middleware/auth.js';
import * as notificationService from '../services/notificationService.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const notifications = await notificationService.getMyNotifications(req.user._id);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user._id);
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/read-all', protect, async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
