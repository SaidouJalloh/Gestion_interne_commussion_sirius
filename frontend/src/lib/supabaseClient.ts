import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // On garde une vérification runtime claire pour l'environnement
  // et on aide TypeScript avec l'assertion non-nulle plus bas.
  // eslint-disable-next-line no-console
  console.error('❌ Variables Supabase manquantes !');
  // eslint-disable-next-line no-console
  console.error('URL:', supabaseUrl);
  // eslint-disable-next-line no-console
  console.error('Key:', supabaseAnonKey);
  throw new Error("Les variables d'environnement Supabase sont manquantes");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getUserProfile = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching profile:', error);
      return null;
    }

    return { ...user, ...profile };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getUserProfile error:', error);
    return null;
  }
};


