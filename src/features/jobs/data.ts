// Data Module: jobs/data
// Purpose: Abstraction layer for Job related API calls + transformation of raw backend responses into UI friendly shapes.
// Includes:
//   * TypeScript interfaces representing front-end domain models (JobSummary, JobRequirement, JobParsedSummary, JobDetail)
//   * Pure functions to transform backend DTOs (JobSummaryResponse, JobRequirementResponse, JobDetailResponse) into those models
//   * Helper normalization utilities for flexible parsed job JSON payloads (highlights / overview)
//   * Exported async functions performing fetches via backendFetch / backendUpload
// Design Notes:
//   - Keep transformation logic isolated so components remain simple & strongly typed.
//   - Defensive casting: backend may return variable shapes inside parsedData -> normalize to predictable arrays/strings.
import { backendFetch, backendUpload } from "@/services/backend-client";
import type {
  JobDetailResponse,
  JobRequirementResponse,
  JobSummaryResponse,
} from "@/types/api";

/**
 * UI-facing summary of a Job record.
 * id: Backend identifier.
 * title: Parsed or user provided title (nullable if extraction pending).
 * source: Indicates origin of job description (file | text | null while processing).
 * status: Processing status string (e.g. pending, completed, error).
 * createdAt/updatedAt: ISO timestamps.
 */
