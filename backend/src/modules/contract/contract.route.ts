import { Router } from 'express';
import { contractController } from './contract.controller';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import {
    contractIdParamSchema,
    createContractSchema,
    updateContractSchema,
} from './contract.validation';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/contracts
router.get('/', (req, res, next) => contractController.getAll(req, res, next));

// GET /api/contracts/:id
router.get(
    '/:id',
    validate(contractIdParamSchema, 'params'),
    (req, res, next) => contractController.getById(req, res, next),
);

// POST /api/contracts
router.post(
    '/',
    validate(createContractSchema, 'body'),
    (req, res, next) => contractController.create(req, res, next),
);

// PUT /api/contracts/:id
router.put(
    '/:id',
    validate(contractIdParamSchema, 'params'),
    validate(updateContractSchema, 'body'),
    (req, res, next) => contractController.update(req, res, next),
);

// DELETE /api/contracts/:id
router.delete(
    '/:id',
    validate(contractIdParamSchema, 'params'),
    (req, res, next) => contractController.remove(req, res, next),
);

export default router;


