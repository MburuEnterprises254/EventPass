import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'furnace_auth_token';

// expo-secure-store is native-only; fall back to localStorage on web.
async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function loadToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return '';
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({}),
  register: async () => ({}),
  logout: async () => {},
});

async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  const base = getApiBase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${base}/api${path}`, { ...options, headers });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from secure storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (!stored) { setIsLoading(false); return; }

        const res = await apiFetch('/auth/me', {}, stored);
        const data = await res.json();

        if (data.user) {
          setToken(stored);
          setUser(data.user);
        } else {
          await clearToken();
        }
      } catch {
        // network error — clear token to be safe
        await clearToken().catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error ?? 'Login failed.' };

        await saveToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return {};
      } catch {
        return { error: 'Could not connect to the server. Try again.' };
      }
    },
    [],
  );

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
    ): Promise<{ error?: string }> => {
      try {
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ firstName, lastName, email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error ?? 'Registration failed.' };

        await saveToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return {};
      } catch {
        return { error: 'Could not connect to the server. Try again.' };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearToken().catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
