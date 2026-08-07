import { PrismaClient, User, Session, Ticket, TicketReply, TicketActivity, Attachment } from '@prisma/client';
import { IUserRepository, ISessionRepository, ITicketRepository, ITicketReplyRepository, ITicketActivityRepository, IAttachmentRepository, INotificationRepository } from '../../core/repositories/interfaces';
import { prisma } from '../../core/database/prisma';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll(filters?: any): Promise<User[]> {
    return prisma.user.findMany({ where: filters });
  }

  async create(data: any): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: any): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}

export class PrismaSessionRepository implements ISessionRepository {
  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { refreshTokenHash: hash } });
  }

  async createSession(data: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }): Promise<Session> {
    return prisma.session.create({ data });
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isValid: false },
    });
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId },
      data: { isValid: false },
    });
  }
}

export class PrismaTicketRepository implements ITicketRepository {
  async findById(id: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({ 
      where: { id },
      include: { 
        customer: true,
        assignee: true,
        replies: { include: { user: true, attachments: true } },
        attachments: true,
        activities: { include: { actor: true } }
      }
    });
  }

  async findByTicketNumber(ticketNumber: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({ where: { ticketNumber } });
  }

  async findAll(filters?: any, skip?: number, take?: number, orderBy?: any): Promise<{ data: Ticket[]; total: number }> {
    const where = filters || { deletedAt: null };
    const sort = orderBy || { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        include: { customer: true, assignee: true },
        orderBy: sort
      }),
      prisma.ticket.count({ where })
    ]);
    return { data, total };
  }

  async create(data: any): Promise<Ticket> {
    return prisma.ticket.create({ data });
  }

  async update(id: string, data: any): Promise<Ticket> {
    return prisma.ticket.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export class PrismaTicketReplyRepository implements ITicketReplyRepository {
  async findAllByTicket(ticketId: string): Promise<TicketReply[]> {
    return prisma.ticketReply.findMany({ 
      where: { ticketId },
      include: { user: true, attachments: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async create(data: any): Promise<TicketReply> {
    return prisma.ticketReply.create({ data });
  }
}

export class PrismaTicketActivityRepository implements ITicketActivityRepository {
  async findAllByTicket(ticketId: string): Promise<TicketActivity[]> {
    return prisma.ticketActivity.findMany({
      where: { ticketId },
      include: { actor: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async create(data: any): Promise<TicketActivity> {
    return prisma.ticketActivity.create({ data });
  }
}

export class PrismaAttachmentRepository implements IAttachmentRepository {
  async create(data: any): Promise<Attachment> {
    return prisma.attachment.create({ data });
  }
}

export class PrismaNotificationRepository implements INotificationRepository {
  async create(data: any): Promise<any> {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId: string): Promise<any[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent notifications
    });
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  async markAsRead(id: string, userId: string): Promise<any> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
    return prisma.notification.findUnique({ where: { id } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { id, userId }
    });
  }
}
