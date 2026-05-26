import asyncHandler from 'express-async-handler';
import automationService from '../services/automationService.js';

// @desc    Get all automation rules for a workspace
// @route   GET /api/workspaces/:workspaceId/automation
export const getAutomationRules = asyncHandler(async (req, res) => {
    const rules = await automationService.getRules(req.params.workspaceId);
    res.json(rules);
});

// @desc    Create an automation rule
// @route   POST /api/workspaces/:workspaceId/automation
export const createAutomationRule = asyncHandler(async (req, res) => {
    const rule = await automationService.createRule(req.params.workspaceId, req.body, req.user._id);
    res.status(201).json(rule);
});

// @desc    Update an automation rule
// @route   PUT /api/automation/:id
export const updateAutomationRule = asyncHandler(async (req, res) => {
    const rule = await automationService.updateRule(req.params.id, req.body, req.user._id);
    res.json(rule);
});

// @desc    Delete an automation rule
// @route   DELETE /api/automation/:id
export const deleteAutomationRule = asyncHandler(async (req, res) => {
    await automationService.deleteRule(req.params.id, req.user._id);
    res.json({ message: 'Automation rule removed' });
});
