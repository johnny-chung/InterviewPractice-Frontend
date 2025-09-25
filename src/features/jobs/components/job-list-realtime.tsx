"use client";

import { useEffect, useState, useRef } from "react";
import type { JobSummary } from "../data";
import { getSocket } from "@/services/realtime";
import { JobList } from "./job-list";

interface Props {
  initialItems: JobSummary[];
  selectedId: string | null;
  token?: string | null;
}

export function JobListRealtime({ initialItems, selectedId, token }: Props) {
  const [items, setItems] = useState<JobSummary[]>(initialItems);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!tokenRef.current) return; // No auth token => skip realtime.
    const socket = getSocket(tokenRef.current);

    function onUpdate(payload: {
      id: string;
      status: string;
      title?: string | null;
      createdAt?: string;
      updatedAt: string;
    }) {
      setItems((prev) => {
        const idx = prev.findIndex((j) => j.id === payload.id);
        if (idx === -1) {
          // Insert new job (fallback) then sort by createdAt desc.
          const createdAt = payload.createdAt || payload.updatedAt;
          const next: JobSummary = {
            id: payload.id,
            title: payload.title ?? "Untitled job",
            source: null,
            status: payload.status,
            createdAt,
            updatedAt: payload.updatedAt,
          };
          return [next, ...prev].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          );
        }
        const current = prev[idx];
        // Ignore stale events.
        if (current.updatedAt && current.updatedAt >= payload.updatedAt)
          return prev;
        const updated: JobSummary = {
          ...current,
          title: payload.title ?? current.title,
          status: payload.status,
          updatedAt: payload.updatedAt,
        };
        const clone = [...prev];
        clone[idx] = updated;
        return clone;
      });
    }

    socket.on("job:update", onUpdate);
    return () => {
      socket.off("job:update", onUpdate);
    };
  }, []);

  return <JobList items={items} selectedId={selectedId} />;
}
