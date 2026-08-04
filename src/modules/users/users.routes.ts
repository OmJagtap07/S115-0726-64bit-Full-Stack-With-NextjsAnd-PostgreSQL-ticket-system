import { Router } from 'express';
import { UsersController } from './users.controller';
import { validateRequest } from '../../core/middlewares/validateRequest';
import { requireAuth, requireRole } from '../../core/middlewares/requireAuth';
import { createUserSchema, updateUserSchema } from './users.dto';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// User Profiles & Agents (Accessible to all authenticated users)
router.get('/me', UsersController.getMe);
router.get('/agents', UsersController.getAgents);

// User Management (Admin only)
router.post('/', requireRole(['ADMIN']), validateRequest(createUserSchema), UsersController.createUser);
router.get('/', requireRole(['ADMIN']), UsersController.getUsers);
router.get('/:id', requireRole(['ADMIN']), UsersController.getUserById);
router.patch('/:id', requireRole(['ADMIN']), validateRequest(updateUserSchema), UsersController.updateUser);

export default router;
