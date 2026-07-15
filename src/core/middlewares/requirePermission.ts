import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { PrismaRoleRepository } from '../../infrastructure/repositories/PrismaUserRepositories';
import { redis } from '../cache/redis';

const roleRepo = new PrismaRoleRepository();

export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { userId } = req.user;
      
      // Try to get permissions from cache
      const cacheKey = `user_permissions:${userId}`;
      let permissions: string[] = [];
      const cached = await redis.get(cacheKey);

      if (cached) {
        permissions = JSON.parse(cached);
      } else {
        // Fetch from DB
        permissions = await roleRepo.getUserPermissions(userId);
        // Cache for 1 hour
        await redis.setex(cacheKey, 3600, JSON.stringify(permissions));
      }

      // Allow if user is an ADMIN (System admin logic could be added here, or assume ADMIN has all permissions explicitly mapped in DB)
      // For standard RBAC, check if the required permission is in the user's permission array
      if (!permissions.includes(requiredPermission)) {
        throw new ForbiddenError(`Missing required permission: ${requiredPermission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
