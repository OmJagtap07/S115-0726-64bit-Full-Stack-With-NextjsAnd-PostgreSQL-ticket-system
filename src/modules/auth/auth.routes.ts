import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../core/middlewares/validateRequest';
import { authRateLimitMiddleware } from '../../core/middlewares/rateLimiter';
import { loginSchema, registerAdminSchema, refreshTokenSchema } from './auth.dto';

const router = Router();

router.post('/register-admin', authRateLimitMiddleware, validateRequest(registerAdminSchema), AuthController.registerAdmin);
router.post('/login', authRateLimitMiddleware, validateRequest(loginSchema), AuthController.login);
router.post('/refresh-token', authRateLimitMiddleware, validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authRateLimitMiddleware, validateRequest(refreshTokenSchema), AuthController.logout);

export default router;
