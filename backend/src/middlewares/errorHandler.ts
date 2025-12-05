import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../core/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error('Erreur non gérée', err);

  const status =
    (typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      typeof (err as any).status === 'number' &&
      (err as any).status) ||
    500;

  const message =
    (typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      String((err as any).message)) ||
    'Erreur serveur interne';

  res.status(status).json(apiResponse.error(message));
};


