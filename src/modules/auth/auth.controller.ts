import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ status: 'success', data: { userId: result.user.id } });
    } catch (error) {
      next(error);
    }
  }

  static async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerAdmin(req.body);
      res.status(201).json({ status: 'success', data: { userId: result.user.id } });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerCustomer(req.body);
      res.status(201).json({ status: 'success', data: { userId: result.user.id } });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await AuthService.login(req.body);
      res.status(200).json({ status: 'success', data: { accessToken, refreshToken } });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refreshToken(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.body);
      res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
