export type EntityStatus = "queued" | "processing" | "ready" | "error";
export type MatchJobStatus = "queued" | "running" | "completed" | "failed";

export interface ResumeSummaryResponse {
  id: string;
  filename: string | null;
  mime_type: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface ResumeSkillResponse {
  id: string;
  skill: string;
  experience_years: number | null;
  proficiency: number | null;
  created_at: string;
}

export interface ResumeDetailResponse {
  id: string;
  filename: string | null;
  mimeType: string | null;
  status: EntityStatus;
  parsedData: unknown;
  skills: ResumeSkillResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface JobSummaryResponse {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface JobRequirementResponse {
  id: string;
  skill: string;
  importance: number | null;
  inferred: boolean | 0 | 1;
  created_at: string;
}

export interface JobDetailResponse {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: EntityStatus;
  parsedData: unknown;
  requirements: JobRequirementResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchJobResponse {
  id: string;
  resume_id: string;
  job_id: string;
  status: MatchJobStatus;
  result_id: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface RequirementSummaryResponse {
  skill: string | null;
  importance: number | null;
  candidate_has_experience: boolean;
  similarity: number;
  matched_skill: string | null;
  inferred: boolean;
  comments: string;
}

export interface RequirementAnalysisResponse {
  requirement: string | null;
  importance: number | null;
  similarity: number;
  matched_skill: string | null;
  inferred: boolean;
}

export interface MatchDetailResponse {
  id: string;
  status: MatchJobStatus;
  resumeId: string;
  jobId: string;
  error: string | null;
  match?: {
    id: string;
    score: number;
    summary: {
      overall_match_score: number;
      candidate: {
        name: string | null;
        skills: string[];
        experience_years: number | null;
        degrees: string[];
        certifications: string[];
        summary: string | null;
      } | null;
      requirements: RequirementSummaryResponse[];
      strengths: Array<string | Record<string, unknown>>;
      weaknesses: Array<string | Record<string, unknown>>;
      job_highlights: Array<string | Record<string, unknown>> | string | null;
      raw_details: RequirementAnalysisResponse[];
    };
    completedAt: string;
  };
}
