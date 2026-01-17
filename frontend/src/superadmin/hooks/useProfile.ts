import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Database } from '../../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Attendre que la session Supabase soit prête
async function waitForSupabaseReady(maxWaitMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const { data, error } = await supabase.auth.getSession();

      // Si on a une session valide avec un user, on est prêt
      if (data?.session?.user) {
        return true;
      }

      // Si on a une erreur explicite (pas juste pas de session), on continue d'attendre
      if (error) {
        console.warn('waitForSupabaseReady: erreur lors de la vérification de session:', error);
      }
    } catch (err) {
      // Ignorer les erreurs temporaires, on réessaie
      console.warn('waitForSupabaseReady: exception temporaire:', err);
    }
    await sleep(200);
  }
  return false;
}

async function fetchProfileOnce(userId: string, timeoutMs = 30000): Promise<ProfileRow | null> {
  const ready = await waitForSupabaseReady();

  // Si Supabase n'est pas prêt, ne pas faire la requête (elle bloquerait)
  if (!ready) {
    throw new Error('Supabase session not ready');
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout: fetchProfile')), timeoutMs)
  );

  const fetchPromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  console.log(`[Profile Debug] fetchProfileOnce: Démarrage fetch pour ${userId}`);

  const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
    data: ProfileRow | null;
    error: unknown;
  };
  const { data, error } = result;

  if (error) {
    console.error('[Profile Debug] fetchProfileOnce: Erreur Supabase', error);
    throw error;
  }

  console.log(`[Profile Debug] fetchProfileOnce: Résultat`, data ? 'Trouvé' : 'Non trouvé');
  return data || null;
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'not_found' | 'error'>('loading');
  const [error, setError] = useState<unknown | null>(null);
  const retryCountRef = useRef(0);
  const inflightRef = useRef<Promise<ProfileRow | null> | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (inflightRef.current) {
      return await inflightRef.current;
    }

    const p = (async () => {
      try {
        setStatus('loading');
        setError(null);

        if (!userId) {
          setProfile(null);
          setStatus('not_found');
          lastLoadedUserIdRef.current = null;
          return null;
        }

        let data = null;
        retryCountRef.current = 0;
        do {
          data = await fetchProfileOnce(userId);
          if (data) break;
          retryCountRef.current += 1;
          if (retryCountRef.current <= 2) {
            await sleep(300 * retryCountRef.current); // backoff
          }
        } while (retryCountRef.current <= 2);

        if (!data) {
          setProfile(null);
          setStatus('not_found');
          lastLoadedUserIdRef.current = null;
          return null;
        }

        setProfile(data);
        setStatus('loaded');
        lastLoadedUserIdRef.current = userId;
        return data;
      } catch (err) {
        console.error('useProfile.refresh error:', err);
        setError(err);
        setStatus('error');
        lastLoadedUserIdRef.current = null;
        return null;
      }
    })();

    inflightRef.current = p;
    try {
      return await p;
    } finally {
      inflightRef.current = null;
    }
  }, [userId]);

  useEffect(() => {
    // Réinitialiser l'état si userId devient null
    if (!userId) {
      setProfile(null);
      setStatus('not_found');
      lastLoadedUserIdRef.current = null;
      return;
    }

    // Ne charger que si le userId a changé
    if (lastLoadedUserIdRef.current === userId) {
      return;
    }

    // Charger le profil pour le nouveau userId
    refresh();
  }, [userId, refresh]);

  return { profile, status, error, refresh };
}
