import asyncHandler from 'express-async-handler';
import Workspace from '../models/Workspace.js';
import AutomationRule from '../models/AutomationRule.js';
import * as workspaceService from '../services/workspaceService.js';

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.createWorkspace(req.body, req.user._id);
    res.status(201).json(workspace);
});

// @desc    Update a workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Admin+)
export const updateWorkspace = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.updateWorkspace(req.params.id, req.body, req.user._id);
    res.json(workspace);
});

// @desc    Delete a workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Owner)
export const deleteWorkspace = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.id);

    if (workspace) {
        if (workspace.owner.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Only the owner can delete this workspace');
        }
        await workspace.deleteOne();
        res.json({ message: 'Workspace removed' });
    } else {
        res.status(404);
        throw new Error('Workspace not found');
    }
});

// @desc    Get all workspaces of a user
// @route   GET /api/workspaces
// @access  Private
export const getUserWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await Workspace.find({
        'members.user': req.user._id
    });
    res.json(workspaces);
});

// @desc    Get workspace stats (task count, etc.)
// @route   GET /api/workspaces/:workspaceId/stats
// @access  Private (Member+)
export const getWorkspaceStats = asyncHandler(async (req, res) => {
    const stats = await workspaceService.getWorkspaceStats(req.params.workspaceId);
    res.json(stats);
});

// @desc    Get all members of a workspace
// @route   GET /api/members/:workspaceId
// @access  Private (Member+)
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.workspaceId)
        .populate('members.user', 'name email avatar');

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    res.json(workspace.members);
});

// @desc    Remove a member from a workspace
// @route   DELETE /api/members/:workspaceId/:userId
// @access  Private (Owner)
export const removeWorkspaceMember = asyncHandler(async (req, res) => {
    await workspaceService.removeMember(req.params.workspaceId, req.params.userId, req.user._id);
    res.json({ message: 'Member removed' });
});

// @desc    Get workspace hierarchy (spaces, folders, lists)
// @route   GET /api/workspaces/:workspaceId/hierarchy
// @access  Private (Member+)
export const getWorkspaceHierarchy = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    // For now, returning a placeholder structure as expected by the frontend
    // In a full implementation, these would be fetched from their respective collections
    res.json({
        spaces: [],
        folders: [],
        lists: []
    });
});

// @desc    Get automation rules
// @route   GET /api/workspaces/:workspaceId/automation
// @access  Private (Member+)
export const getAutomationRules = asyncHandler(async (req, res) => {
    const rules = await AutomationRule.find({ workspaceId: req.params.workspaceId });
    res.json(rules);
});

// @desc    Create automation rule
// @route   POST /api/workspaces/:workspaceId/automation
// @access  Private (Admin+)
export const createAutomationRule = asyncHandler(async (req, res) => {
    const { trigger, action } = req.body;

    const rule = await AutomationRule.create({
        workspaceId: req.params.workspaceId,
        trigger,
        action,
        createdBy: req.user._id
    });

    res.status(201).json(rule);
});

// @desc    Update automation rule
// @route   PUT /api/automation/:id
// @access  Private (Admin+)
export const updateAutomationRule = asyncHandler(async (req, res) => {
    const rule = await AutomationRule.findById(req.params.id);

    if (!rule) {
        res.status(404);
        throw new Error('Rule not found');
    }

    const updatedRule = await AutomationRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRule);
});

// @desc    Delete automation rule
// @route   DELETE /api/automation/:id
// @access  Private (Admin+)
export const deleteAutomationRule = asyncHandler(async (req, res) => {
    const rule = await AutomationRule.findById(req.params.id);

    if (!rule) {
        res.status(404);
        throw new Error('Rule not found');
    }

    await rule.deleteOne();
    res.json({ message: 'Rule removed' });
});
