import { TicketsService } from '../tickets.service';
import { PrismaTicketRepository, PrismaTicketActivityRepository } from '../../../infrastructure/repositories/PrismaRepositories';
import { ActivityType } from '@prisma/client';
import { NotFoundError } from '../../../core/errors/AppError';

// Mock dependencies
vi.mock('../../../infrastructure/repositories/PrismaRepositories', () => {
  return {
    PrismaTicketRepository: vi.fn().mockImplementation(() => ({
      findById: vi.fn(),
      update: vi.fn(),
    })),
    PrismaTicketActivityRepository: vi.fn().mockImplementation(() => ({
      create: vi.fn(),
    })),
    PrismaTicketReplyRepository: vi.fn(),
  };
});

describe('Ticket Assignment & Audit Log Testing (Day 10)', () => {
  let mockTicketRepo: any;
  let mockActivityRepo: any;

  beforeEach(() => {
    mockTicketRepo = new PrismaTicketRepository();
    mockActivityRepo = new PrismaTicketActivityRepository();
    vi.clearAllMocks();
  });

  describe('Admin workflow testing & Assignment testing', () => {
    it('should assign a ticket to an agent successfully and log ASSIGNED activity', async () => {
      const ticketId = 'ticket-123';
      const actorId = 'admin-456';
      const assigneeId = 'agent-789';

      mockTicketRepo.findById.mockResolvedValue({
        id: ticketId,
        assigneeId: null, // Currently unassigned
      });
      mockTicketRepo.update.mockResolvedValue({
        id: ticketId,
        assigneeId,
      });

      const result = await TicketsService.assignTicket(ticketId, actorId, { assigneeId });

      expect(mockTicketRepo.findById).toHaveBeenCalledWith(ticketId);
      expect(mockTicketRepo.update).toHaveBeenCalledWith(ticketId, { assigneeId });
      
      // Audit log validation
      expect(mockActivityRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        ticketId,
        actorId,
        type: ActivityType.ASSIGNED,
        details: `Assigned to ${assigneeId}`,
      }));
      
      expect(result.assigneeId).toBe(assigneeId);
    });

    it('should log REASSIGNED activity when a ticket is already assigned', async () => {
      const ticketId = 'ticket-123';
      const actorId = 'admin-456';
      const newAssigneeId = 'agent-999';

      mockTicketRepo.findById.mockResolvedValue({
        id: ticketId,
        assigneeId: 'agent-old', // Already assigned
      });
      mockTicketRepo.update.mockResolvedValue({
        id: ticketId,
        assigneeId: newAssigneeId,
      });

      await TicketsService.assignTicket(ticketId, actorId, { assigneeId: newAssigneeId });

      // Audit log validation for reassignment
      expect(mockActivityRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        type: ActivityType.REASSIGNED,
        details: `Assigned to ${newAssigneeId}`,
      }));
    });

    it('should throw NotFoundError if ticket does not exist', async () => {
      mockTicketRepo.findById.mockResolvedValue(null);

      await expect(
        TicketsService.assignTicket('invalid-ticket', 'admin-456', { assigneeId: 'agent-123' })
      ).rejects.toThrow(NotFoundError);
      
      // Ensure no audit log is created if ticket is invalid
      expect(mockActivityRepo.create).not.toHaveBeenCalled();
    });
  });
});
