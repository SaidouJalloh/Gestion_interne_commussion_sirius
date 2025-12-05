import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: env.databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['query', 'error', 'warn'],
  });

export const prisma: PrismaClient =
  global.prisma ??
  (() => {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = client;
    }
    logger.info('Prisma client initialisé');
    return client;
  })();


