// Data Module: matches/data
// Purpose: Fetch and normalize Match (resume vs job) domain objects & result analysis structures from backend responses.
// Responsibilities:
//   * Define front-end facing interfaces (MatchJobSummary, RequirementSummary, RequirementAnalysis, MatchResultSummary, MatchDetail)
//   * Provide transformation helpers mapping snake_case backend shapes to camelCase & normalized structures
//   * Expose async functions to list match jobs, fetch detailed match results, and request new matches
// Design Considerations:
//   - Backend may return arrays/objects with flexible types inside summary -> normalization utilities ensure stable string arrays.
//   - Keep rendering logic out of components by precomputing strings (e.g. highlights, strengths, gaps).
import { backendFetch } from "@/services/backend-client";
import type {
  MatchDetailResponse,
  MatchJobResponse,
  RequirementAnalysisResponse,
  RequirementSummaryResponse,
} from "@/types/api";

/**
 * Summary row for a queued / running / completed match job.
 * resumeId/jobId: IDs of related entities.
 * status: Processing state.
 * resultId: ID of associated result once completed.
 * errorMessage: Backend provided error (if any) at job level.
 */
export interface MatchJobSummary {
  id: string;
  resumeId: string;
  jobId: string;
  status: string;
  resultId: string | null;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
}

/**
 * Requirement level detailed summary with candidate alignment.
 * candidateHasExperience: Boolean flag for presence of relevant experience.
 * similarity: Matching score (numeric) between candidate skill and job requirement.
 * inferred: True if matched skill inferred rather than explicit.
 * comments: Narrative explanation from analysis engine.
 */
export interface RequirementSummary {
  requirement: string | null;
  importance: number | null;
  candidateHasExperience: boolean;
  similarity: number;
  matchedSkill: string | null;
  inferred: boolean;
  comments: string;
}

/** Lightweight raw requirement analysis record (pre narrative). */
export interface RequirementAnalysis {
  requirement: string | null;
  importance: number | null;
  similarity: number;
  matchedSkill: string | null;
  inferred: boolean;
}

/**
 * High-level match result summary aggregating candidate profile & requirement evaluations.
 * overallMatchScore: Aggregate score (aliasing summary.overall_match_score).
 * candidate: Nested candidate extracted features (nullable if parsing failed).
 * strengths/gaps: Arrays of bullet points.
 * jobHighlights: Normalized highlight strings from job summary for contextual display.
 */
export interface MatchResultSummary {
  id: string;
  score: number;
  completedAt: string;
  overallMatchScore: number;
  candidate: {
    name: string | null;
    skills: string[];
    experienceYears: number | null;
    degrees: string[];
    certifications: string[];
    summary: string | null;
  } | null;
  strengths: string[];
  gaps: string[];
  requirements: RequirementSummary[];
  rawDetails: RequirementAnalysis[];
  jobHighlights: string[];
}

/** Detailed match with optional result (undefined until complete). */
export interface MatchDetail {
  id: string;
  status: string;
  resumeId: string;
  jobId: string;
  error: string | null;
  result?: MatchResultSummary;
}

/** Transform backend match job list entry -> MatchJobSummary. */
function transformMatchJob(data: MatchJobResponse): MatchJobSummary {
  return {
    id: data.id,
    resumeId: data.resume_id,
    jobId: data.job_id,
    status: data.status,
    resultId: data.result_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    errorMessage: data.error_message,
  };
}

/** Transform backend requirement summary record -> RequirementSummary. */
function transformRequirementSummary(
  data: RequirementSummaryResponse
): RequirementSummary {
  return {
    requirement: data.skill,
    importance: data.importance,
    candidateHasExperience: data.candidate_has_experience,
    similarity: data.similarity,
    matchedSkill: data.matched_skill,
    inferred: data.inferred,
    comments: data.comments,
  };
}

/** Transform backend raw requirement analysis -> RequirementAnalysis. */
function transformRequirementAnalysis(
  data: RequirementAnalysisResponse
): RequirementAnalysis {
  return {
    requirement: data.requirement,
    importance: data.importance,
    similarity: data.similarity,
    matchedSkill: data.matched_skill,
    inferred: data.inferred,
  };
}

/** Utility: Convert unknown value to best-effort display string. */
function toDisplayString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Normalize either primitive/array into a string[] list. */
function normalizeStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => toDisplayString(v));
  return [toDisplayString(value)];
}

/**
 * Normalize highlights field which may contain strings or structured objects.
 */
function normalizeHighlights(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    const result: string[] = [];
    for (const item of value) {
      if (typeof item === "string") {
        result.push(item);
      } else if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const parts: string[] = [];
        const skill = record["skill"] ?? record["name"];
        if (skill) parts.push(String(skill));
        const importance = record["importance"];
        if (importance != null) parts.push(`importance ${String(importance)}`);
        if (record["inferred"] != null) {
          parts.push(record["inferred"] ? "inferred" : "explicit");
        }
        result.push(
          parts.length > 0 ? parts.join(" | ") : toDisplayString(record)
        );
      } else {
        result.push(toDisplayString(item));
      }
    }
    return result;
  }
  return [toDisplayString(value)];
}

/** Transform detailed backend response -> MatchDetail including nested result summary normalization. */
function transformMatchDetail(data: MatchDetailResponse): MatchDetail {
  const result = data.match;
  return {
    id: data.id,
    status: data.status,
    resumeId: data.resumeId,
    jobId: data.jobId,
    error: data.error,
    result: result
      ? {
          id: result.id,
          score: result.score,
          completedAt: result.completedAt,
          overallMatchScore: result.summary.overall_match_score,
          candidate: result.summary.candidate
            ? {
                name: result.summary.candidate.name,
                skills: result.summary.candidate.skills,
                experienceYears: result.summary.candidate.experience_years,
                degrees: result.summary.candidate.degrees,
                certifications: result.summary.candidate.certifications,
                summary: result.summary.candidate.summary,
              }
            : null,
          strengths: normalizeStringList(result.summary.strengths),
          gaps: normalizeStringList(result.summary.weaknesses),
          requirements: result.summary.requirements.map(
            transformRequirementSummary
          ),
          rawDetails: result.summary.raw_details.map(
            transformRequirementAnalysis
          ),
          jobHighlights: normalizeHighlights(result.summary.job_highlights),
        }
      : undefined,
  };
}

/**
 * List existing match jobs for user.
 * @param token Optional auth token.
 * @returns Array of MatchJobSummary.
 */
export async function getMatchJobs(
  token?: string | null
): Promise<MatchJobSummary[]> {
  const response = await backendFetch<MatchJobResponse[]>(
    "/matches",
    {},
    { token }
  );
  return response.map(transformMatchJob);
}

/**
 * Fetch detailed match by id including nested result if finished.
 * @param id Match identifier.
 * @param token Optional auth token.
 */
export async function getMatchDetail(
  id: string,
  token?: string | null
): Promise<MatchDetail> {
  const response = await backendFetch<MatchDetailResponse>(
    `/matches/${id}`,
    {},
    { token }
  );
  return transformMatchDetail(response);
}

/**
 * Request creation of a new match job.
 * @param payload.resumeId Resume identifier.
 * @param payload.jobId Job identifier.
 * @param token Optional auth token.
 * @returns Backend JSON (untyped) or throws on failure.
 */
export async function requestMatch(
  payload: { resumeId: string; jobId: string },
  token?: string | null
) {
  return backendFetch(
    "/matches",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: payload.resumeId,
        jobId: payload.jobId,
      }),
    },
    { token }
  );
}
