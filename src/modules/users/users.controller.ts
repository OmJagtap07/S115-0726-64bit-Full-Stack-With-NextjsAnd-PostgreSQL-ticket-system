import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.createUser(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UsersService.getUsers(req.query);
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.getUserById(req.params.id as string);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.getUserById(req.user!.userId);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const include = {
        _count: {
          select: {
            ticketsAssigned: {
              where: { status: { not: 'CLOSED' } }
            }
          }
        }
      };
      const agents = await UsersService.getUsers({ role: 'AGENT' }, include);
      res.status(200).json({ status: 'success', data: agents });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.updateUser(req.params.id as string, req.body);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      // Users can only change their own password, getting ID from req.user
      const result = await UsersService.changePassword(req.user!.userId, req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
