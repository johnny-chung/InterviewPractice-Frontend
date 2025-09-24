import { useQuery } from "@tanstack/react-query";
import { createJobFromFile, createJobFromText, getJob, listJobs } from "../api/jobs";
import type { JobDetail, JobSummary } from "../types/api";

const JOBS_KEY = ["jobs"] as const;

export function useJobs() {
  return useQuery<JobSummary[]>({
    queryKey: JOBS_KEY,
    queryFn: listJobs,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((item) => item.status !== "ready" && item.status !== "error");
      return hasPending ? 5000 : false;
    },
  });
}

export function useJobDetail(jobId: string | null) {
  return useQuery<JobDetail>({
    queryKey: [...JOBS_KEY, jobId],
    queryFn: () => getJob(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status !== "ready" && data.status !== "error" ? 5000 : false;
    },
  });
}

export const jobMutations = {
  createFromFile: createJobFromFile,
  createFromText: createJobFromText,
};
