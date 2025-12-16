import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { folderController } from './folder.controller';
import {
  createFolderSchema,
  folderIdParamSchema,
  foldersListQuerySchema,
  updateFolderSchema,
} from './folder.validation';

const router = Router();

// GET /api/folders?parentId=...
router.get(
  '/',
  validate(foldersListQuerySchema, 'query'),
  (req, res, next) => folderController.getAll(req, res, next),
);

// GET /api/folders/:id
router.get(
  '/:id',
  validate(folderIdParamSchema, 'params'),
  (req, res, next) => folderController.getById(req, res, next),
);

// POST /api/folders
router.post(
  '/',
  validate(createFolderSchema, 'body'),
  (req, res, next) => folderController.create(req, res, next),
);

// PUT /api/folders/:id
router.put(
  '/:id',
  validate(folderIdParamSchema, 'params'),
  validate(updateFolderSchema, 'body'),
  (req, res, next) => folderController.update(req, res, next),
);

// DELETE /api/folders/:id
router.delete(
  '/:id',
  validate(folderIdParamSchema, 'params'),
  (req, res, next) => folderController.remove(req, res, next),
);

export default router;






