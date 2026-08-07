import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './setup';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 200 and a token on successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: await bcrypt.hash('password123', 10),
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.session.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        refreshTokenHash: 'hash',
        expiresAt: new Date(),
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(mockUser.email);
    });
  });
});
