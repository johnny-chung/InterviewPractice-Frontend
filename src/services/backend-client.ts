// Module: backend-client
// Purpose: Provides helper functions to interact with the Layer1 backend REST API.
// - buildUrl: picks correct base URL depending on server/client environment and joins with path.
// - backendFetch: thin wrapper around fetch adding JSON handling, auth header, timing / logging, error normalization, generics for typed response.
// - backendUpload: specialized POST multipart/file upload helper returning the raw Response for caller controlled parsing.
// Environment Variables Used:
//   LAYER1_API_URL (server side only) -> internal server to server base URL (no CORS concerns)
//   NEXT_PUBLIC_API_BASE_URL (client side) -> public browser accessible base URL
// Behaviour Notes:
//   * Automatically sets Accept: application/json and Authorization when token provided.
//   * Throws Error with best-effort extracted message on non-ok responses.
//   * Logs duration for mutating requests & uploads.
//   * Returns undefined for HTTP 204.
// Rationale for separate bases:
//   - Server (SSR / route handlers / actions) can call a private/internal hostname (e.g. http://backend:4000/api/v1) avoiding CORS & extra public hops.
//   - Browser must use a publicly reachable, CORS-enabled URL (e.g. https://api.myapp.com/api/v1).
//   - Keeping both lets you configure:
//       LAYER1_API_URL = internal service DNS or container name
//       NEXT_PUBLIC_API_BASE_URL = public API origin
// NEXT_PUBLIC_ prefix note: any var starting with NEXT_PUBLIC_ is embedded into the browser bundle so client code can read it.

const SERVER_API_BASE =
  process.env.LAYER1_API_URL ?? "http://localhost:4000/api/v1"; // Internal/server-only base (never exposed to browser)
const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1"; // Public/browser base (NEXT_PUBLIC_ -> exposed to client bundle)

/**
 * Build the absolute request URL for a given API path.
 * @param path Relative API path (with or without leading slash).
 * @param isServer True when executed in a Node/SSR context (no window object);
 *                 selects SERVER_API_BASE instead of CLIENT_API_BASE.
 * @returns Fully qualified URL string.
 */
function buildUrl(path: string, isServer: boolean): string {
  const base = isServer ? SERVER_API_BASE : CLIENT_API_BASE;
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

/**
 * Perform a typed JSON fetch request against the backend API.
 * @template T Expected JSON response shape.
 * @param path API path (e.g. '/jobs').
 * @param init Standard RequestInit overrides (method, headers, body, etc.).
 * @param options.token Optional bearer token appended as Authorization header.
 * @param options.cache Override the default 'no-store' cache mode for SSR fetch.
 * @returns Parsed JSON body typed as T, or undefined for 204 responses.
 * @throws Error when response.ok is false; message attempts to use backend provided 'error' field or status text.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  options?: {
    token?: string | null;
    cache?: RequestCache;
  }
): Promise<T> {
  const isServer = typeof window === "undefined";
  const url = buildUrl(path, isServer);
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const method = (init.method ?? "GET").toUpperCase();
  const startedAt = Date.now();

  const response = await fetch(url, {
    ...init,
    headers,
    cache: options?.cache ?? "no-store",
  });

  const durationMs = Date.now() - startedAt;

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let message = `${response.status} ${response.statusText}`;

    if (contentType?.includes("application/json")) {
      try {
        const body = await response.json();
        if (body?.error) {
          message = body.error as string;
        }
      } catch (err) {
        console.warn(
          `[backendFetch] Failed to parse error payload from ${method} ${url}:`,
          err
        );
      }
    }

    console.error(
      `[backendFetch] ${method} ${url} failed after ${durationMs}ms: ${message}`
    );
    throw new Error(message);
  }

  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {
    console.info(
      `[backendFetch] ${method} ${url} succeeded in ${durationMs}ms`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    console.error(
      `[backendFetch] ${method} ${url} returned non-JSON body after ${durationMs}ms`,
      err
    );
    throw err;
  }
}

/**
 * Upload a file / multipart form to the backend. Caller decides how to parse the response.
 * @param path API path (POST target)
 * @param formData Prepared FormData (includes file fields & metadata)
 * @param options.token Optional bearer token
 * @returns Raw fetch Response allowing caller to extract .json(), .text(), etc.
 */
export function backendUpload(
  path: string,
  formData: FormData,
  options?: { token?: string | null }
) {
  const isServer = typeof window === "undefined";
  const url = buildUrl(path, isServer);
  const headers = new Headers();
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const startedAt = Date.now();

  return fetch(url, {
    method: "POST",
    body: formData,
    headers,
    cache: "no-store",
  }).then((response) => {
    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      console.error(
        `[backendUpload] POST ${url} failed after ${durationMs}ms with status ${response.status}`
      );
    } else {
      console.info(`[backendUpload] POST ${url} succeeded in ${durationMs}ms`);
    }
    return response;
  });
}
