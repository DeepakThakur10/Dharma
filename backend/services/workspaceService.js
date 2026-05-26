import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';
import { logActivity } from './activityService.js';

export const createWorkspace = async (workspaceData, userId) => {
    let { name, description, slug } = workspaceData;

    if (!slug || slug.trim() === '') {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const workspaceExists = await Workspace.findOne({ slug });
    if (workspaceExists) throw new Error('Workspace with this slug already exists');

    const workspace = await Workspace.create({
        name,
        description,
        slug,
        owner: userId,
        members: [{ user: userId, role: 'project_lead' }]
    });

    await logActivity({
        workspaceId: workspace._id,
        userId: userId,
        actionType: 'WORKSPACE_CREATED',
        entityType: 'workspace',
        entityId: workspace._id,
        metadata: { title: workspace.name }
    });

    return workspace;
};

export const updateWorkspace = async (workspaceId, updateData, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    Object.assign(workspace, updateData);
    await workspace.save();

    await logActivity({
        workspaceId: workspace._id,
        userId: userId,
        actionType: 'WORKSPACE_UPDATED',
        entityType: 'workspace',
        entityId: workspace._id,
        metadata: { title: workspace.name }
    });

    return workspace;
};

export const getWorkspaceStats = async (workspaceId) => {
    const stats = await Task.aggregate([
        { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
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

    return stats[0] ? { ...stats[0], taskCount: stats[0].total } : { taskCount: 0, done: 0, backlog: 0, testing: 0, critical: 0, overdue: 0 };
};

export const removeMember = async (workspaceId, userId, operatorId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    if (userId === workspace.owner.toString()) {
        throw new Error('Cannot remove the owner of the workspace');
    }

    const memberToRemove = workspace.members.find(m => m.user.toString() === userId);
    if (!memberToRemove) throw new Error('Member not found in workspace');

    workspace.members = workspace.members.filter(m => m.user.toString() !== userId);
    await workspace.save();

    await logActivity({
        workspaceId: workspace._id,
        userId: operatorId,
        actionType: 'MEMBER_REMOVED',
        entityType: 'user',
        entityId: userId,
        metadata: { workspaceName: workspace.name }
    });

    return { success: true };
};
