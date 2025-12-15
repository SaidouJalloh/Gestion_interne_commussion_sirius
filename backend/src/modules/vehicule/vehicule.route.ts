import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { vehiculeController } from './vehicule.controller';
import {
  createVehiculeSchema,
  updateVehiculeSchema,
  vehiculeIdParamSchema,
  vehiculesListQuerySchema,
} from './vehicule.validation';

const router = Router();

// GET /api/vehicules?contratId=...&active=true
router.get(
  '/',
  validate(vehiculesListQuerySchema, 'query'),
  (req, res, next) => vehiculeController.getAll(req, res, next),
);

// GET /api/vehicules/:id
router.get(
  '/:id',
  validate(vehiculeIdParamSchema, 'params'),
  (req, res, next) => vehiculeController.getById(req, res, next),
);

// POST /api/vehicules
router.post(
  '/',
  validate(createVehiculeSchema, 'body'),
  (req, res, next) => vehiculeController.create(req, res, next),
);

// PUT /api/vehicules/:id
router.put(
  '/:id',
  validate(vehiculeIdParamSchema, 'params'),
  validate(updateVehiculeSchema, 'body'),
  (req, res, next) => vehiculeController.update(req, res, next),
);

// DELETE /api/vehicules/:id (soft delete: actif=false)
router.delete(
  '/:id',
  validate(vehiculeIdParamSchema, 'params'),
  (req, res, next) => vehiculeController.remove(req, res, next),
);

export default router;

