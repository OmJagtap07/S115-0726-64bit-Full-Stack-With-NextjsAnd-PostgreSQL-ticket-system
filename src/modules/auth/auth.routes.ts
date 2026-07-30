import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../core/middlewares/validateRequest';
import { authRateLimitMiddleware } from '../../core/middlewares/rateLimiter';
import { loginSchema, registerAdminSchema, refreshTokenSchema } from './auth.dto';

const router = Router();

/**
 * @swagger
 * /auth/register-admin:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register-admin', authRateLimitMiddleware, validateRequest(registerAdminSchema), AuthController.registerAdmin);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authRateLimitMiddleware, validateRequest(loginSchema), AuthController.login);
router.post('/register', authRateLimitMiddleware, validateRequest(registerAdminSchema), AuthController.register);
router.post('/refresh-token', authRateLimitMiddleware, validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authRateLimitMiddleware, validateRequest(refreshTokenSchema), AuthController.logout);

export default router;
