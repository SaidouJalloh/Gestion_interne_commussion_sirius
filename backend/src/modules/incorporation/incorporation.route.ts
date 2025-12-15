import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { incorporationController } from './incorporation.controller';
import {
  createIncorporationSchema,
  incorporationIdParamSchema,
  incorporationsListQuerySchema,
} from './incorporation.validation';

const router = Router();

// GET /api/incorporations?contratId=...
router.get(
  '/',
  validate(incorporationsListQuerySchema, 'query'),
  (req, res, next) => incorporationController.getAll(req, res, next),
);

// GET /api/incorporations/:id
router.get(
  '/:id',
  validate(incorporationIdParamSchema, 'params'),
  (req, res, next) => incorporationController.getById(req, res, next),
);

// POST /api/incorporations
router.post(
  '/',
  validate(createIncorporationSchema, 'body'),
  (req, res, next) => incorporationController.create(req, res, next),
);

export default router;

