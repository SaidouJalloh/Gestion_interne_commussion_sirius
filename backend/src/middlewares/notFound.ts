import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../admin/utils/apiResponse';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res
    .status(404)
    .json(apiResponse.error(`Route non trouvée: ${req.method} ${req.originalUrl}`));
};


