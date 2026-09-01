import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const REMEMBER_KEY = 'yaoguang_remember_session_v1';

export function setRememberSession(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, String(remember));
}

const sessionStorageAdapter = {
  getItem(key: string) {
    return localStorage.getItem(REMEMBER_KEY) !== 'false'
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (localStorage.getItem(REMEMBER_KEY) !== 'false') {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        storage: sessionStorageAdapter,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
