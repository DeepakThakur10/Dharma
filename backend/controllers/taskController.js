import asyncHandler from 'express-async-handler';
import * as taskService from '../services/taskService.js';
import automationService from '../services/automationService.js';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user._id);

    // Evaluate automation rules
    await automationService.evaluate(task.workspace, task);

    res.status(201).json(task);
});

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user._id);

    // Evaluate automation rules
    await automationService.evaluate(task.workspace, task);

    res.json(task);
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id, req.user._id);
    res.json({ message: 'Task removed' });
});

/**
 * @desc    Get tasks by workspace with pagination
 * @route   GET /api/tasks/workspace/:workspaceId
 * @access  Private
 */
export const getWorkspaceTasks = asyncHandler(async (req, res) => {
    const result = await taskService.getTasksByWorkspace(req.params.workspaceId, req.query);
    res.json(result);
});

/**
 * @desc    Get my tasks
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
export const getMyTasks = asyncHandler(async (req, res) => {
    // This logic could also move to service, but keeping here for now for brevity
    const result = await taskService.getTasksByWorkspace(null, { ...req.query, userId: req.user._id });
    res.json(result);
});

/**
 * @desc    Submit task for review
 */
export const submitTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, {
        status: 'testing',
        submissionFile: req.body.submissionFile,
        submissionNote: req.body.submissionNote,
        submittedAt: new Date()
    }, req.user._id);

    res.json(task);
});

/**
 * @desc    Review (approve/reject) submitted work
 * @route   POST /api/tasks/:id/review
 * @access  Private (Admin+)
 */
export const reviewTask = asyncHandler(async (req, res) => {
    const { action, feedback } = req.body;
    const taskId = req.params.id;

    const task = await taskService.updateTask(taskId, {
        status: action === 'approve' ? 'done' : 'todo',
        reviewFeedback: feedback,
        reviewedAt: new Date(),
        reviewedBy: req.user._id
    }, req.user._id);

    res.json(task);
});

/**
 * @desc    Get stats for all my tasks
 * @route   GET /api/tasks/my-stats
 * @access  Private
 */
export const getMyTaskStats = asyncHandler(async (req, res) => {
    const stats = await taskService.getMyTaskStats(req.user._id);
    res.json(stats);
});
