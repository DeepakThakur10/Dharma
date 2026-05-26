import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
    chatWithAi,
    breakdownTask,
    analyzeWorkspaceHealth,
    getChatHistory,
    clearChatHistory,
    suggestAiContent
} from '../controllers/aiController.js';

const router = Router();

// Chat & History
router.post('/chat', protect, chatWithAi);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

// Advanced features
router.post('/breakdown', protect, breakdownTask);
router.post('/suggest', protect, suggestAiContent);
router.get('/analyze/:workspaceId', protect, analyzeWorkspaceHealth);

export default router;
