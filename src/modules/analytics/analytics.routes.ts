import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { requireAuth, requireRole } from '../../core/middlewares/requireAuth';
import { Role } from '@prisma/client';

const router = Router();

// Protect all analytics routes - only ADMIN can access
router.use(requireAuth);
router.use(requireRole([Role.ADMIN]));

router.get('/overview', AnalyticsController.getOverview);
router.get('/trends', AnalyticsController.getTrends);
router.get('/workload', AnalyticsController.getWorkload);
router.get('/status', AnalyticsController.getStatusDistribution);
router.get('/priority', AnalyticsController.getPriorityDistribution);

export default router;
