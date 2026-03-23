import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

type SupabaseAuthClient = SupabaseClient;

const createSupabaseClient = (): SupabaseAuthClient => {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans les variables d’environnement',
    );
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
};

const createSupabaseAdminClient = (): SupabaseAuthClient => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d' +
      'environnement',
    );
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export class AuthService {
  private client: SupabaseAuthClient;

  constructor() {
    this.client = createSupabaseClient();
  }

  async signup(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw Object.assign(new Error(error.message), { status: 400 });
    }

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw Object.assign(new Error(error.message), { status: 401 });
    }

    return data;
  }

  async getUserFromToken(accessToken: string) {
    const { data, error } = await this.client.auth.getUser(accessToken);

    if (error || !data.user) {
      throw Object.assign(
        new Error(error?.message ?? "Token d'authentification invalide"),
        { status: 401 },
      );
    }

    return data.user;
  }

  /**
   * Créer un utilisateur admin via Supabase Admin API
   * Cette méthode utilise SUPABASE_SERVICE_ROLE_KEY pour créer un utilisateur
   * sans nécessiter de confirmation email
   */
  async createAdminUser(email: string, password: string): Promise<string> {
    console.log('Build: Creating Supabase Admin Client...');
    const adminClient = createSupabaseAdminClient();
    console.log('Build: Supabase Admin Client created. calling auth.admin.createUser...');

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmer l'email automatiquement
    });
    console.log('Build: auth.admin.createUser returned', { userId: data?.user?.id, error: error?.message });

    if (error) {
      const errorMessage =
        error.message === 'User already registered'
          ? 'Un utilisateur avec cet email existe déjà'
          : error.message;
      throw Object.assign(new Error(errorMessage), { status: 400 });
    }

    if (!data.user || !data.user.id) {
      throw Object.assign(
        new Error('Erreur lors de la création de l\'utilisateur'),
        { status: 500 },
      );
    }

    return data.user.id;
  }

  /**
   * Chercher un utilisateur Supabase par email via l'Admin API
   */
  async findUserByEmail(email: string): Promise<string | null> {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error || !data?.users) return null;
    const found = data.users.find(u => u.email === email);
    return found?.id || null;
  }
}


