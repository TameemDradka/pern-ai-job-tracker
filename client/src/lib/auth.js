import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken, setUnauthorizedHandler } from "./api";

/**
 * @typedef {Object} AuthContextValue
 * @property {string|null} token
 * @property {(email: string, password: string) => Promise<string>} login
 * @property {(email: string, password: string) => Promise<void>} register
 * @property {() => void} logout
 */

const AuthContext = createContext(/** @type {AuthContextValue|null} */ (null));

const TOKEN_KEY = "token";

/**
 * Provider component for authentication state & actions.
 * Loads token from localStorage on mount and subscribes to 401 handling.
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  // Keep api module's token in sync
  useEffect(() => {
    setToken(token);
  }, [token]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
    setTokenState(null);
    // Redirect to login (simple hard redirect to ensure app reset)
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, []);

  // Register global unauthorized handler once
  useEffect(() => {
    setUnauthorizedHandler(() => logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (!res || !res.token) throw new Error("Invalid login response");
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
    } catch {
      /* noop */
    }
    setTokenState(res.token);
    return res.token;
  }, []);

  const register = useCallback(async (email, password) => {
    await api.post("/auth/register", { email, password });
    // After successful registration, navigate to login
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({ token, login, register, logout }),
    [token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export default AuthProvider;