export interface JobSummary {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual requirement/skill extracted from a job.
 * importance: Number (weight) or null if not scored.
 * inferred: True if system inferred the requirement vs explicitly present.
 */
export interface JobRequirement {
  id: string;
  skill: string;
  importance: number | null;
  inferred: boolean;
  createdAt: string;
}

/**
 * Parsed semantic summary of a job description.
 * highlights: Flat list of noteworthy skill/requirement strings.
 * overview: Joined human readable one-line summary (may be null when not derivable).
 * overviewEntries: Structured (label, value) pairs used to build overview string.
 * onet: Optional O*NET classification blob (type unknown left untyped intentionally).
 * message: Optional informational / error message.
 */
export interface JobParsedSummary {
  highlights: string[];
  overview: string | null;
  overviewEntries: Array<{ label: string; value: string }>;
  onet?: unknown;
  message?: string;
}

/**
 * Full job detail returned to UI.
 * parsedData: Normalized parsed summary or null while processing.
 * requirements: Array of extracted requirements.
 */
export interface JobDetail extends JobSummary {
  parsedData: JobParsedSummary | null;
  requirements: JobRequirement[];
  softSkills?: {
    skill: string;
    value?: number | null;
    importance?: number | null;
  }[];
}

/**
 * Map backend JobSummaryResponse (snake_case fields) -> JobSummary.
 */
function transformJobSummary(data: JobSummaryResponse): JobSummary {
  return {
    id: data.id,
    title: data.title,
    source: data.source,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Map backend JobRequirementResponse -> JobRequirement.
 */
function transformRequirement(data: JobRequirementResponse): JobRequirement {
  return {
    id: data.id,
    skill: data.skill,
    importance: data.importance,
    inferred: Boolean(data.inferred),
    createdAt: data.created_at,
  };
}

/** Utility: Safe human-display conversion of arbitrary JSON value. */
function toDisplayString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Utility: Convert snake_case_label -> Title Case Label */
function formatLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Normalize flexible highlights structure into string array.
 * Accepts arrays of strings OR objects with skill/importance/inferred fields or any nested JSON.
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

/**
 * Normalize overview JSON into labeled entries list.
 * Handles array -> sequential Item N labels, object -> Title Cased keys, primitive -> single Summary entry.
 */
function normalizeOverviewEntries(
  value: unknown
): Array<{ label: string; value: string }> {
  if (!value) return [];
  if (Array.isArray(value)) {
    const entries: Array<{ label: string; value: string }> = [];
    value.forEach((item, index) => {
      const text = toDisplayString(item).trim();
      if (text) {
        entries.push({ label: `Item ${index + 1}`, value: text });
      }
    });
    return entries;
  }
  if (typeof value === "object") {
    const entries: Array<{ label: string; value: string }> = [];
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      const text = toDisplayString(raw).trim();
      if (text) {
        entries.push({ label: formatLabel(key), value: text });
      }
    }
    return entries;
  }
  const text = toDisplayString(value).trim();
  return text ? [{ label: "Summary", value: text }] : [];
}

/**
 * Join overview entries into single human-readable summary string.
 */
function joinOverview(
  entries: Array<{ label: string; value: string }>
): string | null {
  if (entries.length === 0) return null;
  return entries.map((entry) => `${entry.label}: ${entry.value}`).join(" | ");
}

/**
 * Transform JobDetailResponse -> JobDetail including normalization of nested parsedData structure.
 */
function transformJobDetail(data: JobDetailResponse): JobDetail {
  const summaryRaw =
    data.parsedData && typeof data.parsedData === "object"
      ? (data.parsedData as Record<string, unknown>)
      : null;

  let parsedSummary: JobParsedSummary | null = null;
  if (summaryRaw) {
    const highlights = normalizeHighlights(summaryRaw["highlights"]);
    const overviewEntries = normalizeOverviewEntries(summaryRaw["overview"]);
    const overview = joinOverview(overviewEntries);
    const messageValue = summaryRaw["message"];
    const messageText = (() => {
      if (messageValue == null) return undefined;
      const text = toDisplayString(messageValue).trim();
      return text ? text : undefined;
    })();

    parsedSummary = {
      highlights,
      overview,
      overviewEntries,
      onet: summaryRaw["onet"],
      message: messageText,
    };
  }

  const result: JobDetail = {
    id: data.id,
    title: data.title,
    source: data.source,
    status: data.status,
    parsedData: parsedSummary,
    // Frontend safety: re-apply inferred importance threshold in case backend missed or threshold changed dynamically client-side.
    requirements: (data.requirements || [])
      .map(transformRequirement)
      .filter((r) =>
        r.inferred && r.importance != null
          ? r.importance >=
            (typeof process !== "undefined" &&
            process.env.NEXT_PUBLIC_JOB_INFERRED_MIN_IMPORTANCE
              ? parseFloat(
                  process.env.NEXT_PUBLIC_JOB_INFERRED_MIN_IMPORTANCE as string
                ) > 1
                ? parseFloat(
                    process.env
                      .NEXT_PUBLIC_JOB_INFERRED_MIN_IMPORTANCE as string
                  ) / 100
                : parseFloat(
                    process.env
                      .NEXT_PUBLIC_JOB_INFERRED_MIN_IMPORTANCE as string
                  )
              : 0.7)
          : true
      ),
    softSkills: (data.soft_skills || []).map((s) => ({
      skill: s.skill,
      value: s.value ?? (s as any).importance ?? null,
      importance: s.value ?? (s as any).importance ?? null,
    })),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
  if (typeof window !== "undefined") {
    try {
      // Development/debug logging; can be gated by env if needed
      console.log("[jobs] JobDetail received", {
        id: result.id,
        requirements: result.requirements.length,
        explicit: result.requirements.filter((r) => !r.inferred).length,
        inferred: result.requirements.filter((r) => r.inferred).length,
        softSkills: result.softSkills?.length || 0,
      });
    } catch {
      /* ignore */
    }
  }
  return result;
}

/**
 * Fetch job list for current user.
 * @param token Optional bearer token; when omitted relies on public access (if allowed).
 * @returns Array of JobSummary.
 */
export async function getJobs(token?: string | null): Promise<JobSummary[]> {
  const response = await backendFetch<JobSummaryResponse[]>(
    "/jobs",
    {},
    { token }
  );
  return response.map(transformJobSummary);
}

/**
 * Fetch a single job detail by id.
 * @param id Job identifier.
 * @param token Optional bearer token.
 * @returns JobDetail with parsed summary & requirements arrays.
 */
export async function getJobDetail(
  id: string,
  token?: string | null
): Promise<JobDetail> {
  const response = await backendFetch<JobDetailResponse>(
    `/jobs/${id}`,
    {},
    { token }
  );
  return transformJobDetail(response);
}

/**
 * Create a new job using raw text fields supplied via FormData.
 * Accepts 'title' and either 'description_text' or legacy 'text'.
 * @param form FormData from client.
 * @param token Optional bearer token.
 * @returns Backend JSON response (typed loosely as unknown here).
 */
export async function createJobFromText(form: FormData, token?: string | null) {
  const payload = {
    title: form.get("title") || null,
    description_text: form.get("description_text") || form.get("text") || "",
  };
  return backendFetch(
    "/jobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { token }
  );
}

/**
 * Create a new job by uploading a file (multi-part form).
 * @param formData FormData containing file input; backend infers metadata.
 * @param token Optional bearer token.
 * @throws Error when backendUpload returns non-ok status.
 * @returns Parsed JSON response from backend.
 */
export async function createJobFromFile(
  formData: FormData,
  token?: string | null
) {
  // Ensure title field present (frontend validators should enforce, this is a safeguard)
  if (!formData.get("title")) {
    throw new Error("Job title is required.");
  }
  const response = await backendUpload("/jobs", formData, { token });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to upload job file");
  }
  return response.json();
}

/**
 * Soft delete a job by id.
 * @param id Job identifier.
 */
export async function deleteJob(id: string, token?: string | null) {
  await backendFetch(`/jobs/${id}`, { method: "DELETE" }, { token });
}
