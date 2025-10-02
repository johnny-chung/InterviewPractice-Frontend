"use client";

// Component: ResumeDetailRealtime
// Simple: listens for any resume:update socket event and refetches both list & detail
// (if currently selected) without diff checks.
// Props:
//  - resumeId: currently selected resume id (or null)
//  - token: auth token for API + socket
//  - initialList: server provided resume summaries
//  - initialDetail: server provided resume detail (for selected)
// Behavior:
//  - On mount sets initial state.
//  - On resume:update event always refetches list; if event id matches selected resume, refetch detail.
//  - While refetching keeps old data rendered.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/services/realtime";
import { getResumes, type ResumeSummary } from "../data";
import { ResumeList } from "./resume-list";

interface Props {
  resumeId: string | null;
  token?: string | null;
  initialList: ResumeSummary[];
  initialDetail?: unknown; // no longer used (kept for backward prop compatibility)
}

export function ResumeSectionRealtime({ resumeId, token, initialList }: Props) {
  const [list, setList] = useState<ResumeSummary[]>(initialList);
  // Detail handling removed; server side panel now owns detail rendering.
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const resumeIdRef = useRef(resumeId);
  resumeIdRef.current = resumeId;
  const router = useRouter();

  // No detail syncing needed anymore.

  useEffect(() => {
    if (!tokenRef.current) return;
    const socket = getSocket(tokenRef.current);
    const handler = async () => {
      try {
        // Always refetch list
        const newList = await getResumes(tokenRef.current);
        setList(newList);
        // Detail is fetched server-side now; no realtime fetch here.
        router.refresh();
      } catch (e) {
        console.warn("[resume-realtime] refetch failed", e);
      }
    };
    socket.on("resume:update", handler);
    return () => {
      socket.off("resume:update", handler);
    };
  }, [token, router]);

  return <ResumeList items={list} selectedId={resumeIdRef.current} />;
}
