import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const medias = await service.getAll(query, organizationId);
      res.json(apiResponse.success(medias));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as MediaIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const media = await service.getById(id, organizationId);
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
      const { id } = req.params as unknown as MediaIdParams;
      const payload = req.body as UpdateMediaInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.update(id, payload, organizationId);
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.trash(id, organizationId);
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.restore(id, organizationId);
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const deleted = await service.delete(id, organizationId);
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








