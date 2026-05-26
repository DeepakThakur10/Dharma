import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import Invitation from '../models/Invitation.js';
import * as invitationService from '../services/invitationService.js';

const router = Router();

/**
 * POST /api/invite
 * Body: { email, workspaceId, workspaceName }
 */
router.post('/', protect, asyncHandler(async (req, res) => {
    const invitation = await invitationService.createInvite(req.body, req.user);
    res.status(201).json({ message: 'Invitation sent', invitationId: invitation._id });
}));

/**
 * POST /api/invite/accept
 */
router.post('/accept', protect, asyncHandler(async (req, res) => {
    const workspaceId = await invitationService.acceptInvite(req.body.invitationId, req.user);
    res.json({ message: 'Invitation accepted', workspaceId });
}));

/**
 * POST /api/invite/decline
 */
router.post('/decline', protect, asyncHandler(async (req, res) => {
    const { invitationId } = req.body;
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
        res.status(404);
        throw new Error('Invitation not found');
    }

    if (invitation.invitedEmail !== req.user.email) {
        res.status(403);
        throw new Error('This invitation is not for your email');
    }

    invitation.status = 'declined';
    await invitation.save();
    res.json({ message: 'Invitation declined' });
}));

router.get('/pending', protect, asyncHandler(async (req, res) => {
    const invitations = await Invitation.find({
        invitedEmail: req.user.email,
        status: 'pending'
    });
    res.json(invitations);
}));

export default router;
