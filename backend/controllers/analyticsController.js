import asyncHandler from 'express-async-handler';
import * as analyticsService from '../services/analyticsService.js';
import * as activityService from '../services/activityService.js';

/**
 * @desc    Get dashboard metrics for a workspace
 * @route   GET /api/analytics/:workspaceId/dashboard
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats(req.params.workspaceId);
    res.json(stats);
});

/**
 * @desc    Get workspace activity timeline
 * @route   GET /api/analytics/:workspaceId/activity
 */
export const getActivityTimeline = asyncHandler(async (req, res) => {
    const result = await activityService.getWorkspaceActivity(req.params.workspaceId, req.query);
    res.json(result);
});
