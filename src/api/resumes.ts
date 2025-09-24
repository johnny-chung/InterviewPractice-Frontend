import { request, upload } from "./client";
import type {
  CandidateSkill,
  ResumeDetail,
  ResumeParsedSummary,
  ResumeStatus,
  ResumeSummary,
} from "../types/api";

type ResumeSummaryResponse = {
  id: string;
  filename: string | null;
  mime_type: string | null;
  status: ResumeStatus;
  created_at: string;
  updated_at: string;
};

type ResumeSkillResponse = {
  id: string;
  skill: string;
  experience_years: number | null;
  proficiency: number | null;
  created_at: string;
};

type ResumeDetailResponse = {
  id: string;
  filename: string | null;
  mimeType: string | null;
  status: ResumeStatus;
  parsedData: unknown;
  skills: ResumeSkillResponse[];
  createdAt: string;
  updatedAt: string;
};

function normalizeResumeParsedSummary(parsed: unknown): ResumeParsedSummary | null {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  const profileRaw = record.profile as Record<string, unknown> | undefined;
  const sectionsRaw = record.sections as Record<string, unknown> | undefined;

  const profile = profileRaw
    ? {
        name: (profileRaw.name as string | null | undefined) ?? null,
        totalExperienceYears:
          (profileRaw.totalExperienceYears as number | null | undefined) ??
          (profileRaw.total_experience_years as number | null | undefined) ??
          null,
        summary: (profileRaw.summary as string | null | undefined) ?? null,
      }
    : null;

  const sections: Record<string, string | string[]> | null = sectionsRaw
    ? Object.fromEntries(
        Object.entries(sectionsRaw).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value.map((entry) => String(entry))];
          }
          return [key, value == null ? "" : String(value)];
        })
      )
    : null;

  return {
    sections,
    profile,
    statistics: (record.statistics as Record<string, unknown> | null | undefined) ?? null,
    message: (record.message as string | undefined) ?? undefined,
  };
}

function toResumeSummary(item: ResumeSummaryResponse): ResumeSummary {
  return {
    id: item.id,
    filename: item.filename,
    mimeType: item.mime_type,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function toCandidateSkill(item: ResumeSkillResponse): CandidateSkill {
  return {
    id: item.id,
    skill: item.skill,
    experienceYears: item.experience_years,
    proficiency: item.proficiency,
    createdAt: item.created_at,
  };
}

function toResumeDetail(item: ResumeDetailResponse): ResumeDetail {
  return {
    id: item.id,
    filename: item.filename,
    mimeType: item.mimeType,
    status: item.status,
    parsedData: normalizeResumeParsedSummary(item.parsedData),
    skills: (item.skills || []).map(toCandidateSkill),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listResumes(): Promise<ResumeSummary[]> {
  const data = await request<ResumeSummaryResponse[]>("/resumes");
  return data.map(toResumeSummary);
}

export async function getResume(id: string): Promise<ResumeDetail> {
  const data = await request<ResumeDetailResponse>(`/resumes/${id}`);
  return toResumeDetail(data);
}

export async function uploadResume(file: File): Promise<{ id: string; status: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return upload<{ id: string; status: string }>("/resumes", formData);
}
