import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get(
  '/',
  asyncHandler((req, res) => notificationController.getUserNotifications(req, res))
);

/**
 * GET /api/notifications/unread-count
 * Get unread notifications count
 */
router.get(
  '/unread-count',
  asyncHandler((req, res) => notificationController.getUnreadCount(req, res))
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch(
  '/:id/read',
  asyncHandler((req, res) => notificationController.markAsRead(req, res))
);

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch(
  '/mark-all-read',
  asyncHandler((req, res) => notificationController.markAllAsRead(req, res))
);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete(
  '/:id',
  asyncHandler((req, res) => notificationController.deleteNotification(req, res))
);

/**
 * DELETE /api/notifications
 * Delete all notifications
 */
router.delete(
  '/',
  asyncHandler((req, res) => notificationController.deleteAllNotifications(req, res))
);

export default router;
