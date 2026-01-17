import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { paymentController } from './payment.controller';
import {
  createPaymentSchema,
  paymentIdParamSchema,
  paymentsListQuerySchema,
  updatePaymentSchema,
} from './payment.validation';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/payments
router.get(
  '/',
  validate(paymentsListQuerySchema, 'query'),
  (req, res, next) => paymentController.getAll(req, res, next),
);

// GET /api/payments/:id
router.get(
  '/:id',
  validate(paymentIdParamSchema, 'params'),
  (req, res, next) => paymentController.getById(req, res, next),
);

// POST /api/payments
router.post(
  '/',
  validate(createPaymentSchema, 'body'),
  (req, res, next) => paymentController.create(req, res, next),
);

// PUT /api/payments/:id
router.put(
  '/:id',
  validate(paymentIdParamSchema, 'params'),
  validate(updatePaymentSchema, 'body'),
  (req, res, next) => paymentController.update(req, res, next),
);

// DELETE /api/payments/:id
router.delete(
  '/:id',
  validate(paymentIdParamSchema, 'params'),
  (req, res, next) => paymentController.remove(req, res, next),
);

export default router;








