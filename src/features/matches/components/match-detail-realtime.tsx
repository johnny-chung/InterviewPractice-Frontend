"use client";

// Component: MatchSectionRealtime
// Listens to match:update events and refetches list + detail (if selected) unconditionally.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/services/realtime";
import {
  getMatchJobs,
  getMatchDetail,
  type MatchJobSummary,
  type MatchDetail,
} from "../data";
import { MatchList } from "./match-list";
import { MatchDetailPanel } from "./match-detail-panel";

interface Props {
  matchId: string | null;
  token?: string | null;
  initialList: MatchJobSummary[];
  initialDetail?: MatchDetail;
}

export function MatchSectionRealtime({
  matchId,
  token,
  initialList,
  initialDetail,
}: Props) {
  const [list, setList] = useState<MatchJobSummary[]>(initialList);
  const router = useRouter();
  const [detail, setDetail] = useState<MatchDetail | undefined>(initialDetail);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const matchIdRef = useRef(matchId);
  matchIdRef.current = matchId;

  useEffect(() => {
    setDetail(initialDetail);
  }, [initialDetail, matchId]);

  useEffect(() => {
    if (!tokenRef.current) return;
    const socket = getSocket(tokenRef.current);
    if ((socket as any)._matchRealtimeLogged !== true) {
      socket.on("connect", () => {
        console.log(
          `[match-realtime] socket connected id=${socket.id} authUser=<hidden>`
        );
      });
      (socket as any)._matchRealtimeLogged = true;
    }
    const handler = async (payload: any) => {
      console.log(
        `[match-realtime] event match:update received id=${payload?.id} selected=${matchIdRef.current}`
      );
      try {
        const newList = await getMatchJobs(tokenRef.current);
        setList(newList);
        if (matchIdRef.current && payload.id === matchIdRef.current) {
          const newDetail = await getMatchDetail(
            matchIdRef.current,
            tokenRef.current
          );
          setDetail(newDetail);
        }
        console.log(
          `[match-realtime] refreshed list (size=${
            newList.length
          }) detailRefreshed=${payload.id === matchIdRef.current}`
        );
        // Trigger server components (like fetcher panels) to revalidate
        router.refresh();
      } catch (e) {
        console.warn("[match-realtime] refetch failed", e);
      }
    };
    socket.on("match:update", handler);
    return () => {
      socket.off("match:update", handler);
    };
  }, [token, router]);

  // Layout notes:
  // Previous implementation used a 2-col CSS grid which constrained the left column intrinsic width.
  // We switch to a responsive flex layout where the list column flexes and consumes available space.
  // On small screens we stack (flex-col). On md+ we row align with list taking ~45% min width and able to grow.
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <div className="w-full flex-shrink-0">
        <MatchList items={list} selectedId={matchIdRef.current} />
      </div>      
    </div>
  );
}
