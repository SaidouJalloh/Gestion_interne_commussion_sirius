// Charger dotenv en premier, avant tout autre import
import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { logger } from './core/logger';

const PORT = env.port;

app.listen(PORT, () => {
  logger.info(`✅ API Sirius backend démarrée sur le port ${PORT}`);
});
