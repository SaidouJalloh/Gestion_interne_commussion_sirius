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
}


