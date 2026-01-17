import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { clientController } from './client.controller';
import {
    clientIdParamSchema,
    createClientSchema,
    updateClientSchema,
} from './client.validation';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/clients
router.get('/', (req, res, next) => clientController.getAll(req, res, next));

// GET /api/clients/:id
router.get(
    '/:id',
    validate(clientIdParamSchema, 'params'),
    (req, res, next) => clientController.getById(req, res, next),
);

// POST /api/clients
router.post(
    '/',
    validate(createClientSchema, 'body'),
    (req, res, next) => clientController.create(req, res, next),
);

// PUT /api/clients/:id
router.put(
    '/:id',
    validate(clientIdParamSchema, 'params'),
    validate(updateClientSchema, 'body'),
    (req, res, next) => clientController.update(req, res, next),
);

// DELETE /api/clients/:id
router.delete(
    '/:id',
    validate(clientIdParamSchema, 'params'),
    (req, res, next) => clientController.remove(req, res, next),
);

export default router;








