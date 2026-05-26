import asyncHandler from 'express-async-handler';

/**
 * Middleware to restrict access based on Workspace tier
 * @param {Array} allowedTiers - Array of tiers allowed (e.g. ['pro', 'enterprise'])
 */
export const requireTier = (allowedTiers) => asyncHandler(async (req, res, next) => {
    const workspace = req.workspace; // Assumes authorize middleware has already run

    if (!workspace) {
        res.status(400);
        throw new Error('Workspace context required for tier gating');
    }

    const currentTier = workspace.settings.tier || 'free';

    if (!allowedTiers.includes(currentTier)) {
        res.status(403);
        throw new Error(`This feature requires a ${allowedTiers.join(' or ')} subscription.`);
    }

    next();
});
