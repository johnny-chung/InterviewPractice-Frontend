import { postJson, request } from "./client";
import type {
  MatchDetailResponse,
  MatchJobStatus,
  MatchJobSummary,
  MatchSummary,
  RequirementAnalysis,
  RequirementSummary,
} from "../types/api";

type MatchJobResponse = {
  id: string;
  resume_id: string;
  job_id: string;
  status: MatchJobStatus;
  result_id: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
};

interface RequirementSummaryRaw {
  skill: string | null;
  importance: number | null;
  candidate_has_experience: boolean;
  similarity: number;
  matched_skill: string | null;
  inferred: boolean;
  comments: string;
}

interface RequirementAnalysisRaw {
  requirement: string | null;
  importance: number | null;
  similarity: number;
  matched_skill: string | null;
  inferred: boolean;
}

interface MatchCandidateRaw {
  name: string | null;
  skills: string[];
  experience_years: number | null;
  degrees: string[];
  certifications: string[];
  summary: string | null;
}

interface MatchSummaryRaw {
  overall_match_score: number;
  candidate: MatchCandidateRaw | null;
  requirements: RequirementSummaryRaw[];
  strengths: string[];
  weaknesses: string[];
  job_highlights: string[] | string | null;
  raw_details: RequirementAnalysisRaw[];
}

type MatchDetailResponseRaw = {
  id: string;
  status: MatchJobStatus;
  resumeId: string;
  jobId: string;
  error: string | null;
  match?: {
    id: string;
    score: number;
    summary: MatchSummaryRaw;
    completedAt: string;
  };
};

function toMatchJobSummary(item: MatchJobResponse): MatchJobSummary {
  return {
    id: item.id,
    resumeId: item.resume_id,
    jobId: item.job_id,
    status: item.status,
    resultId: item.result_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    errorMessage: item.error_message,
  };
}

function toRequirementSummary(item: RequirementSummaryRaw): RequirementSummary {
  return {
    requirement: item.skill,
    importance: item.importance,
    candidateHasExperience: item.candidate_has_experience,
    similarity: item.similarity,
    matchedSkill: item.matched_skill,
    inferred: item.inferred,
    comments: item.comments,
  };
}

function toRequirementAnalysis(item: RequirementAnalysisRaw): RequirementAnalysis {
  return {
    requirement: item.requirement,
    importance: item.importance,
    similarity: item.similarity,
    matchedSkill: item.matched_skill,
    inferred: item.inferred,
  };
}

function toMatchSummary(raw: MatchSummaryRaw): MatchSummary {
  return {
    overallMatchScore: raw.overall_match_score,
    candidate: raw.candidate
      ? {
          name: raw.candidate.name,
          skills: raw.candidate.skills,
          experienceYears: raw.candidate.experience_years,
          degrees: raw.candidate.degrees,
          certifications: raw.candidate.certifications,
          summary: raw.candidate.summary,
        }
      : null,
    requirements: raw.requirements.map(toRequirementSummary),
    strengths: raw.strengths,
    weaknesses: raw.weaknesses,
    jobHighlights: raw.job_highlights,
    rawDetails: raw.raw_details.map(toRequirementAnalysis),
  };
}

function toMatchDetail(item: MatchDetailResponseRaw): MatchDetailResponse {
  return {
    id: item.id,
    status: item.status,
    resumeId: item.resumeId,
    jobId: item.jobId,
    error: item.error,
    match: item.match
      ? {
          id: item.match.id,
          score: item.match.score,
          summary: toMatchSummary(item.match.summary),
          completedAt: item.match.completedAt,
        }
      : undefined,
  };
}

export async function listMatchJobs(): Promise<MatchJobSummary[]> {
  const data = await request<MatchJobResponse[]>("/matches");
  return data.map(toMatchJobSummary);
}

export async function getMatch(id: string): Promise<MatchDetailResponse> {
  const data = await request<MatchDetailResponseRaw>(`/matches/${id}`);
  return toMatchDetail(data);
}

export async function requestMatch(payload: { resumeId: string; jobId: string }): Promise<{ id: string; status: string }> {
  return postJson<{ id: string; status: string }>("/matches", payload);
}
