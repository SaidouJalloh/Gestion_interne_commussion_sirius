import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

// GET /api/dashboard
router.get('/', (req, res, next) => dashboardController.get(req, res, next));

export default router;






