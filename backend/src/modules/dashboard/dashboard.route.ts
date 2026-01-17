import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/dashboard
router.get('/', (req, res, next) => dashboardController.get(req, res, next));

export default router;








