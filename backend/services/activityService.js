import ActivityLog from '../models/ActivityLog.js';

/**
 * Log an activity in a workspace
 * @param {Object} params - Activity parameters
 */
export const logActivity = async ({
    workspaceId,
    userId,
    actionType,
    entityType,
    entityId,
    metadata = {}
}) => {
    try {
        await ActivityLog.create({
            workspaceId,
            userId,
            actionType,
            entityType,
            entityId,
            metadata
        });
    } catch (err) {
        console.error('Failed to log activity:', err.message);
        // We don't throw here to avoid breaking the main request flow
    }
};

/**
 * Get activity logs for a workspace with pagination
 */
export const getWorkspaceActivity = async (workspaceId, query = {}) => {
    const { page = 1, limit = 20, userId, actionType } = query;

    const filter = { workspaceId };
    if (userId) filter.userId = userId;
    if (actionType) filter.actionType = actionType;

    const logs = await ActivityLog.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await ActivityLog.countDocuments(filter);

    return {
        logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
