import 'dotenv/config';

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  frontendUrls:
    process.env.FRONTEND_URLS ??
    process.env.FRONTEND_URL ??
    'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
};

if (!env.databaseUrl) {
  // On lève une erreur claire au démarrage si la variable n'est pas définie
  throw new Error(
    'DATABASE_URL n’est pas défini. ' +
      'Ajoute-le dans un fichier .env à la racine du dossier backend (par ex. DATABASE_URL="postgresql://...")',
  );
}


