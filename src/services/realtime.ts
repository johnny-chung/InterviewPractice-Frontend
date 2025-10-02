// Module: realtime
// Purpose:
//   Provide a SINGLETON Socket.IO client instance for authenticated realtime updates (job status, matches, etc.).
//   We expose getSocket(token) so UI code can retrieve the same live connection without spawning duplicates.
//
// Why singleton?
//   - Multiple components may need realtime data; opening many sockets wastes resources and can hit server limits.
//   - A shared instance ensures all listeners attach to one connection; disconnect logic lives in a single place.
//
// Base URL logic:
//   The REST API base is typically something like: http://localhost:4000/api/v1
//   Socket.IO endpoint lives at the root server origin (http://localhost:4000/socket.io)
//   resolveBaseUrl() strips a trailing '/api/v1' (case-insensitive, optional slashes) to derive the origin.
//
// Auth:
//   - Token is supplied during initial handshake via the 'auth' object (preferred by Socket.IO over query params now).
//   - Backend middleware reads socket.handshake.auth.token and runs JWT verification.
//   - If verification fails the client gets a 'connect_error'. We don't auto-refresh here; higher layer should handle.
//
// Reconnection Strategy:
//   - Socket.IO intelligently backs off; we explicitly set attempts/delay for predictable UX.
//   - reconnectionAttempts=10 means after 10 failed tries it stops; UI could prompt user to refresh.
//   - reconnectionDelay=500 is the base delay (may exponential backoff internally depending on version defaults).
//
// Transport selection:
//   - transports:['websocket'] disables long-polling fallback for simplicity & reduced server overhead.
//   - If you need older-browser support, remove this and let it negotiate (will start with polling then upgrade).
//
// Cleanup & lifecycle:
//   - We don't expose a destroy function yet; if you need logout-driven disconnect you could add: socket.disconnect(); socket=null.
//
// Security considerations:
//   - Never log the raw JWT token (we only pass it). Avoid embedding secrets in the URL (auth object keeps it off query string).
//
// Future extension ideas:
//   - Heartbeat instrumentation (listen to 'ping'/'pong' events) for latency metrics.
//   - Automatic token refresh before it expires (would require a callback to supply new token and 'auth' update + reconnect).
//
// NOTE: This file intentionally stays framework-agnostic (no React imports) for reuse in tests or other runtimes.
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Derive base URL for websocket by removing REST base suffix (/api/v1) if present.
 * @returns Origin base URL (e.g. http://localhost:4000)
 */
function resolveBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
  // Strip trailing /api/v1 if present to get root for ws
  return raw.replace(/\/?api\/v1\/?$/i, "");
}

/**
 * Get (or create) a singleton authenticated Socket.IO connection.
 * @param token JWT / access token included in auth payload for server validation.
 * @returns Connected Socket instance.
 */
export function getSocket(token: string): Socket {
  // Re-use existing instance even if token changes. If you need per-user token swap (e.g., user switch without page reload),
  // you could force a disconnect and create a new one or implement a custom auth refresh handshake event.
  if (socket) return socket;
  const base = resolveBaseUrl();
  socket = io(base, {
    transports: ["websocket"],
    auth: { token }, // Sent in handshake; not exposed in URL.
    autoConnect: true, // Immediately attempt connect; could set false if you want manual .connect().
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });
  return socket;
}
