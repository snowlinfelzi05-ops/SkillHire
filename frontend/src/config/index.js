const VITE_API_URL = import.meta.env?.VITE_API_URL;

if (!VITE_API_URL && (import.meta.env?.PROD || false)) {
  console.warn(
    "[SkillHire] VITE_API_URL is not set. Set it in a .env file and rebuild, " +
      "otherwise the app will point at the local dev API (http://127.0.0.1:8000/api):"
  );
}

const API_URL = (VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");

const APP_BASE_URL = API_URL.slice(0, API_URL.lastIndexOf("/api")) || "http://127.0.0.1:8000";

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
