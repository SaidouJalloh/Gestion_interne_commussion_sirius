import express from 'express';
import cors, { CorsOptions } from 'cors';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

const app = express();

const allowedOrigins = env.frontendUrls
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permet les requêtes sans origine (Postman, requêtes serveur à serveur)
    if (!origin) {
      return callback(null, true);
    }

    // Wildcard: autorise toutes les origines si configuré
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Vérifie si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    // Bloque les origines non autorisées
    const err = new Error(
      `Origine "${origin}" non autorisée par la configuration CORS`,
    ) as Error & { status?: number };
    err.status = 403;
    return callback(err, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;


