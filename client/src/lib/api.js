/**
 * Tiny API client wrapper around fetch.
 * - Applies base URL from VITE_API_URL
 * - Injects Authorization header if a token is set
 * - Exposes helper methods: get, post, patch, del
 * - Automatically logs out (via registered handler) on 401 responses
 *
 * No external dependencies.
 */

// In-memory token reference (kept in sync with localStorage by auth context)
let authToken = null;

/** Callback invoked when an unauthorized (401) response is received */
let onUnauthorized = null;

/**
 * Register a callback to be executed on 401 responses.
 * @param {() => void} cb
 */
export function setUnauthorizedHandler(cb) {
  onUnauthorized = cb;
}

/**
 * Set the current auth token (called by auth context).
 * @param {string|null} token
 */
export function setToken(token) {
  authToken = token || null;
}

/**
 * Compose the absolute URL for a given path.
 * @param {string} path
 * @returns {string}
 */
function buildUrl(path) {
  const base = import.meta.env.VITE_API_URL || "";
  if (/^https?:/i.test(path)) return path; // already absolute
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}

/**
 * Internal fetch wrapper adding headers & handling 401.
 * @param {string} method
 * @param {string} path
 * @param {any} [body]
 * @param {RequestInit} [options]
 */
async function request(method, path, body, options = {}) {
  const headers = new Headers(options.headers || {});
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
  if (body != null && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    method,
    ...options,
    headers,
    body:
      body == null
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

  if (response.status === 401) {
    if (onUnauthorized) {
      try {
        onUnauthorized();
      } catch (e) {
        /* noop */
      }
    }
  }

  let data; // attempt to parse JSON, but fall back gracefully
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      (data && data.message) || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** @type {{ get: (path: string, options?: RequestInit) => Promise<any>, post: (path: string, body?: any, options?: RequestInit) => Promise<any>, patch: (path: string, body?: any, options?: RequestInit) => Promise<any>, del: (path: string, options?: RequestInit) => Promise<any> }} */
export const api = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  del: (path, options) => request("DELETE", path, undefined, options),
};

export default api;
