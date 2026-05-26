import express from 'express';
import { protect } from '../middleware/auth.js';
import { checkWorkspaceAdmin, checkAutomationPermission } from '../middleware/rbac.js';
import {
    getCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField
} from '../controllers/customFieldController.js';
import {
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule
} from '../controllers/automationController.js';

const router = express.Router();

// Custom Fields
router.get('/workspaces/:workspaceId/custom-fields', protect, getCustomFields);
router.post('/workspaces/:workspaceId/custom-fields', protect, checkWorkspaceAdmin, createCustomField);
router.put('/custom-fields/:id', protect, checkWorkspaceAdmin, updateCustomField);
router.delete('/custom-fields/:id', protect, checkWorkspaceAdmin, deleteCustomField);

// Automation
router.get('/workspaces/:workspaceId/automation', protect, getAutomationRules);
router.post('/workspaces/:workspaceId/automation', protect, checkAutomationPermission, createAutomationRule);
router.put('/automation/:id', protect, checkAutomationPermission, updateAutomationRule);
router.delete('/automation/:id', protect, checkAutomationPermission, deleteAutomationRule);

export default router;
