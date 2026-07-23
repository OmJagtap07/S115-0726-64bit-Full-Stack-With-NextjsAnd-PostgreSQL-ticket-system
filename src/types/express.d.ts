import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        sessionId: string;
        role?: Role;
      };
    }
  }
}
