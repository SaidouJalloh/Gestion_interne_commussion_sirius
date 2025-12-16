import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { SearchService } from './search.service';
import type { SearchQuery } from './search.validation';

const service = new SearchService();

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SearchQuery;
      const result = await service.search(query.q, query.limit ?? 5);
      res.json(apiResponse.success(result));
    } catch (e) {
      next(e);
    }
  }
}

export const searchController = new SearchController();

