import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Database } from '../../types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Helper: attend que la session soit disponible (ou sign-in)
async function waitForSession(timeoutMs = 8000) {
  // 1) Essai direct
  const { data: initData } = await supabase.auth.getSession();
  if (initData?.session?.user) {
    return initData.session;
  }

  // 2) Écoute un changement d'état d'auth
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sub?.unsubscribe();
      reject(new Error('Timeout: session indisponible'));
    }, timeoutMs);

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          clearTimeout(timer);
          sub?.unsubscribe();
          resolve(session);
        }
      }
    );
  });
}

async function fetchProfileOnce(userId: string, timeoutMs = 5000): Promise<ProfileRow | null> {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout: fetchProfile')), timeoutMs)
  );

  const fetchPromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // null si non trouvé

  const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
    data: ProfileRow | null;
    error: unknown;
  };
  const { data, error } = result;
  if (error) throw error;
  return data || null;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'not_found' | 'error'>('loading');
  const [error, setError] = useState<unknown | null>(null);
  const retryCountRef = useRef(0);
  const initializedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setProfile(null);
        setStatus('not_found');
        return null;
      }

      // Retry jusqu'à 2 fois si vide
      let data = null;
      retryCountRef.current = 0;
      do {
        data = await fetchProfileOnce(session.user.id);
        if (data) break;
        retryCountRef.current += 1;
        if (retryCountRef.current <= 2) {
          await sleep(300 * retryCountRef.current); // backoff
        }
      } while (retryCountRef.current <= 2);

      if (!data) {
        setProfile(null);
        setStatus('not_found');
        return null;
      }

      setProfile(data);
      setStatus('loaded');
      return data;
    } catch (err) {
      console.error('useProfile.refresh error:', err);
      setError(err);
      setStatus('error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let unsub = null;
    (async () => {
      try {
        // Attendre une session valide
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          try {
            await waitForSession();
          } catch {
            // Pas de session -> on reste en not_found
            setStatus('not_found');
          }
        }
        await refresh();
      } catch (e) {
        console.error('useProfile init error:', e);
        setStatus('error');
        setError(e);
      }
    })();

    // Recharger le profil sur changement d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setStatus('not_found');
          return;
        }
        if (event === 'SIGNED_IN') {
          // Important: éviter d'afficher l'ancien profil juste après un nouveau login
          setProfile(null);
          setStatus('loading');
        }
        if (session?.user) {
          await refresh();
        }
      }
    );
    unsub = () => subscription?.unsubscribe();

    return () => {
      unsub?.();
    };
  }, [refresh]);

  return { profile, status, error, refresh };
}


