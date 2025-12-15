import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { MediaService } from './media.service';
import type {
  CreateMediaInput,
  MediaIdParams,
  MediaListQuery,
  UpdateMediaInput,
} from './media.validation';

const service = new MediaService();

export class MediaController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as MediaListQuery;
      const medias = await service.getAll(query);
      res.json(apiResponse.success(medias));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const media = await service.getById(id);
      if (!media) {
        res.status(404).json(apiResponse.error('Fichier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(media));
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateMediaInput;
      const created = await service.create(payload);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const payload = req.body as UpdateMediaInput;
      const updated = await service.update(id, payload);
      if (!updated) {
        res.status(404).json(apiResponse.error('Fichier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async trash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const updated = await service.trash(id);
      if (!updated) {
        res.status(404).json(apiResponse.error('Fichier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const updated = await service.restore(id);
      if (!updated) {
        res.status(404).json(apiResponse.error('Fichier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const deleted = await service.delete(id);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Fichier non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }
}

export const mediaController = new MediaController();



