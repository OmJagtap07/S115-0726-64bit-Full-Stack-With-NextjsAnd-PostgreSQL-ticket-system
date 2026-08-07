import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './setup';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

describe('Tickets API', () => {
  const customerToken = generateToken('customer-123', Role.CUSTOMER);
  const agentToken = generateToken('agent-123', Role.AGENT);
  const adminToken = generateToken('admin-123', Role.ADMIN);

  describe('GET /api/v1/tickets', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/tickets');
      expect(res.status).toBe(401);
    });

    it('should return list of tickets for authorized user', async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);
      prismaMock.ticket.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/v1/tickets', () => {
    it('should create a new ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        ticketNumber: 'TKT-1234',
        subject: 'Help',
        description: 'Need help',
        status: 'OPEN' as any,
        priority: 'MEDIUM' as any,
        customerId: 'customer-123',
        assigneeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      prismaMock.ticket.create.mockResolvedValue(mockTicket);
      prismaMock.ticketActivity.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          subject: 'Help',
          description: 'Need help',
          priority: 'MEDIUM'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subject).toBe('Help');
    });
  });
});
