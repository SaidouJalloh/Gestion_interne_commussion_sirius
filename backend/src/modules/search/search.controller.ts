import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { SearchService } from './search.service';
import type { SearchQuery } from './search.validation';

const service = new SearchService();

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SearchQuery;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const result = await service.search(query.q, organizationId, query.limit ?? 5);
      res.json(apiResponse.success(result));
    } catch (e) {
      next(e);
    }
  }
}

export const searchController = new SearchController();

