import { CreateTicketDto, ReplyTicketDto, UpdateStatusDto, AssignTicketDto, UpdatePriorityDto } from './tickets.dto';
import { PrismaTicketRepository, PrismaTicketReplyRepository, PrismaTicketActivityRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { NotFoundError } from '../../core/errors/AppError';
import { TicketStatus, ActivityType, Priority } from '@prisma/client';
import crypto from 'crypto';

const ticketRepo = new PrismaTicketRepository();
const replyRepo = new PrismaTicketReplyRepository();
const activityRepo = new PrismaTicketActivityRepository();

export class TicketsService {
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

  static async getTicketById(ticketId: string) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    return ticket;
  }

  static async updateStatus(ticketId: string, actorId: string, data: UpdateStatusDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const closedAt = data.status === TicketStatus.CLOSED ? new Date() : null;

    const updated = await ticketRepo.update(ticketId, { status: data.status, closedAt });

    let activityType = ActivityType.STATUS_CHANGED;
    if (data.status === TicketStatus.CLOSED) activityType = ActivityType.CLOSED;
    if (ticket.status === TicketStatus.CLOSED && data.status !== TicketStatus.CLOSED) activityType = ActivityType.REOPENED;

    await activityRepo.create({
      ticketId,
      actorId,
      type: activityType,
      details: `Status changed from ${ticket.status} to ${data.status}`,
    });

    return updated;
  }

  static async assignTicket(ticketId: string, actorId: string, data: AssignTicketDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const type = ticket.assigneeId ? ActivityType.REASSIGNED : ActivityType.ASSIGNED;

    const updated = await ticketRepo.update(ticketId, { assigneeId: data.assigneeId });

    await activityRepo.create({
      ticketId,
      actorId,
      type,
      details: `Assigned to ${data.assigneeId}`,
    });

    return updated;
  }

  static async updatePriority(ticketId: string, actorId: string, data: UpdatePriorityDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const updated = await ticketRepo.update(ticketId, { priority: data.priority });

    await activityRepo.create({
      ticketId,
      actorId,
      type: ActivityType.STATUS_CHANGED,
      details: `Priority changed from ${ticket.priority} to ${data.priority}`,
    });

    return updated;
  }

  static async replyToTicket(ticketId: string, userId: string, data: ReplyTicketDto) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const reply = await replyRepo.create({
      ticketId,
      userId,
      message: data.message,
      isInternal: data.isInternal,
    });

    return reply;
  }

  static async softDeleteTicket(ticketId: string) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    return ticketRepo.softDelete(ticketId);
  }
}
