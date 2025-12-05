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

// On mutualise l'instance Prisma dans le scope global
// pour éviter d'épuiser le pool de connexions, y compris en production.
if (!global.prisma) {
  global.prisma = createPrismaClient();
  logger.info('Prisma client initialisé');
}

export const prisma: PrismaClient = global.prisma;


