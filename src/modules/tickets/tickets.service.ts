import { CreateTicketDto, ReplyTicketDto, UpdateStatusDto, AssignTicketDto, UpdatePriorityDto } from './tickets.dto';
import { PrismaTicketRepository, PrismaTicketReplyRepository, PrismaTicketActivityRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { NotFoundError, ForbiddenError } from '../../core/errors/AppError';
import { TicketStatus, ActivityType, Priority, Role } from '@prisma/client';
import crypto from 'crypto';

const ticketRepo = new PrismaTicketRepository();
const replyRepo = new PrismaTicketReplyRepository();
const activityRepo = new PrismaTicketActivityRepository();

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

    const closedAt = data.status === TicketStatus.CLOSED ? new Date() : null;

    const updated = await ticketRepo.update(ticketId, { status: data.status, closedAt });

    let activityType = ActivityType.STATUS_CHANGED;
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

    const reply = await replyRepo.create({
      ticketId,
      userId: user.userId,
      message: data.message,
      isInternal: data.isInternal,
    });

    return reply;
  }

  static async softDeleteTicket(ticketId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    return ticketRepo.softDelete(ticketId);
  }
}
