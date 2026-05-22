import { Router } from 'express';
import { login, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
export default router;
