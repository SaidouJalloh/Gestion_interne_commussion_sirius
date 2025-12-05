import { Router } from 'express';
import { companyController } from './company.controller';
import { validate } from '../../middlewares/validate';
import {
  companyIdParamSchema,
  createCompanySchema,
  updateCompanySchema,
} from './company.validation';

const router = Router();

// GET /api/compagnies
router.get('/', (req, res, next) => companyController.getAll(req, res, next));

// GET /api/compagnies/:id
router.get(
  '/:id',
  validate(companyIdParamSchema, 'params'),
  (req, res, next) => companyController.getById(req, res, next),
);

// POST /api/compagnies
router.post(
  '/',
  validate(createCompanySchema, 'body'),
  (req, res, next) => companyController.create(req, res, next),
);

// PUT /api/compagnies/:id
router.put(
  '/:id',
  validate(companyIdParamSchema, 'params'),
  validate(updateCompanySchema, 'body'),
  (req, res, next) => companyController.update(req, res, next),
);

// DELETE /api/compagnies/:id
router.delete(
  '/:id',
  validate(companyIdParamSchema, 'params'),
  (req, res, next) => companyController.remove(req, res, next),
);

export default router;
