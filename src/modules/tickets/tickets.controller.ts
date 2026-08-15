import { Request, Response, NextFunction  } from 'express';
import { TicketsService } from './tickets.service';
import { Role } from '@prisma/client';
import { logger } from '../../core/logger/winston';
import { BadRequestError } from '../../core/errors/AppError';

export class TicketsController {
  static async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== Role.CUSTOMER) {
        return res.status(403).json({ status: 'error', message: 'Only customers can create tickets' });
      }
      const ticket = await TicketsService.createTicket(req.user!.userId, req.body, req.file);
      res.status(201).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const skip = (page - 1) * limit;

      // Filtering logic: Agents see all (or assigned), Customers see their own
      const filters: any = { deletedAt: null };
      
      if (req.user!.role === Role.CUSTOMER) {
        filters.customerId = req.user!.userId;
      } else if (req.user!.role === Role.AGENT) {
        filters.assigneeId = req.user!.userId;
      }

      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      
      if (req.user!.role === Role.ADMIN) {
        if (req.query.assigneeId === 'unassigned') {
          filters.assigneeId = null;
        } else if (req.query.assigneeId === 'assigned') {
          filters.assigneeId = { not: null };
        } else if (req.query.assigneeId) {
          filters.assigneeId = req.query.assigneeId;
        }
      }

      if (req.query.startDate && req.query.endDate) {
        filters.createdAt = {
          gte: new Date(req.query.startDate as string),
          lte: new Date(req.query.endDate as string)
        };
      } else if (req.query.startDate) {
        filters.createdAt = { gte: new Date(req.query.startDate as string) };
      } else if (req.query.endDate) {
        filters.createdAt = { lte: new Date(req.query.endDate as string) };
      }

      if (req.query.customer) {
        filters.customer = {
          OR: [
            { name: { contains: req.query.customer as string, mode: 'insensitive' } },
            { email: { contains: req.query.customer as string, mode: 'insensitive' } }
          ]
        };
      }

      // Simple Search by subject or ticket number, description, customer
      if (req.query.search) {
        filters.OR = [
          { ticketNumber: { contains: req.query.search as string, mode: 'insensitive' } },
          { subject: { contains: req.query.search as string, mode: 'insensitive' } },
          { description: { contains: req.query.search as string, mode: 'insensitive' } },
          { customer: { name: { contains: req.query.search as string, mode: 'insensitive' } } },
          { customer: { email: { contains: req.query.search as string, mode: 'insensitive' } } }
        ];
      }

      // Sorting logic
      let orderBy: any = { createdAt: 'desc' };
      if (req.query.sortBy) {
        const sortField = req.query.sortBy as string;
        const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
        
        const allowedSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'ticketNumber'];
        if (allowedSortFields.includes(sortField)) {
          orderBy = { [sortField]: sortOrder };
        }
      }

      const tickets = await TicketsService.getTickets(filters, skip, limit, orderBy);
      const totalPages = Math.ceil(tickets.total / limit);
      res.status(200).json({ 
        status: 'success', 
        data: tickets.data,
        meta: { total: tickets.total, page, limit, totalPages }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.getTicketById(req.params.id as string, req.user! as any);

      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await TicketsService.getSummary(req.user! as any);
      res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.updateStatus(req.params.id as string, req.user! as any, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async assignTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.assignTicket(req.params.id as string, req.user! as any, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async updatePriority(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.updatePriority(req.params.id as string, req.user! as any, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async getReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const replies = await TicketsService.getReplies(req.params.id as string, req.user! as any);
      res.status(200).json({ status: 'success', data: replies });
    } catch (error) {
      next(error);
    }
  }

  static async replyToTicket(req: Request, res: Response, next: NextFunction) {
    try {
      // Basic check: Customers cannot make internal notes
      if (req.user!.role === Role.CUSTOMER && req.body.isInternal) {
         return res.status(403).json({ status: 'error', message: 'Customers cannot create internal notes' });
      }

      const reply = await TicketsService.replyToTicket(req.params.id as string, req.user! as any, req.body, req.file);
      
      setImmediate(() => {
        try {
          // Future: Trigger Socket.io emit or Message Queue payload
          logger.info(`Background processing initiated for ticket reply ${reply.id}`);
        } catch (bgError) {
          logger.error('Background task failed during replyToTicket:', bgError);
        }
      });

      res.status(201).json({ status: 'success', data: reply });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTicket(req: Request, res: Response, next: NextFunction) {
    try {
      await TicketsService.softDeleteTicket(req.params.id as string, req.user! as any);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async downloadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await TicketsService.getAttachmentSecurely(req.params.id as string, req.params.attachmentId as string, req.user! as any);
      // Redirect to the secure Cloudinary URL
      res.redirect(302, attachment.url);
    } catch (error) {
      next(error);
    }
  }
}
