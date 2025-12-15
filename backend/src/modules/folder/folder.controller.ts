import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../utils/apiResponse';
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
      const folders = await service.getAll(query);
      res.json(apiResponse.success(folders));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const folder = await service.getById(id);
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
      const created = await service.create(payload);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as FolderIdParams;
      const payload = req.body as UpdateFolderInput;
      const updated = await service.update(id, payload);
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
      const deleted = await service.delete(id);
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



