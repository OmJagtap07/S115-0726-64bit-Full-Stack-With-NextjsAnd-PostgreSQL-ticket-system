import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getOverview();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getTrends();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getWorkload();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  static async getStatusDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getStatusDistribution();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  static async getPriorityDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getPriorityDistribution();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}
