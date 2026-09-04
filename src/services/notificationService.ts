import { Notification } from '../models/Notification';
import { INotification, NotificationType } from '../types';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { getIO } from '../socket/setup';

export class NotificationService {
  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string): Promise<INotification[]> {
    const notifications = await Notification.find({ userId })
      .populate('taskId', 'title projectId')
      .sort({ createdAt: -1 });

    return notifications;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    return count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<INotification> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    ).populate('taskId', 'title projectId');

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    logger.debug('Notification marked as read', { notificationId });

    return notification;
  }

  /**
   * Mark all as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    logger.debug('All notifications marked as read', { userId });
  }

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    taskId: string,
    type: NotificationType
  ): Promise<INotification> {
    const notification = await Notification.create({
      userId,
      taskId,
      type,
      read: false,
    });

    const populated = await Notification.findById(notification._id).populate(
      'taskId',
      'title projectId'
    );

    if (!populated) {
      throw new NotFoundError('Notification');
    }

    // Emit to user via Socket.io
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', {
        notification: populated,
      });
    } catch (error) {
      logger.error('Failed to emit notification event', { error });
    }

    logger.debug('Notification created', { notificationId: notification._id, userId, type });

    return populated;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await Notification.findByIdAndDelete(notificationId);
    logger.debug('Notification deleted', { notificationId });
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllUserNotifications(userId: string): Promise<void> {
    await Notification.deleteMany({ userId });
    logger.debug('All user notifications deleted', { userId });
  }

  /**
   * Batch create notifications (for multiple users)
   */
  async batchCreateNotifications(
    userIds: string[],
    taskId: string,
    type: NotificationType
  ): Promise<INotification[]> {
    const notifications = await Notification.create(
      userIds.map((userId) => ({
        userId,
        taskId,
        type,
        read: false,
      }))
    );

    // Emit to all users
    const io = getIO();
    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit('notification:new', {
        notification,
      });
    }

    logger.debug('Batch notifications created', { userIds, taskId, type });

    return notifications;
  }
}

export const notificationService = new NotificationService();
