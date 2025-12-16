import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { searchController } from './search.controller';
import { searchQuerySchema } from './search.validation';

const router = Router();

// GET /api/search?q=...&limit=5
router.get(
  '/',
  validate(searchQuerySchema, 'query'),
  (req, res, next) => searchController.search(req, res, next),
);

export default router;

