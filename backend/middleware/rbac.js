import asyncHandler from 'express-async-handler';
import Workspace from '../models/Workspace.js';

// Define levels for hierarchical role comparison
const ROLE_LEVELS = {
    guest: 1,
    member: 2,
    employee: 2,
    admin: 3,
    project_manager: 3,
    owner: 4,
    project_lead: 4
};

/**
 * Middleware to authorize users based on their role in a workspace
 * @param {string} requiredRole - Minimum role required ('guest', 'member', 'admin', 'owner')
 */
export const authorize = (requiredRole) => asyncHandler(async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
        res.status(400);
        throw new Error('Workspace ID is required for authorization');
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    // Find the user's role in this workspace
    const membership = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
        console.warn(`RBAC: User ${req.user._id} blocked from workspace ${workspaceId} - Not a member`);
        res.status(403);
        throw new Error('You are not a member of this workspace');
    }

    const userRoleValue = ROLE_LEVELS[membership.role];
    const requiredRoleValue = ROLE_LEVELS[requiredRole];

    if (userRoleValue < requiredRoleValue) {
        console.warn(`RBAC: User ${req.user._id} blocked from workspace ${workspaceId} - Insufficient role: ${membership.role} < ${requiredRole}`);
        res.status(403);
        throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
    }

    // Attach workspace and level to request for downstream use
    req.workspace = workspace;
    req.userLevel = userRoleValue;
    req.membership = membership;
    next();
});

/**
 * Middleware to ensure the user is an ADMIN in the specific workspace
 */
export const checkWorkspaceAdmin = asyncHandler(async (req, res, next) => {
    let workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    // If no workspaceId in request, try to find it via resource ID (for PUT/DELETE)
    if (!workspaceId && req.params.id) {
        // We'll check both models. In a real app we might use different middleware 
        // but for integration let's be pragmatic.
        const CustomField = (await import('../models/CustomField.js')).default;
        const AutomationRule = (await import('../models/AutomationRule.js')).default;

        const cf = await CustomField.findById(req.params.id);
        if (cf) workspaceId = cf.workspaceId;
        else {
            const ar = await AutomationRule.findById(req.params.id);
            if (ar) workspaceId = ar.workspaceId;
        }
    }

    if (!workspaceId) {
        res.status(400);
        throw new Error('Workspace context is required');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    const membership = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
        res.status(403);
        throw new Error('Access denied. No membership found for this workspace.');
    }

    // Level 3 is 'admin' or 'project_manager'
    if (ROLE_LEVELS[membership.role] < 3) {
        res.status(403);
        throw new Error('Access denied. Administrator privileges required for this workspace.');
    }

    req.workspace = workspace;
    next();
});

/**
 * Middleware to check if user can manage automation rules.
 * Allows Workspace Admins/Owners OR Project Owners (if rule is project-specific).
 */
export const checkAutomationPermission = asyncHandler(async (req, res, next) => {
    let workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
    let projectId = req.body.projectId;

    const AutomationRule = (await import('../models/AutomationRule.js')).default;
    const Project = (await import('../models/Project.js')).default;

    // If update/delete, fetch rule to find workspace/project context
    if (req.params.id) {
        const rule = await AutomationRule.findById(req.params.id);
        if (!rule) {
            res.status(404);
            throw new Error('Automation rule not found');
        }
        workspaceId = rule.workspaceId;
        projectId = rule.projectId;
        req.automationRule = rule; // Attach for next middleware
    }

    if (!workspaceId) {
        res.status(400);
        throw new Error('Workspace context is required');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    const membership = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
        res.status(403);
        throw new Error('Access denied. No membership found for this workspace.');
    }

    // 1. Check Workspace Admin/Owner (Level 3+)
    if (ROLE_LEVELS[membership.role] >= 3) {
        req.workspace = workspace;
        return next();
    }

    // 2. Check Project Owner (if projectId is present)
    if (projectId) {
        const project = await Project.findById(projectId);
        if (project && project.owner.toString() === req.user._id.toString()) {
            req.workspace = workspace;
            req.project = project;
            return next();
        }
    }

    res.status(403);
    throw new Error('Access denied. You do not have permission to manage automation rules here.');
});
