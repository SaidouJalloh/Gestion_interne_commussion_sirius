import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../admin/utils/apiResponse';

type Segment = 'body' | 'query' | 'params';

export interface Schema<T = any> {
  parse(data: unknown): T;
}

export const validate =
  <T>(schema: Schema<T>, segment: Segment = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line no-param-reassign
      (req as any)[segment] = schema.parse((req as any)[segment]);
      next();
    } catch (error) {
      res
        .status(400)
        .json(
          apiResponse.error(
            "Données de requête invalides",
            'VALIDATION_ERROR',
            error,
          ),
        );
    }
  };


