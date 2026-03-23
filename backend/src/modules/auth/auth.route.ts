import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

// GET /api/auth/me - Profil de l'utilisateur connecte
router.get('/me', controller.me.bind(controller));

export default router;
