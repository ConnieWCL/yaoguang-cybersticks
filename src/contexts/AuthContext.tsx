import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  isGuest: boolean;
  authPromptOpen: boolean;
  requestAuth: () => void;
  closeAuthPrompt: () => void;
  enterGuest: () => void;
  exitGuest: () => void;
  signOut: () => Promise<void>;
}

const GUEST_KEY = 'yaoguang_guest_mode_v1';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === 'true');
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setAuthPromptOpen(false);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    configured: isSupabaseConfigured,
    isGuest,
    authPromptOpen,
    requestAuth: () => setAuthPromptOpen(true),
    closeAuthPrompt: () => setAuthPromptOpen(false),
    enterGuest: () => {
      localStorage.setItem(GUEST_KEY, 'true');
      setIsGuest(true);
      setAuthPromptOpen(false);
    },
    exitGuest: () => {
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [authPromptOpen, isGuest, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context hooks intentionally live beside their provider to keep the auth boundary cohesive.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
