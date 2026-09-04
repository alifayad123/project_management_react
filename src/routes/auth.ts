import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from '../utils/validators';
import { validateRequestBody } from '../middleware/validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateRequestBody(RegisterSchema),
  asyncHandler((req, res) => authController.register(req, res))
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validateRequestBody(LoginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validateRequestBody(RefreshTokenSchema),
  asyncHandler((req, res) => authController.refreshToken(req, res))
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler((req, res) => authController.getProfile(req, res))
);

/**
 * PUT /api/auth/profile
 * Update current user profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler((req, res) => authController.updateProfile(req, res))
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  asyncHandler((req, res) => authController.changePassword(req, res))
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler((req, res) => authController.logout(req, res))
);

export default router;
