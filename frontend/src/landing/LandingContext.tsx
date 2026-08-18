import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export type LandingSection =
  | 'pantheon'
  | 'knowledge'
  | 'oracle'
  | 'rituals'
  | 'auth'
  | 'cabinet'
  | 'support';

const AUTH_REQUIRED: LandingSection[] = ['rituals', 'cabinet'];

type LandingContextValue = {
  active: LandingSection | null;
  openSection: (section: LandingSection) => void;
  closeSection: () => void;
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [active, setActive] = useState<LandingSection | null>(null);
  const [pending, setPending] = useState<LandingSection | null>(null);

  const openSection = useCallback(
    (section: LandingSection) => {
      if (AUTH_REQUIRED.includes(section) && !isAuthenticated) {
        setPending(section);
        setActive('auth');
        return;
      }
      setActive(section);
    },
    [isAuthenticated],
  );

  const closeSection = useCallback(() => {
    setActive(null);
    setPending(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !pending) return;
    setActive(pending);
    setPending(null);
  }, [isAuthenticated, pending]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      setActive('auth');
    }
  }, []);

  const value = useMemo(
    () => ({ active, openSection, closeSection }),
    [active, openSection, closeSection],
  );

  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) {
    throw new Error('useLanding must be used within LandingProvider');
  }
  return ctx;
}
