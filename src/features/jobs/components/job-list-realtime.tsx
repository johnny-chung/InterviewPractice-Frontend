"use client";

import { useEffect, useState, useRef } from "react";
import type { JobSummary } from "../data";
import { getJobs } from "../data";
import { getSocket } from "@/services/realtime";
import { JobList } from "./job-list";

interface Props {
  initialItems: JobSummary[];
  selectedId: string | null;
  token?: string | null;
}

export function JobListRealtime({ initialItems, selectedId, token }: Props) {
  const [items, setItems] = useState<JobSummary[]>(initialItems);
  const tokenRef = useRef<string | null | undefined>(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!tokenRef.current) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[jobs] realtime skipped: no token yet");
      }
      return;
    }
    const socket = getSocket(tokenRef.current);
    let inFlight = false;
    let cancelled = false;

    const fullRefresh = async (reason: string, context?: any) => {
      if (cancelled || !tokenRef.current) return;
      const started = Date.now();
      try {
        inFlight = true;
        const list = await getJobs(tokenRef.current);
        if (!cancelled) setItems(list);
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[jobs] list refreshed (${reason}) in ${Date.now() - started}ms`,
            { count: list.length, context }
          );
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[jobs] list refresh failed (${reason})`, e);
        }
      } finally {
        inFlight = false;
      }
    };

    const handler = (payload: any) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[jobs] job:update received -> triggering full refresh",
          payload
        );
      }
      if (!inFlight) fullRefresh("job:update", { jobId: payload?.id });
    };

    socket.on("job:update", handler);
    fullRefresh("initial");

    return () => {
      cancelled = true;
      socket.off("job:update", handler);
    };
  }, []); // empty deps: single subscription

  // If server sends a new initialItems set due to navigation, allow a hard replace.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return <JobList items={items} selectedId={selectedId} />;
}
