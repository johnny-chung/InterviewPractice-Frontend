"use client";
// RealtimeProvider
// Responsibilities:
//   - Wait for an authenticated session (token) then obtain the shared Socket.IO client (getSocket()).
//   - Attach lifecycle & diagnostic handlers (connect, disconnect, reconnect_attempt, errors) to aid debugging.
//   - Optionally log every inbound event when verbose mode enabled (dev default) using socket.onAny().
//   - Provide a single place to add more domain-specific listeners later (e.g., match:update, resume:parsed, etc.).
//
// Why a provider?
//   - Ensures side-effect (opening socket) occurs exactly once high in the React tree—children don't each create sockets.
//   - Makes it straightforward to later add React context for pushing realtime data into components.
//
// Verbose logging toggle:
//   - Controlled by NEXT_PUBLIC_REALTIME_DEBUG (anything other than 'false' enables logs).
//   - In production set NEXT_PUBLIC_REALTIME_DEBUG=false to silence noisy event traces while keeping essential ones.
//
// Cleanup:
//   - We remove the generic and specific listeners on unmount or when session/token changes.
//   - We do NOT disconnect the socket automatically—multiple providers (or future features) might still rely on it.
//     If you need a hard disconnect on logout, call socket.disconnect() during an auth signout handler.
//
// Extensibility pattern:
//   - For new events, add explicit socket.on('event:name', handler) below (avoid relying solely on onAny in prod).
//   - For stateful updates, you can lift event payloads into React context or a Zustand/Redux store from here.
//
// Edge cases:
//   - If session briefly null -> defined (during hydration), effect re-runs safely; singleton prevents duplicate sockets.
//   - If token expires mid-connection, server will disconnect on next auth-required action; implement refresh if needed.
import React, { useEffect } from "react";
import { getSocket } from "@/services/realtime";
import { useSession } from "next-auth/react";

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
}) => {
  const { data: session } = useSession();

  useEffect(() => {
    // Attempt to locate an access token (custom next-auth callback should attach if needed).
    const token =
      (session as any)?.accessToken || (session as any)?.user?.accessToken;
    if (!token) return; // Skip until we have auth token.
    const socket = getSocket(token as string);

    // Generic logger for every event received (only in dev to reduce noise in prod)
    const verbose = process.env.NEXT_PUBLIC_REALTIME_DEBUG !== "false"; // default true
    const anyHandler = (event: string, ...args: any[]) => {
      if (verbose) console.debug("[realtime][recv]", event, ...args);
    };
    if (verbose) (socket as any).onAny(anyHandler);

    // Core lifecycle events
    socket.on("connect", () => {
      console.log("[realtime][ws] connected", socket.id, {
        connected: socket.connected,
      });
    });
    socket.on("disconnect", (reason) => {
      console.log("[realtime][ws] disconnected", reason);
    });
    socket.io.on("reconnect_attempt", (attempt: number) => {
      console.debug("[realtime][ws] reconnect_attempt", attempt);
    });
    socket.on("connect_error", (err: any) => {
      console.error("[realtime][ws] connect_error", err?.message, err);
    });
    socket.on("error", (err: any) => {
      console.error("[realtime][ws] error", err?.message, err);
    });

    // Specific handler for job:update to ensure it is surfaced even if onAny disabled
    socket.on("job:update", (payload: any) => {
      console.log("[realtime][job:update]", payload);
    });

    return () => {
      if (verbose) (socket as any).offAny(anyHandler);
      socket.off("job:update");
      socket.off("connect_error");
      socket.off("error");
    };
  }, [session]);

  return <>{children}</>;
};
