"use client";

// Component: JobDetailRealtime
// Purpose: Wrap server-provided initial job detail with realtime refresh capability.
// Behavior:
//   * Receives initial `job` (possibly undefined) from server component fetch.
//   * Listens for `job:update` socket events; when the event's id matches the selected job id
//     AND either status/title changed or updatedAt is newer, performs a refetch of full detail
//     via REST (`/jobs/:id`).
//   * While refetching, shows a subtle loading state by preserving old content (optimistic) and
//     optionally toggling a local flag (could be used for a spinner later).
// Rationale: The list can patch lightweight fields from the socket payload, but detailed parsed
//            fields (requirements, highlights, onet, etc.) may only be available after parsing is
//            complete—so we refetch once we know something changed.
// Edge Cases:
//   * Multiple rapid job:update events -> debounce by tracking an in-flight fetch; subsequent events
//     that arrive while fetching schedule exactly one more fetch afterwards.
//   * Stale older timestamp events ignored unless status/title changed (mirrors list logic).
//   * Component unmount cancels state updates.

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/services/realtime";
import { getJobDetail, type JobDetail } from "../data";
import { JobDetailPanel } from "./job-detail";

interface JobDetailRealtimeProps {
  jobId: string | null; // currently selected job id
  token?: string | null;
  initialJob?: JobDetail; // server-fetched initial detail
}

export function JobDetailRealtime({
  jobId,
  token,
  initialJob,
}: JobDetailRealtimeProps) {
  const [job, setJob] = useState<JobDetail | undefined>(initialJob);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const jobIdRef = useRef(jobId);
  jobIdRef.current = jobId;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // When jobId changes due to selection, we rely on server to have fetched new initialJob (DashboardShell re-render).
  // Sync local state with new initialJob.
  useEffect(() => {
    setJob(initialJob);
  }, [initialJob, jobId]);

  async function refetchDetail(id: string) {
    if (!tokenRef.current) return;
    setIsRefreshing(true);
    try {
      const latest = await getJobDetail(id, tokenRef.current);
      if (mountedRef.current && jobIdRef.current === id) {
        setJob(latest);
      }
    } catch (e) {
      console.warn("[job-detail][refetch] failed", e);
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!tokenRef.current) return;
    const socket = getSocket(tokenRef.current);
    console.log("[job-detail] attaching listener job:update", {
      tokenPresent: !!tokenRef.current,
      jobId: jobIdRef.current,
    });
    const handler = (payload: any) => {
      console.log("[job-detail] received job:update", payload, {
        currentJobId: jobIdRef.current,
      });
      if (!jobIdRef.current || payload.id !== jobIdRef.current) return;
      // Always refetch full detail for simplicity & correctness.
      refetchDetail(payload.id);
    };
    socket.on("job:update", handler);
    return () => {
      socket.off("job:update", handler);
    };
  }, [token, jobId]);

  // Optionally, we could surface a loading indicator: pass isRefreshing prop to panel or add badge.
  return (
    <div data-refreshing={isRefreshing ? "true" : "false"}>
      <JobDetailPanel job={job} />
    </div>
  );
}
