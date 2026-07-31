import { Router } from 'express';
import { TicketsController } from './tickets.controller';
import { validateRequest } from '../../core/middlewares/validateRequest';
import { requireAuth, requireRole } from '../../core/middlewares/requireAuth';
import { createTicketSchema, replyTicketSchema, updateStatusSchema, assignTicketSchema, updatePrioritySchema } from './tickets.dto';

const router = Router();

router.use(requireAuth);

// Ticket CRUD
router.post('/', validateRequest(createTicketSchema), TicketsController.createTicket);
router.get('/', TicketsController.getTickets);
router.get('/:id', TicketsController.getTicketById);
router.delete('/:id', requireRole(['ADMIN']), TicketsController.deleteTicket); // Only admins can delete

// Action-specific updates
router.patch('/:id/status', requireRole(['ADMIN', 'AGENT']), validateRequest(updateStatusSchema), TicketsController.updateStatus);
router.patch('/:id/assign', requireRole(['ADMIN']), validateRequest(assignTicketSchema), TicketsController.assignTicket);
router.patch('/:id/priority', requireRole(['ADMIN', 'AGENT']), validateRequest(updatePrioritySchema), TicketsController.updatePriority);

// Replies
router.get('/:id/replies', TicketsController.getReplies);
router.post('/:id/replies', validateRequest(replyTicketSchema), TicketsController.replyToTicket);

export default router;
