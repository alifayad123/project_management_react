import { Router } from 'express';
import { commentController } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateCommentSchema } from '../utils/validators';
import { validateRequestBody } from '../middleware/validation';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/tasks/:taskId/comments
 * Get comments for a task
 */
router.get(
  '/',
  asyncHandler((req, res) => commentController.getTaskComments(req, res))
);

/**
 * POST /api/tasks/:taskId/comments
 * Create a comment
 */
router.post(
  '/',
  validateRequestBody(CreateCommentSchema),
  asyncHandler((req, res) => commentController.createComment(req, res))
);

/**
 * PUT /api/comments/:commentId
 * Update a comment
 */
router.put(
  '/:commentId',
  validateRequestBody(CreateCommentSchema),
  asyncHandler((req, res) => commentController.updateComment(req, res))
);

/**
 * DELETE /api/comments/:commentId
 * Delete a comment
 */
router.delete(
  '/:commentId',
  asyncHandler((req, res) => commentController.deleteComment(req, res))
);

export default router;
