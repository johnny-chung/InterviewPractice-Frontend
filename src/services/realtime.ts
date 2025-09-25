// Module: realtime
// Purpose: Provide a singleton Socket.IO client instance for authenticated realtime updates (e.g. match/job processing status).
// Key Concepts:
//   * resolveBaseUrl strips trailing '/api/v1' so websocket connects to root origin (Socket.IO server usually mounted at root).
//   * getSocket(token) lazily creates and returns a cached socket instance so multiple callers reuse same connection.
// Token Usage: Sent via auth option so backend can authenticate socket.
// Reconnection Strategy: Attempts up to 10 times with 500ms delay.
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
  if (socket) return socket;
  const base = resolveBaseUrl();
  socket = io(base, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });
  return socket;
}
