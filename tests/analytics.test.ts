import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './setup';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

describe('Analytics API', () => {
  const customerToken = generateToken('customer-123', Role.CUSTOMER);
  const adminToken = generateToken('admin-123', Role.ADMIN);

  describe('GET /api/v1/analytics/overview', () => {
    it('should block non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin users and return overview', async () => {
      prismaMock.ticket.count.mockResolvedValue(10);
      // Prisma raw query mocking for average resolution time
      prismaMock.$queryRaw.mockResolvedValue([{ avg_resolution_time_ms: 3600000 }]);

      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalTickets).toBeDefined();
    });
  });
});
