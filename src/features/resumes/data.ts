// Data Module: resumes/data
// Purpose: Provide typed fetch + normalization logic for Resume entities & their parsed analytical data.
// Responsibilities:
//   * Define front-end domain interfaces (ResumeSummary, CandidateSkill, ResumeParsedSummary, ResumeDetail)
//   * Transform raw backend responses (snake_case) into camelCase & normalized shapes
//   * Handle flexible parsedData structure coming from AI extraction service
// Design Notes:
//   - Defensive parsing to avoid runtime errors when backend / AI returns unexpected shapes.
//   - Keep components simple by centralizing transformation logic.
import { backendFetch, backendUpload } from "@/services/backend-client";
import type {
  ResumeDetailResponse,
  ResumeSkillResponse,
  ResumeSummaryResponse,
} from "@/types/api";

/**
 * Summary metadata for a stored resume file.
 * filename/mimeType may be null while processing or if not supplied.
 */
export interface ResumeSummary {
  id: string;
  filename: string | null;
  mimeType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Skill extracted from resume content.
 * experienceYears: Years of experience (nullable if not inferable).
 * proficiency: Normalized proficiency score (optional numeric scale) or null.
 */
export interface CandidateSkill {
  id: string;
  skill: string;
  experienceYears: number | null;
  proficiency: number | null;
  createdAt: string;
}

/**
 * Parsed resume summary produced by AI pipeline.
 * sections: Map of section title -> string or list of strings (normalized to string|string[]).
 * profile: High-level candidate profile attributes (dynamic keys permitted by index signature).
 * statistics: Arbitrary analytical metrics (counts, etc.).
 * message: Optional informational status or error text.
 */
export interface ResumeParsedSummary {
  sections?: Record<string, string | string[]> | null;
  profile?: {
    name?: string | null;
    totalExperienceYears?: number | null;
    summary?: string | null;
    [key: string]: unknown;
  } | null;
  statistics?: Record<string, unknown> | null;
  message?: string;
}

/**
 * Full resume detail including parsed data & extracted skills list.
 */
export interface ResumeDetail extends ResumeSummary {
  parsedData: ResumeParsedSummary | null;
  skills: CandidateSkill[];
}

/** Map backend summary DTO -> ResumeSummary. */
function transformResumeSummary(data: ResumeSummaryResponse): ResumeSummary {
  return {
    id: data.id,
    filename: data.filename,
    mimeType: data.mime_type,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/** Map backend skill DTO -> CandidateSkill. */
function transformSkill(data: ResumeSkillResponse): CandidateSkill {
  return {
    id: data.id,
    skill: data.skill,
    experienceYears: data.experience_years,
    proficiency: data.proficiency,
    createdAt: data.created_at,
  };
}

/**
 * Normalize backend parsedData structure.
 * - Converts arrays to string arrays, primitives to strings.
 * - Handles legacy snake_case keys for totalExperienceYears.
 */
function normalizeParsedSummary(
  parsed: ResumeDetailResponse["parsedData"]
): ResumeParsedSummary | null {
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  const profileRaw = record.profile as Record<string, unknown> | undefined;
  const sectionsRaw = record.sections as Record<string, unknown> | undefined;

  const profile = profileRaw
    ? {
        ...profileRaw,
        totalExperienceYears:
          (profileRaw.totalExperienceYears as number | null | undefined) ??
          (profileRaw.total_experience_years as number | null | undefined) ??
          null,
      }
    : null;

  const sections = sectionsRaw
    ? Object.fromEntries(
        Object.entries(sectionsRaw).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value.map((item) => String(item))];
          }
          return [key, value == null ? "" : String(value)];
        })
      )
    : null;

  return {
    sections,
    profile,
    statistics:
      (record.statistics as Record<string, unknown> | null | undefined) ?? null,
    message: (record.message as string | undefined) ?? undefined,
  };
}

/** Map backend detail DTO -> ResumeDetail. */
function transformResumeDetail(data: ResumeDetailResponse): ResumeDetail {
  return {
    id: data.id,
    filename: data.filename,
    mimeType: data.mimeType,
    status: data.status,
    parsedData: normalizeParsedSummary(data.parsedData),
    skills: (data.skills || []).map(transformSkill),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Fetch list of resumes for current user.
 * @param token Optional bearer token.
 * @returns Array of ResumeSummary.
 */
export async function getResumes(
  token?: string | null
): Promise<ResumeSummary[]> {
  const response = await backendFetch<ResumeSummaryResponse[]>(
    "/resumes",
    {},
    { token }
  );
  return response.map(transformResumeSummary);
}

/**
 * Fetch detail for a single resume id.
 * @param id Resume identifier.
 * @param token Optional bearer token.
 * @returns ResumeDetail including parsedData & skills list.
 */
export async function getResumeDetail(
  id: string,
  token?: string | null
): Promise<ResumeDetail> {
  const response = await backendFetch<ResumeDetailResponse>(
    `/resumes/${id}`,
    {},
    { token }
  );
  return transformResumeDetail(response);
}

/**
 * Upload a new resume file via multipart form.
 * @param formData FormData containing file input.
 * @param token Optional bearer token.
 * @throws Error when backend returns non-ok response.
 * @returns Parsed backend JSON (untyped here).
 */
export async function uploadResume(formData: FormData, token?: string | null) {
  const response = await backendUpload("/resumes", formData, { token });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to upload resume");
  }
  return response.json();
}

/**
 * Soft delete a resume by id.
 * @param id Resume identifier.
 */
export async function deleteResume(id: string, token?: string | null) {
  await backendFetch(`/resumes/${id}`, { method: "DELETE" }, { token });
}
