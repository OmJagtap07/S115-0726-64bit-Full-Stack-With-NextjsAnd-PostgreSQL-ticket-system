import { Request, Response, NextFunction  } from 'express';
import { TicketsService } from './tickets.service';
import { Role } from '@prisma/client';
import { logger } from '../../core/logger/winston';

export class TicketsController {
  static async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.createTicket(req.user!.userId, req.body);
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
      
      // DAY 5: Current user middleware and filters implemented here
      if (req.user!.role === Role.CUSTOMER) {
        filters.customerId = req.user!.userId;
      }

      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.assigneeId) filters.assigneeId = req.query.assigneeId;

      // Simple Search by subject or ticket number
      if (req.query.search) {
        filters.OR = [
          { ticketNumber: { contains: req.query.search, mode: 'insensitive' } },
          { subject: { contains: req.query.search, mode: 'insensitive' } }
        ];
      }

      const tickets = await TicketsService.getTickets(filters, skip, limit);
      res.status(200).json({ 
        status: 'success', 
        data: tickets.data,
        meta: { total: tickets.total, page, limit }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.getTicketById(req.params.id);
      
      // Basic authorization
      if (req.user!.role === Role.CUSTOMER && ticket.customerId !== req.user!.userId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.updateStatus(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async assignTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.assignTicket(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async updatePriority(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketsService.updatePriority(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async getReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const replies = await TicketsService.getReplies(req.params.id);
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

      const reply = await TicketsService.replyToTicket(req.params.id, req.user!.userId, req.body);
      
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
      await TicketsService.softDeleteTicket(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
