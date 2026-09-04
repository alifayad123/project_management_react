import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export class NotificationController {
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    const notifications = await notificationService.getUserNotifications(req.userId!);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    const count = await notificationService.getUnreadCount(req.userId!);

    res.status(200).json({
      success: true,
      data: { count },
    });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    await notificationService.markAllAsRead(req.userId!);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  }

  async deleteAllNotifications(req: Request, res: Response): Promise<void> {
    await notificationService.deleteAllUserNotifications(req.userId!);

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully',
    });
  }
}

export const notificationController = new NotificationController();
