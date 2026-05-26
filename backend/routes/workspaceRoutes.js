import express from 'express';
import {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getUserWorkspaces,
    getWorkspaceStats,
    getWorkspaceMembers,
    removeWorkspaceMember,
    getWorkspaceHierarchy,
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../validations/workspaceValidation.js';

const router = express.Router();

// Workspace routes
router.route('/')
    .get(protect, getUserWorkspaces)
    .post(protect, validate(createWorkspaceSchema), createWorkspace);

router.route('/:id')
    .put(protect, authorize('admin'), validate(updateWorkspaceSchema), updateWorkspace)
    .delete(protect, authorize('owner'), deleteWorkspace);

router.get('/:workspaceId/stats', protect, authorize('member'), getWorkspaceStats);
router.get('/:workspaceId/hierarchy', protect, authorize('member'), getWorkspaceHierarchy);

router.get('/:workspaceId/members', protect, authorize('member'), getWorkspaceMembers);
router.delete('/:workspaceId/members/:userId', protect, authorize('owner'), removeWorkspaceMember);

export default router;
