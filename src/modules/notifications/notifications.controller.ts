import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationsService.getUserNotifications(req.user!.userId);
      res.status(200).json({ status: 'success', data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await NotificationsService.getUnreadCount(req.user!.userId);
      res.status(200).json({ status: 'success', data: { count } });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationsService.markAsRead(req.params.id, req.user!.userId);
      if (!notification) {
        return res.status(404).json({ status: 'error', message: 'Notification not found' });
      }
      res.status(200).json({ status: 'success', data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllAsRead(req.user!.userId);
      res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.deleteNotification(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
