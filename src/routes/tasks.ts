import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
} from '../utils/validators';
import { validateRequestBody } from '../middleware/validation';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects/:id/tasks
 * Get all tasks for a project
 */
router.get(
  '/',
  asyncHandler((req, res) => taskController.listProjectTasks(req, res))
);

/**
 * GET /api/projects/:id/tasks?status=todo
 * Get tasks by status (for Kanban board)
 */
router.get(
  '/by-status',
  asyncHandler((req, res) => taskController.getTasksByStatus(req, res))
);

/**
 * POST /api/projects/:id/tasks
 * Create a new task
 */
router.post(
  '/',
  validateRequestBody(CreateTaskSchema),
  asyncHandler((req, res) => taskController.createTask(req, res))
);

/**
 * GET /api/tasks/:id
 * Get task details
 */
router.get(
  '/:taskId',
  asyncHandler((req, res) => taskController.getTask(req, res))
);

/**
 * PUT /api/tasks/:id
 * Update task
 */
router.put(
  '/:taskId',
  validateRequestBody(UpdateTaskSchema),
  asyncHandler((req, res) => taskController.updateTask(req, res))
);

/**
 * PATCH /api/tasks/:id/status
 * Update task status (Kanban move)
 */
router.patch(
  '/:taskId/status',
  validateRequestBody(UpdateTaskStatusSchema),
  asyncHandler((req, res) => taskController.updateTaskStatus(req, res))
);

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
router.delete(
  '/:taskId',
  asyncHandler((req, res) => taskController.deleteTask(req, res))
);

export default router;
