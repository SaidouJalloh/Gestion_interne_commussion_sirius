import { Router } from 'express';
import { insuranceProviderController } from './insurance-provider.controller';
import { validate } from '../../middlewares/validate';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import {
  simulateSchema,
  referentielQuerySchema,
  compagnieIdParamSchema,
} from './insurance-provider.validation';

const router = Router();

router.use(tenantMiddleware);

// POST /api/insurance-provider/simulate
router.post(
  '/simulate',
  validate(simulateSchema, 'body'),
  (req, res, next) => insuranceProviderController.simulate(req, res, next),
);

// GET /api/insurance-provider/:compagnieId/referentiel?type=packs
router.get(
  '/:compagnieId/referentiel',
  validate(compagnieIdParamSchema, 'params'),
  validate(referentielQuerySchema, 'query'),
  (req, res, next) => insuranceProviderController.getReferentiel(req, res, next),
);

// GET /api/insurance-provider/:compagnieId/info
router.get(
  '/:compagnieId/info',
  validate(compagnieIdParamSchema, 'params'),
  (req, res, next) => insuranceProviderController.getProviderInfo(req, res, next),
);

export default router;
