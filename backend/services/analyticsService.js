import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

/**
 * Get task status distribution for a workspace
 */
export const getTaskStatusStats = async (workspaceId) => {
    return await Task.aggregate([
        { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);
};

/**
 * Get tasks per member distribution
 */
export const getTasksPerMember = async (workspaceId) => {
    return await Task.aggregate([
        { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
        { $unwind: '$assignees' },
        {
            $group: {
                _id: '$assignees',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        { $project: { name: '$user.name', value: '$count', _id: 0 } }
    ]);
};

/**
 * Get activity type distribution
 */
export const getActivityStats = async (workspaceId) => {
    return await ActivityLog.aggregate([
        { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);
};

/**
 * Combined dashboard stats
 */
export const getDashboardStats = async (workspaceId) => {
    const [statusStats, memberStats, activityStats] = await Promise.all([
        getTaskStatusStats(workspaceId),
        getTasksPerMember(workspaceId),
        getActivityStats(workspaceId)
    ]);

    return {
        statusStats,
        memberStats,
        activityStats
    };
};
