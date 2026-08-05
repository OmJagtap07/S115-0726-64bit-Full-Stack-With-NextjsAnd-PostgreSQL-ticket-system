import { CreateTicketDto, ReplyTicketDto, UpdateStatusDto, AssignTicketDto, UpdatePriorityDto } from './tickets.dto';
import { PrismaTicketRepository, PrismaTicketReplyRepository, PrismaTicketActivityRepository, PrismaUserRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../core/errors/AppError';
import { TicketStatus, ActivityType, Priority, Role } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import crypto from 'crypto';

const ticketRepo = new PrismaTicketRepository();
const replyRepo = new PrismaTicketReplyRepository();
const activityRepo = new PrismaTicketActivityRepository();
const userRepo = new PrismaUserRepository();

interface AuthUser {
  userId: string;
  role: string;
}

export class TicketsService {
  private static authorizeTicketAccess(user: AuthUser, ticket: any) {
    if (user.role === Role.ADMIN) return true;
    if (user.role === Role.CUSTOMER && ticket.customerId === user.userId) return true;
    if (user.role === Role.AGENT && ticket.assigneeId === user.userId) return true;
    throw new ForbiddenError('You do not have permission to access this ticket');
  }

  private static validateStatusTransition(currentStatus: string, newStatus: string, user: AuthUser, assigneeId: string | null) {
    if (currentStatus === newStatus) return;

    if (user.role === Role.CUSTOMER) {
      if (currentStatus === TicketStatus.RESOLVED && newStatus === TicketStatus.CLOSED) return;
      throw new ConflictError('Customers can only transition a RESOLVED ticket to CLOSED.');
    }

    if (user.role === Role.AGENT || user.role === Role.ADMIN) {
      // Treat OPEN + assigneeId != null as ASSIGNED
      if (currentStatus === TicketStatus.OPEN && assigneeId !== null && newStatus === TicketStatus.IN_PROGRESS) return;
      
      if (currentStatus === TicketStatus.IN_PROGRESS && newStatus === TicketStatus.RESOLVED) return;

      throw new ConflictError('Agents can only transition tickets from ASSIGNED to IN_PROGRESS, or IN_PROGRESS to RESOLVED.');
    }

    throw new ConflictError('Invalid state transition.');
  }
  static async createTicket(customerId: string, data: CreateTicketDto) {
    const ticketNumber = `TKT-${crypto.randomInt(1000, 99999)}`;

    const ticket = await ticketRepo.create({
      ticketNumber,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      customerId,
    });

    await activityRepo.create({
      ticketId: ticket.id,
      actorId: customerId,
      type: ActivityType.CREATED,
      details: 'Ticket created',
    });

    return ticketRepo.findById(ticket.id);
  }

  static async getTickets(filters?: any, skip?: number, take?: number) {
    return ticketRepo.findAll(filters, skip, take);
  }

  static async getTicketById(ticketId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);
    return ticket;
  }

  static async updateStatus(ticketId: string, user: AuthUser, data: UpdateStatusDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);
    this.validateStatusTransition(ticket.status, data.status, user, ticket.assigneeId);

    const closedAt = data.status === TicketStatus.CLOSED ? new Date() : null;

    const updated = await ticketRepo.update(ticketId, { status: data.status, closedAt });

    let activityType: ActivityType = ActivityType.STATUS_CHANGED;
    if (data.status === TicketStatus.CLOSED) activityType = ActivityType.CLOSED;
    if (ticket.status === TicketStatus.CLOSED && data.status !== TicketStatus.CLOSED) activityType = ActivityType.REOPENED;

    await activityRepo.create({
      ticketId,
      actorId: user.userId,
      type: activityType,
      details: `Status changed from ${ticket.status} to ${data.status}`,
    });

    return updated;
  }

  static async assignTicket(ticketId: string, user: AuthUser, data: AssignTicketDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      throw new ConflictError('Cannot assign a resolved or closed ticket.');
    }

    const targetUser = await userRepo.findById(data.assigneeId);
    if (!targetUser || !targetUser.isActive || targetUser.role !== Role.AGENT) {
      throw new BadRequestError('The selected user is not a valid agent.');
    }

    const type = ticket.assigneeId ? ActivityType.REASSIGNED : ActivityType.ASSIGNED;

    const updated = await ticketRepo.update(ticketId, { assigneeId: data.assigneeId });

    await activityRepo.create({
      ticketId,
      actorId: user.userId,
      type,
      details: `Assigned to ${data.assigneeId}`,
    });

    return updated;
  }

  static async updatePriority(ticketId: string, user: AuthUser, data: UpdatePriorityDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    const updated = await ticketRepo.update(ticketId, { priority: data.priority });

    await activityRepo.create({
      ticketId,
      actorId: user.userId,
      type: ActivityType.STATUS_CHANGED,
      details: `Priority changed from ${ticket.priority} to ${data.priority}`,
    });

    return updated;
  }

  static async getReplies(ticketId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    const replies = await replyRepo.findAllByTicket(ticketId);
    if (user.role === Role.CUSTOMER) {
      return replies.filter(r => !r.isInternal);
    }
    return replies;
  }

  static async replyToTicket(ticketId: string, user: AuthUser, data: ReplyTicketDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
      throw new ConflictError('Cannot reply to a resolved or closed ticket.');
    }

    const isInternal = user.role === Role.CUSTOMER ? false : data.isInternal;

    const reply = await replyRepo.create({
      ticketId,
      userId: user.userId,
      message: data.message,
      isInternal,
    });

    let details = 'Replied';
    if (isInternal) {
      details = 'Internal note added';
    } else if (user.role === Role.CUSTOMER) {
      details = 'Customer replied';
    } else if (user.role === Role.AGENT) {
      details = 'Agent replied';
    } else if (user.role === Role.ADMIN) {
      details = 'Admin replied';
    }

    await activityRepo.create({
      ticketId,
      actorId: user.userId,
      type: ActivityType.REPLIED,
      details,
    });

    return reply;
  }

  static async softDeleteTicket(ticketId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    return ticketRepo.softDelete(ticketId);
  }

  static async getSummary(user: AuthUser) {
    if (user.role === Role.ADMIN) {
      const [totalOpen, unassigned, assigned] = await Promise.all([
        prisma.ticket.count({ where: { status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { assigneeId: null, deletedAt: null } }),
        prisma.ticket.count({ where: { assigneeId: { not: null }, deletedAt: null } }),
      ]);
      return { totalOpen, unassigned, assigned };
    }

    if (user.role === Role.AGENT) {
      // Resolved Today: updated today and status = RESOLVED? Wait, let's just count RESOLVED tickets assigned to this agent where closedAt is not set, or updated today.
      // Easiest is just checking status = RESOLVED and updatedAt >= start of day.
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [myOpen, inProgress, resolvedToday] = await Promise.all([
        prisma.ticket.count({ where: { assigneeId: user.userId, status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { assigneeId: user.userId, status: 'IN_PROGRESS', deletedAt: null } }),
        prisma.ticket.count({ 
          where: { 
            assigneeId: user.userId, 
            status: 'RESOLVED', 
            updatedAt: { gte: startOfDay },
            deletedAt: null 
          } 
        }),
      ]);
      return { myOpen, inProgress, resolvedToday };
    }

    if (user.role === Role.CUSTOMER) {
      const [myTickets, openRequests, recentlyResolved] = await Promise.all([
        prisma.ticket.count({ where: { customerId: user.userId, deletedAt: null } }),
        prisma.ticket.count({ where: { customerId: user.userId, status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { customerId: user.userId, status: 'RESOLVED', deletedAt: null } }),
      ]);
      return { myTickets, openRequests, recentlyResolved };
    }

    return {};
  }
}
