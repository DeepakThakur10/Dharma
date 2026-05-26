import CustomField from '../models/CustomField.js';
import Task from '../models/Task.js';
import { logActivity } from './activityService.js';

export const getCustomFields = async (workspaceId) => {
    return await CustomField.find({ workspaceId }).sort({ order: 1 });
};

export const createCustomField = async (workspaceId, fieldData, userId) => {
    const { name, type, options, isRequired, order } = fieldData;

    const fieldExists = await CustomField.findOne({ workspaceId, name });
    if (fieldExists) throw new Error('Field with this name already exists in this workspace');

    const field = await CustomField.create({
        workspaceId,
        name,
        type,
        options,
        isRequired,
        order,
        createdBy: userId
    });

    await logActivity({
        workspaceId,
        userId,
        actionType: 'FIELD_CREATED',
        entityType: 'workspace',
        entityId: field._id,
        metadata: { fieldName: name, type }
    });

    return field;
};

export const updateCustomField = async (id, updateData, userId) => {
    const field = await CustomField.findById(id);
    if (!field) throw new Error('Custom field not found');

    Object.assign(field, updateData);
    const updatedField = await field.save();

    await logActivity({
        workspaceId: field.workspaceId,
        userId,
        actionType: 'FIELD_UPDATED',
        entityType: 'workspace',
        entityId: id,
        metadata: { fieldName: field.name }
    });

    return updatedField;
};

export const deleteCustomField = async (id, userId) => {
    const field = await CustomField.findById(id);
    if (!field) throw new Error('Custom field not found');

    const workspaceId = field.workspaceId;
    const name = field.name;

    await field.deleteOne();

    await logActivity({
        workspaceId,
        userId,
        actionType: 'FIELD_DELETED',
        entityType: 'workspace',
        entityId: id,
        metadata: { fieldName: name }
    });

    return { success: true };
};

export const setTaskFieldValue = async (taskId, fieldId, value, userId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    if (!task.customFieldValues) {
        task.customFieldValues = new Map();
    }

    task.customFieldValues.set(fieldId, value);
    await task.save();

    await logActivity({
        workspaceId: task.workspace,
        userId,
        actionType: 'TASK_UPDATED',
        entityType: 'task',
        entityId: taskId,
        metadata: { title: task.title, fieldId, value }
    });

    return task;
};
