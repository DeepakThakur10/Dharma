import asyncHandler from 'express-async-handler';
import * as customFieldService from '../services/customFieldService.js';

// @desc    Get all custom fields for a workspace
// @route   GET /api/workspaces/:workspaceId/custom-fields
export const getCustomFields = asyncHandler(async (req, res) => {
    const fields = await customFieldService.getCustomFields(req.params.workspaceId);
    res.json(fields);
});

// @desc    Create a custom field
// @route   POST /api/workspaces/:workspaceId/custom-fields
export const createCustomField = asyncHandler(async (req, res) => {
    const field = await customFieldService.createCustomField(req.params.workspaceId, req.body, req.user._id);
    res.status(201).json(field);
});

// @desc    Update a custom field
// @route   PUT /api/custom-fields/:id
export const updateCustomField = asyncHandler(async (req, res) => {
    const field = await customFieldService.updateCustomField(req.params.id, req.body, req.user._id);
    res.json(field);
});

// @desc    Delete a custom field
// @route   DELETE /api/custom-fields/:id
export const deleteCustomField = asyncHandler(async (req, res) => {
    await customFieldService.deleteCustomField(req.params.id, req.user._id);
    res.json({ message: 'Custom field removed' });
});

// @desc    Set custom field value for a task
// @route   POST /api/enterprise/fields/tasks/:taskId/values
export const setTaskFieldValue = asyncHandler(async (req, res) => {
    const task = await customFieldService.setTaskFieldValue(
        req.params.taskId,
        req.body.fieldId,
        req.body.value,
        req.user._id
    );
    res.json(task);
});

// Legacy aliases
export const createFieldDefinition = createCustomField;
export const getFieldDefinitions = getCustomFields;
