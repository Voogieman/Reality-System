import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { realityApi } from '../lib/api/reality.api';
import type { LoginPayload, RegisterPayload } from '../lib/api/types';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  type StoredAuthUser,
} from '../lib/auth/storage';

type AuthContextValue = {
  user: StoredAuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ confirmationUrl?: string; message: string }>;
  confirmEmail: (token: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const response = await realityApi.me();
      const data = response.data;
      if (!data) throw new Error('Пустой профиль');
      const nextUser: StoredAuthUser = {
        id: data.id,
        email: data.email,
        displayName: data.displayName,
      };
      saveAuthSession(storedToken, nextUser);
      setToken(storedToken);
      setUser(nextUser);
    } catch {
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, [refreshMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await realityApi.login(payload);
    const data = response.data;
    if (!data?.accessToken || !data.user) {
      throw new Error('Сервер не вернул JWT');
    }
    const nextUser: StoredAuthUser = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
    };
    saveAuthSession(data.accessToken, nextUser);
    setToken(data.accessToken);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await realityApi.register(payload);
    return {
      confirmationUrl: response.data?.confirmationUrl,
      message: response.message ?? 'Регистрация выполнена',
    };
  }, []);

  const confirmEmail = useCallback(async (confirmToken: string) => {
    const response = await realityApi.confirmEmail(confirmToken);
    return response.message ?? 'Email подтверждён';
  }, []);

  const logout = useCallback(async () => {
    try {
      await realityApi.logout();
    } catch {
      // ignore network/logout errors — clear local session anyway
    }
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        confirmEmail,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
