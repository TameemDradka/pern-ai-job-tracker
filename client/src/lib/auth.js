import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken, setUnauthorizedHandler } from "./api";

// Context typedef (JSDoc for editor intellisense)
/**
 * @typedef {Object} AuthContextValue
 * @property {string|null} token
 * @property {(email: string, password: string) => Promise<string>} login
 * @property {(email: string, password: string) => Promise<void>} register
 * @property {() => void} logout
 */

const AuthContext = createContext(/** @type {AuthContextValue|null} */ (null));
const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  // Keep api token in sync
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
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, []);

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
  }, []);

  const value = useMemo(
    () => ({ token, login, register, logout }),
    [token, login, register, logout]
  );

  // Use React.createElement to avoid JSX in this file.
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Lightweight helper usable outside React components (e.g., in route config) to check auth state.
export function isAuthenticated() {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

export default AuthProvider;
