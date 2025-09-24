import { useQuery } from "@tanstack/react-query";
import { getMatch, listMatchJobs } from "../api/matches";
import type { MatchDetailResponse, MatchJobSummary } from "../types/api";

const MATCHES_KEY = ["matches"] as const;

export function useMatchJobs() {
  return useQuery<MatchJobSummary[]>({
    queryKey: MATCHES_KEY,
    queryFn: listMatchJobs,
    refetchInterval: 5000,
  });
}

export function useMatchDetail(matchId: string | null) {
  return useQuery<MatchDetailResponse>({
    queryKey: [...MATCHES_KEY, matchId],
    queryFn: () => getMatch(matchId as string),
    enabled: Boolean(matchId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status !== "completed" && data.status !== "failed" ? 5000 : false;
    },
  });
}
