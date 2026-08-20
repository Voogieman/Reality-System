import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export type LandingSection =
  | 'pantheon'
  | 'knowledge'
  | 'oracle'
  | 'rituals'
  | 'auth'
  | 'cabinet'
  | 'support'
  | 'about';

const AUTH_REQUIRED: LandingSection[] = ['rituals', 'cabinet'];

type LandingContextValue = {
  active: LandingSection | null;
  canGoBack: boolean;
  assistantOpen: boolean;
  openSection: (section: LandingSection) => void;
  goBack: () => void;
  closeSection: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [active, setActive] = useState<LandingSection | null>(null);
  const [stack, setStack] = useState<LandingSection[]>([]);
  const [pending, setPending] = useState<LandingSection | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(true);

  const openSection = useCallback(
    (section: LandingSection) => {
      if (AUTH_REQUIRED.includes(section) && !isAuthenticated) {
        setPending(section);
        setStack((prev) => (active ? [...prev, active] : prev));
        setActive('auth');
        return;
      }
      setStack((prev) => (active && active !== section ? [...prev, active] : prev));
      setActive(section);
    },
    [isAuthenticated, active],
  );

  const closeSection = useCallback(() => {
    setActive(null);
    setStack([]);
    setPending(null);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) {
        setActive(null);
        setPending(null);
        return prev;
      }
      const next = [...prev];
      const last = next.pop() as LandingSection;
      setActive(last);
      return next;
    });
  }, []);

  const openAssistant = useCallback(() => setAssistantOpen(true), []);
  const closeAssistant = useCallback(() => setAssistantOpen(false), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (pending) {
      setActive(pending);
      setPending(null);
      return;
    }
    if (active === 'auth') {
      setActive('cabinet');
    }
  }, [isAuthenticated, pending, active]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      setActive('auth');
    }
  }, []);

  const value = useMemo(
    () => ({
      active,
      canGoBack: stack.length > 0 || Boolean(active),
      assistantOpen,
      openSection,
      goBack,
      closeSection,
      openAssistant,
      closeAssistant,
    }),
    [active, stack.length, assistantOpen, openSection, goBack, closeSection, openAssistant, closeAssistant],
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
