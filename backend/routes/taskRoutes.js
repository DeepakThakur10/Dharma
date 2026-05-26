import express from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation.js';
import {
    createTask,
    updateTask,
    deleteTask,
    getWorkspaceTasks,
    getMyTasks,
    getMyTaskStats,
    submitTask,
    reviewTask
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/my-tasks', protect, getMyTasks);
router.get('/my-stats', protect, getMyTaskStats);

router.route('/')
    .post(protect, validate(createTaskSchema), createTask);

router.route('/:id')
    .put(protect, validate(updateTaskSchema), updateTask)
    .delete(protect, deleteTask);

router.get('/workspace/:workspaceId', protect, getWorkspaceTasks);
router.post('/:id/submit', protect, submitTask);
router.post('/:id/review', protect, reviewTask);

export default router;
