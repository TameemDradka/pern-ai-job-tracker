// Centralized JSON error handling and tiny helper factory functions

const isDev = (process.env.NODE_ENV || "development") === "development";

/**
 * Create an Error with HTTP status and machine-friendly code.
 * @param {number} status
 * @param {string} message
 * @param {string} [code]
 */
function makeError(status, message, code) {
  const err = new Error(message || "Error");
  err.status = status;
  err.code = code || httpCodeToName(status);
  return err;
}

function httpCodeToName(status) {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 502:
      return "BAD_GATEWAY";
    default:
      return "INTERNAL_ERROR";
  }
}

export const badRequest = (message = "Bad request", code) =>
  makeError(400, message, code);
export const unauthorized = (message = "Unauthorized", code) =>
  makeError(401, message, code);
export const forbidden = (message = "Forbidden", code) =>
  makeError(403, message, code);
export const notFound = (message = "Not found", code) =>
  makeError(404, message, code);

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err?.status || 500;
  const code = err?.code || httpCodeToName(status);
  const message = err?.message || "Internal server error";

  if (isDev) {
    // Log the full error in development for debugging
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
  }

  const payload = { error: code, message };
  if (isDev && err?.stack) payload.stack = String(err.stack);

  res.status(status).json(payload);
}

export default errorHandler;
