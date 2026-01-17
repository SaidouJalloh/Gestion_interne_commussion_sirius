import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { notificationController } from './notification.controller';
import {
  notificationIdParamSchema,
  notificationsListQuerySchema,
  updateNotificationSchema,
} from './notification.validation';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/notifications?limit=50&statut=non_lu
router.get(
  '/',
  validate(notificationsListQuerySchema, 'query'),
  (req, res, next) => notificationController.getAll(req, res, next),
);

// GET /api/notifications/:id
router.get(
  '/:id',
  validate(notificationIdParamSchema, 'params'),
  (req, res, next) => notificationController.getById(req, res, next),
);

// PUT /api/notifications/:id
router.put(
  '/:id',
  validate(notificationIdParamSchema, 'params'),
  validate(updateNotificationSchema, 'body'),
  (req, res, next) => notificationController.update(req, res, next),
);

// DELETE /api/notifications/:id
router.delete(
  '/:id',
  validate(notificationIdParamSchema, 'params'),
  (req, res, next) => notificationController.remove(req, res, next),
);

export default router;

