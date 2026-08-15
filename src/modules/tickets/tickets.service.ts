import { CreateTicketDto, ReplyTicketDto, UpdateStatusDto, AssignTicketDto, UpdatePriorityDto } from './tickets.dto';
import { PrismaTicketRepository, PrismaTicketReplyRepository, PrismaTicketActivityRepository, PrismaUserRepository, PrismaAttachmentRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../core/errors/AppError';
import { TicketStatus, ActivityType, Priority, Role } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import crypto from 'crypto';

const ticketRepo = new PrismaTicketRepository();
const replyRepo = new PrismaTicketReplyRepository();
const activityRepo = new PrismaTicketActivityRepository();
const userRepo = new PrismaUserRepository();
const attachmentRepo = new PrismaAttachmentRepository();

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
      if ((currentStatus === TicketStatus.OPEN || currentStatus === TicketStatus.IN_PROGRESS) && newStatus === TicketStatus.CLOSED) return;
      throw new ConflictError('Customers can only transition a ticket to CLOSED.');
    }

    if (user.role === Role.AGENT || user.role === Role.ADMIN) {
      if (currentStatus === TicketStatus.UNASSIGNED && newStatus === TicketStatus.OPEN) return;
      if (currentStatus === TicketStatus.OPEN && newStatus === TicketStatus.IN_PROGRESS) return;
      if (currentStatus === TicketStatus.IN_PROGRESS && newStatus === TicketStatus.CLOSED) return;

      throw new ConflictError('Agents can only transition tickets from UNASSIGNED to OPEN, OPEN to IN_PROGRESS, or IN_PROGRESS to CLOSED.');
    }

    throw new ConflictError('Invalid state transition.');
  }
  static async createTicket(customerId: string, data: CreateTicketDto, file?: Express.Multer.File) {
    const ticketNumber = `TKT-${crypto.randomInt(1000, 99999)}`;

    const ticket = await ticketRepo.create({
      ticketNumber,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      customerId,
    });

    if (file) {
      const uploadResult = await CloudinaryService.uploadStream(file.buffer, `tickets/${ticket.id}/attachments`);
      await attachmentRepo.create({
        ticketId: ticket.id,
        filename: file.originalname,
        url: uploadResult.secure_url,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    await activityRepo.create({
      ticketId: ticket.id,
      actorId: customerId,
      type: ActivityType.CREATED,
      details: file ? 'Ticket created with attachment' : 'Ticket created',
    });

    return ticketRepo.findById(ticket.id);
  }

  static async getTickets(filters?: any, skip?: number, take?: number, orderBy?: any) {
    return ticketRepo.findAll(filters, skip, take, orderBy);
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

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ConflictError('Cannot assign a closed ticket.');
    }

    const targetUser = await userRepo.findById(data.assigneeId);
    if (!targetUser || !targetUser.isActive || targetUser.role !== Role.AGENT) {
      throw new BadRequestError('The selected user is not a valid agent.');
    }

    const type = ticket.assigneeId ? ActivityType.REASSIGNED : ActivityType.ASSIGNED;

    const newStatus = ticket.status === TicketStatus.UNASSIGNED ? TicketStatus.OPEN : ticket.status;
    const updated = await ticketRepo.update(ticketId, { assigneeId: data.assigneeId, status: newStatus });

    await activityRepo.create({
      ticketId,
      actorId: user.userId,
      type,
      details: `Assigned to ${data.assigneeId}`,
    });
    
    if (newStatus !== ticket.status) {
      await activityRepo.create({
        ticketId,
        actorId: user.userId,
        type: ActivityType.STATUS_CHANGED,
        details: `Status automatically changed from ${ticket.status} to ${newStatus} upon assignment`,
      });
    }

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

  static async replyToTicket(ticketId: string, user: AuthUser, data: ReplyTicketDto, file?: Express.Multer.File) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ConflictError('Cannot reply to a closed ticket.');
    }

    if (!data.message && !file) {
      throw new BadRequestError('A reply must contain either a message or an attachment.');
    }

    const isInternal = user.role === Role.CUSTOMER ? false : data.isInternal;

    const reply = await replyRepo.create({
      ticketId,
      userId: user.userId,
      message: data.message,
      isInternal,
    });

    if (file) {
      const uploadResult = await CloudinaryService.uploadStream(file.buffer, `tickets/${ticketId}/replies/${reply.id}`);
      await attachmentRepo.create({
        ticketId,
        replyId: reply.id,
        filename: file.originalname,
        url: uploadResult.secure_url,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

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
      details: file ? `${details} with attachment` : details,
    });

    // Notify appropriately
    if (isInternal) {
      // Internal note - notification removed
    } else if (user.role === Role.CUSTOMER) {
      if (ticket.assigneeId) {
        // Customer replied - notification removed
      } else {
        // Unassigned ticket - notification removed
      }
    } else {
      // Agent or Admin replied - notification removed
    }

    // Auto transition OPEN to IN_PROGRESS upon first agent reply
    if (!isInternal && user.role === Role.AGENT && ticket.status === TicketStatus.OPEN) {
      await ticketRepo.update(ticketId, { status: TicketStatus.IN_PROGRESS });
      await activityRepo.create({
        ticketId,
        actorId: user.userId,
        type: ActivityType.STATUS_CHANGED,
        details: 'Status automatically changed from OPEN to IN_PROGRESS upon agent reply',
      });
    }

    // We must return the reply with the attachment included, so we refetch it if file exists
    if (file) {
      const replies = await replyRepo.findAllByTicket(ticketId);
      const updatedReply = replies.find(r => r.id === reply.id);
      return updatedReply || reply;
    }

    return reply;
  }

  static async softDeleteTicket(ticketId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    return ticketRepo.softDelete(ticketId);
  }

  static async getAttachmentSecurely(ticketId: string, attachmentId: string, user: AuthUser) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    this.authorizeTicketAccess(user, ticket);

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.ticketId !== ticketId) {
      throw new NotFoundError('Attachment not found');
    }

    return attachment;
  }

  static async getSummary(user: AuthUser) {
    if (user.role === Role.ADMIN) {
      const [totalOpen, unassigned, assigned] = await Promise.all([
        prisma.ticket.count({ where: { status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { status: 'UNASSIGNED', deletedAt: null } }),
        prisma.ticket.count({ where: { assigneeId: { not: null }, deletedAt: null } }),
      ]);
      return { totalOpen, unassigned, assigned };
    }

    if (user.role === Role.AGENT) {
      // Resolved Today: updated today and status = CLOSED
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [myOpen, inProgress, resolvedToday] = await Promise.all([
        prisma.ticket.count({ where: { assigneeId: user.userId, status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { assigneeId: user.userId, status: 'IN_PROGRESS', deletedAt: null } }),
        prisma.ticket.count({ 
          where: { 
            assigneeId: user.userId, 
            status: 'CLOSED', 
            updatedAt: { gte: startOfDay },
            deletedAt: null 
          } 
        }),
      ]);
      return { myOpen, inProgress, resolvedToday };
    }

    if (user.role === Role.CUSTOMER) {
      const [myTickets, unassigned, openRequests, recentlyResolved] = await Promise.all([
        prisma.ticket.count({ where: { customerId: user.userId, deletedAt: null } }),
        prisma.ticket.count({ where: { customerId: user.userId, status: 'UNASSIGNED', deletedAt: null } }),
        prisma.ticket.count({ where: { customerId: user.userId, status: 'OPEN', deletedAt: null } }),
        prisma.ticket.count({ where: { customerId: user.userId, status: 'CLOSED', deletedAt: null } }),
      ]);
      return { myTickets, openRequests: unassigned + openRequests, recentlyResolved };
    }

    return {};
  }
}
