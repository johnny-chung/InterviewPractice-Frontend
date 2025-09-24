import { useQuery } from "@tanstack/react-query";
import { listResumes, getResume } from "../api/resumes";
import type { ResumeDetail, ResumeSummary } from "../types/api";

const RESUMES_KEY = ["resumes"] as const;

export function useResumes() {
  return useQuery<ResumeSummary[]>({
    queryKey: RESUMES_KEY,
    queryFn: listResumes,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((item) => item.status !== "ready" && item.status !== "error");
      return hasPending ? 5000 : false;
    },
  });
}

export function useResumeDetail(resumeId: string | null) {
  return useQuery<ResumeDetail>({
    queryKey: [...RESUMES_KEY, resumeId],
    queryFn: () => getResume(resumeId as string),
    enabled: Boolean(resumeId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status !== "ready" && data.status !== "error" ? 5000 : false;
    },
  });
}
