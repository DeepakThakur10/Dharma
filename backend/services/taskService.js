import Task from '../models/Task.js';
import { logActivity } from './activityService.js';
import automationService from './automationService.js';
import mongoose from 'mongoose';

export const createTask = async (taskData, userId) => {
    // Map workspaceId from payload to workspace field in model
    const { workspaceId, ...rest } = taskData;

    const task = await Task.create({
        ...rest,
        workspace: workspaceId,
        createdBy: userId
    });

    await automationService.evaluate(task.workspace, task);
    return task;
};

export const updateTask = async (taskId, updateData, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;
    const oldAssignees = task.assignees?.map(a => a.toString()) || [];

    Object.assign(task, updateData);
    await task.save();

    // Log status change
    if (updateData.status && updateData.status !== oldStatus) {
        await logActivity({
            workspaceId: task.workspace,
            userId: userId,
            actionType: 'STATUS_CHANGED',
            entityType: 'task',
            entityId: task._id,
            metadata: {
                title: task.title,
                from: oldStatus,
                to: task.status
            }
        });
    }

    await automationService.evaluate(task.workspace, task);
    return task;
};

export const deleteTask = async (taskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const workspaceId = task.workspace;
    const title = task.title;

    await task.deleteOne();

    await logActivity({
        workspaceId,
        userId,
        actionType: 'TASK_DELETED',
        entityType: 'task',
        entityId: taskId,
        metadata: { title }
    });

    return { success: true };
};

export const getTasksByWorkspace = async (workspaceId, query = {}) => {
    const { page = 1, limit = 20, status, priority, search, userId } = query;

    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (userId) {
        filter.$or = [
            { assignees: userId },
            { createdBy: userId }
        ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
        .populate('assignees', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Task.countDocuments(filter);

    return {
        tasks,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getMyTaskStats = async (userId) => {
    const stats = await Task.aggregate([
        {
            $match: {
                $or: [
                    { assignees: new mongoose.Types.ObjectId(userId) },
                    { createdBy: new mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
                backlog: { $sum: { $cond: [{ $eq: ["$status", "backlog"] }, 1, 0] } },
                testing: { $sum: { $cond: [{ $eq: ["$status", "testing"] }, 1, 0] } },
                critical: { $sum: { $cond: [{ $and: [{ $eq: ["$priority", "critical"] }, { $ne: ["$status", "done"] }] }, 1, 0] } },
                overdue: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "done"] }, { $lt: ["$deadline", new Date()] }] }, 1, 0] } }
            }
        }
    ]);

    return stats[0] || { total: 0, done: 0, backlog: 0, testing: 0, critical: 0, overdue: 0 };
};
