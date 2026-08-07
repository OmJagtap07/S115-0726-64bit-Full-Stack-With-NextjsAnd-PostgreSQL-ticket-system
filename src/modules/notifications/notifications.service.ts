import { PrismaNotificationRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { NotificationType } from '@prisma/client';
import { logger } from '../../core/logger/winston';

const notificationRepo = new PrismaNotificationRepository();

export class NotificationsService {
  static async createNotification(data: { userId: string, ticketId: string, title: string, message: string, type: NotificationType }) {
    try {
      const notification = await notificationRepo.create(data);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification', error);
      // We don't throw to prevent interrupting the main workflow (e.g. ticket reply)
      return null;
    }
  }

  static async getUserNotifications(userId: string) {
    return notificationRepo.findByUserId(userId);
  }

  static async getUnreadCount(userId: string) {
    return notificationRepo.countUnread(userId);
  }

  static async markAsRead(id: string, userId: string) {
    return notificationRepo.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: string) {
    await notificationRepo.markAllAsRead(userId);
  }

  static async deleteNotification(id: string, userId: string) {
    await notificationRepo.delete(id, userId);
  }
}
