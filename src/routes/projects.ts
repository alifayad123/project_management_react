import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateProjectSchema, UpdateProjectSchema } from '../utils/validators';
import { validateRequestBody } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects
 * Get all projects for current user
 */
router.get(
  '/',
  asyncHandler((req, res) => projectController.listProjects(req, res))
);

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
  '/',
  validateRequestBody(CreateProjectSchema),
  asyncHandler((req, res) => projectController.createProject(req, res))
);

/**
 * GET /api/projects/:id
 * Get project details
 */
router.get(
  '/:id',
  asyncHandler((req, res) => projectController.getProject(req, res))
);

/**
 * PUT /api/projects/:id
 * Update project (owner only)
 */
router.put(
  '/:id',
  validateRequestBody(UpdateProjectSchema),
  asyncHandler((req, res) => projectController.updateProject(req, res))
);

/**
 * DELETE /api/projects/:id
 * Delete project (owner only)
 */
router.delete(
  '/:id',
  asyncHandler((req, res) => projectController.deleteProject(req, res))
);

/**
 * GET /api/projects/:id/members
 * Get project members
 */
router.get(
  '/:id/members',
  asyncHandler((req, res) => projectController.getMembers(req, res))
);

/**
 * POST /api/projects/:id/members
 * Add member to project (owner only)
 */
router.post(
  '/:id/members',
  asyncHandler((req, res) => projectController.addMember(req, res))
);

/**
 * DELETE /api/projects/:id/members/:memberId
 * Remove member from project (owner only)
 */
router.delete(
  '/:id/members/:memberId',
  asyncHandler((req, res) => projectController.removeMember(req, res))
);

/**
 * PATCH /api/projects/:id/members/:memberId
 * Update member role (owner only)
 */
router.patch(
  '/:id/members/:memberId',
  asyncHandler((req, res) => projectController.updateMemberRole(req, res))
);

export default router;
