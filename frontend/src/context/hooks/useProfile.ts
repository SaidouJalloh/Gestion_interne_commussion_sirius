import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Database } from '../../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const API_BASE_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:4000';

/**
 * Recupere le token d'acces depuis le localStorage Supabase (fast path).
 * Evite d'appeler getSession() qui peut bloquer pendant un refresh.
 */
function getAccessTokenFromStorage(): string | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return null;
    const projectRef = supabaseUrl.replace(/https?:\/\//, '').split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Fetch le profil via le backend API /api/auth/me au lieu de Supabase directement.
 * Cela evite le blocage du client Supabase pendant les token refresh.
 */
async function fetchProfileFromApi(token: string): Promise<ProfileRow | null> {
  const orgId = localStorage.getItem('currentOrganizationId');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (orgId) {
    headers['X-Organization-Id'] = orgId;
  }

  const resp = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });

  if (resp.status === 401) {
    throw new Error('AUTH_ERROR');
  }

  if (!resp.ok) {
    throw new Error(`API error: ${resp.status}`);
  }

  const json = await resp.json();
  if (json.success && json.data) {
    return json.data as ProfileRow;
  }
  return null;
}

/**
 * Fetch le profil avec recuperation de session:
 * 1. Tente avec le token courant
 * 2. Si 401, refreshSession() puis retry
 * 3. Si refresh echoue, signOut
 */
async function fetchProfileWithRecovery(userId: string): Promise<ProfileRow | null> {
  const token = getAccessTokenFromStorage();
  if (!token) {
    throw new Error('AUTH_ERROR');
  }

  try {
    return await fetchProfileFromApi(token);
  } catch (err) {
    if (!(err instanceof Error && err.message === 'AUTH_ERROR')) throw err;

    // Token invalide: tenter un refresh
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      await supabase.auth.signOut();
      throw new Error('Session expiree');
    }

    // Retry avec le nouveau token
    return await fetchProfileFromApi(data.session.access_token);
  }
}

/**
 * Hook unifie pour charger le profil utilisateur.
 * Utilise le backend /api/auth/me au lieu de Supabase directement
 * pour eviter les blocages de token refresh.
 */
export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'not_found' | 'error'>('loading');
  const [error, setError] = useState<unknown | null>(null);
  const inflightRef = useRef<Promise<ProfileRow | null> | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async (): Promise<ProfileRow | null> => {
    if (inflightRef.current) {
      return await inflightRef.current;
    }

    const p = (async () => {
      try {
        if (mountedRef.current) {
          setStatus('loading');
          setError(null);
        }

        if (!userId) {
          if (mountedRef.current) {
            setProfile(null);
            setStatus('not_found');
          }
          lastLoadedUserIdRef.current = null;
          return null;
        }

        let data: ProfileRow | null = null;
        try {
          data = await fetchProfileWithRecovery(userId);
        } catch {
          if (mountedRef.current) {
            setProfile(null);
            setStatus('not_found');
          }
          lastLoadedUserIdRef.current = null;
          return null;
        }

        // Retry si profil non trouve
        if (!data) {
          let retryCount = 0;
          while (retryCount < 2 && !data) {
            retryCount += 1;
            await sleep(300 * retryCount);
            const token = getAccessTokenFromStorage();
            if (token) {
              try { data = await fetchProfileFromApi(token); } catch { /* retry */ }
            }
          }
        }

        if (!mountedRef.current) return data;

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
        if (mountedRef.current) {
          setError(err);
          setStatus('error');
        }
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

  // Charger le profil quand userId change
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setStatus('not_found');
      lastLoadedUserIdRef.current = null;
      return;
    }

    if (lastLoadedUserIdRef.current === userId && profile) {
      return;
    }

    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refresh]);

  // Ecouter les changements d'auth pour reagir au logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT' && mountedRef.current) {
          setProfile(null);
          setStatus('not_found');
          lastLoadedUserIdRef.current = null;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { profile, status, error, refresh };
}
