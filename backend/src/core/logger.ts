/* Logger minimal, extensible plus tard si besoin */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  info: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, meta ?? '');
  },
  warn: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta ?? '');
  },
  error: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta ?? '');
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, meta ?? '');
    }
  },
};


