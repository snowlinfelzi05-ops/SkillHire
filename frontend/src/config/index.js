const VITE_API_URL = import.meta.env?.VITE_API_URL;

const API_URL = (
  VITE_API_URL ||
  "https://skillhire-production.up.railway.app/api"
).replace(/\/+$/, "");

const APP_BASE_URL =
  API_URL.slice(0, API_URL.lastIndexOf("/api")) ||
  "https://skillhire-production.up.railway.app";

/**
 * Resolve a backend-relative resource URL (e.g. an uploaded image path)
 * to an absolute URL using the configured API host, falling back to
 * relative when the path is already absolute.
 */
export function getFullResourceUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${APP_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
}

export { API_URL };
