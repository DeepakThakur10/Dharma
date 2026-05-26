import express from 'express';
import { registerUser, authUser, logoutUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

export default router;
