import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { config } from '../../config';
import httpContext from 'express-http-context';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  role?: Role;
}

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role?: Role };
    }
  }
}

const userRepo = new PrismaUserRepository();

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    
    // Fetch user to verify they are active and get their role
    const user = await userRepo.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new UnauthorizedError('User is disabled or not found'));
    }

    req.user = {
      ...decoded,
      role: decoded.role || user.role,
    };
    
    httpContext.set('user', req.user);
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token has expired'));
    }
    return next(new UnauthorizedError('Invalid token'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have the required role to perform this action'));
    }

    next();
  };
};
