import { Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../requireAuth';
import { UnauthorizedError, ForbiddenError } from '../../errors/AppError';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('jsonwebtoken');
vi.mock('../../infrastructure/repositories/PrismaRepositories', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn().mockResolvedValue({ id: '123', isActive: true, role: Role.ADMIN }),
  })),
}));

describe('Authorization Middleware (Day 9)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  describe('Security & Negative Testing', () => {
    it('should throw UnauthorizedError if no auth header is provided', async () => {
      await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ message: 'Authentication token is missing or invalid' }));
    });

    it('should throw UnauthorizedError if token format is invalid (no Bearer)', async () => {
      mockReq.headers = { authorization: 'Basic my-token' };
      await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError for expired tokens', async () => {
      mockReq.headers = { authorization: 'Bearer expired-token' };
      (jwt.verify as any).mockImplementation(() => { throw new jwt.TokenExpiredError('jwt expired', new Date()); });
      
      await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token has expired' }));
    });
  });

  describe('Permission Testing (Role-based access)', () => {
    it('Admin middleware should allow access if user is ADMIN', () => {
      mockReq.user = { userId: '123', sessionId: '456', role: Role.ADMIN };
      const middleware = requireRole([Role.ADMIN]);
      
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); // No error passed
    });

    it('Agent middleware should deny access if user is CUSTOMER', () => {
      mockReq.user = { userId: '123', sessionId: '456', role: Role.CUSTOMER };
      const middleware = requireRole([Role.AGENT, Role.ADMIN]);
      
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({ message: 'You do not have the required role to perform this action' }));
    });
  });
});
