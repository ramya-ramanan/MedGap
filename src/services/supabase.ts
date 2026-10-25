import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'medgap_supabase_url',
  KEY: 'medgap_supabase_anon_key',
};

// Check environment variables first, then local storage configuration
export const getSupabaseConfig = (): { url: string; anonKey: string; isConfigured: boolean } => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.KEY) || '' : '';

  const url = envUrl || storedUrl;
  const anonKey = envKey || storedKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('your-anon-key') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
};

export const setSupabaseConfig = (url: string, anonKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.KEY, anonKey.trim());
    supabaseInstance = null; // Reset cached instance
  }
};

export const clearSupabaseConfig = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.KEY);
    supabaseInstance = null;
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseLive = async (): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('medications').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
