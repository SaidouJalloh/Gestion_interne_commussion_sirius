import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { FolderService } from './folder.service';
import type {
  CreateFolderInput,
  FolderIdParams,
  FoldersListQuery,
  UpdateFolderInput,
} from './folder.validation';

const service = new FolderService();

export class FolderController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as FoldersListQuery;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const folders = await service.getAll(query, organizationId);
      res.json(apiResponse.success(folders));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const folder = await service.getById(id, organizationId);
      if (!folder) {
        res.status(404).json(apiResponse.error('Dossier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(folder));
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateFolderInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const created = await service.create(payload, organizationId);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const payload = req.body as UpdateFolderInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.update(id, payload, organizationId);
      if (!updated) {
        res.status(404).json(apiResponse.error('Dossier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const deleted = await service.delete(id, organizationId);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Dossier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }
}

export const folderController = new FolderController();








