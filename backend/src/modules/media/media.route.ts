import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { mediaController } from './media.controller';
import {
  createMediaSchema,
  mediaIdParamSchema,
  mediaListQuerySchema,
  updateMediaSchema,
} from './media.validation';

const router = Router();

// Toutes les routes nécessitent un tenant
router.use(tenantMiddleware);

// GET /api/media?folderId=...&trashed=true|false
router.get(
  '/',
  validate(mediaListQuerySchema, 'query'),
  (req, res, next) => mediaController.getAll(req, res, next),
);

// GET /api/media/:id
router.get(
  '/:id',
  validate(mediaIdParamSchema, 'params'),
  (req, res, next) => mediaController.getById(req, res, next),
);

// POST /api/media
router.post(
  '/',
  validate(createMediaSchema, 'body'),
  (req, res, next) => mediaController.create(req, res, next),
);

// PUT /api/media/:id
router.put(
  '/:id',
  validate(mediaIdParamSchema, 'params'),
  validate(updateMediaSchema, 'body'),
  (req, res, next) => mediaController.update(req, res, next),
);

// PATCH /api/media/:id/trash
router.patch(
  '/:id/trash',
  validate(mediaIdParamSchema, 'params'),
  (req, res, next) => mediaController.trash(req, res, next),
);

// PATCH /api/media/:id/restore
router.patch(
  '/:id/restore',
  validate(mediaIdParamSchema, 'params'),
  (req, res, next) => mediaController.restore(req, res, next),
);

// DELETE /api/media/:id
router.delete(
  '/:id',
  validate(mediaIdParamSchema, 'params'),
  (req, res, next) => mediaController.remove(req, res, next),
);

export default router;








