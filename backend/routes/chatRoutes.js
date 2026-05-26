import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = express.Router();

/**
 * @desc    Get messages for a workspace
 * @route   GET /api/chat/:workspaceId
 * @access  Private
 */
router.get('/:workspaceId', protect, asyncHandler(async (req, res) => {
    const messages = await chatService.getWorkspaceMessages(req.params.workspaceId, req.user._id);
    res.json(messages);
}));

/**
 * @desc    Send message to workspace chat
 * @route   POST /api/chat/:workspaceId
 * @access  Private
 */
router.post('/:workspaceId', protect, asyncHandler(async (req, res) => {
    const message = await chatService.sendMessage(
        req.params.workspaceId,
        req.user._id,
        req.user.name,
        req.body.text
    );
    res.status(201).json(message);
}));

export default router;
