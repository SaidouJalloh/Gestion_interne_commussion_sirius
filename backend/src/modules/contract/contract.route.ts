import { Router } from 'express';
import { contractController } from './contract.controller';

const router = Router();

// GET /api/contrats
router.get('/', (req, res, next) => contractController.getAll(req, res, next));

export default router;


