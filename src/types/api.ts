export type ResumeStatus = "queued" | "processing" | "ready" | "error";

export interface ResumeSummary {
  id: string;
  filename: string | null;
  mimeType: string | null;
  status: ResumeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeProfile {
  name?: string | null;
  totalExperienceYears?: number | null;
  summary?: string | null;
  [key: string]: unknown;
}

export interface ResumeParsedSummary {
  sections?: Record<string, string | string[]> | null;
  profile?: ResumeProfile | null;
  statistics?: Record<string, unknown> | null;
  message?: string;
  [key: string]: unknown;
}

export interface CandidateSkill {
  id: string;
  skill: string;
  experienceYears: number | null;
  proficiency: number | null;
  createdAt: string;
}

export interface ResumeDetail extends ResumeSummary {
  parsedData: ResumeParsedSummary | null;
  skills: CandidateSkill[];
}

export type JobStatus = ResumeStatus;

export interface JobSummary {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobParsedSummary {
  highlights?: string[] | string | null;
  overview?: string | null;
  onet?: unknown;
  message?: string;
  [key: string]: unknown;
}

export interface JobRequirement {
  id: string;
  skill: string;
  importance: number | null;
  inferred: boolean;
  createdAt: string;
}

export interface JobDetail extends JobSummary {
  parsedData: JobParsedSummary | null;
  requirements: JobRequirement[];
}

export type MatchJobStatus = "queued" | "running" | "completed" | "failed";

export interface MatchJobSummary {
  id: string;
  resumeId: string;
  jobId: string;
  status: MatchJobStatus;
  resultId: string | null;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
}

export interface RequirementAnalysis {
  requirement: string | null;
  importance: number | null;
  similarity: number;
  matchedSkill: string | null;
  inferred: boolean;
}

export interface RequirementSummary extends RequirementAnalysis {
  candidateHasExperience: boolean;
  comments: string;
}

export interface MatchCandidateSummary {
  name: string | null;
  skills: string[];
  experienceYears: number | null;
  degrees: string[];
  certifications: string[];
  summary: string | null;
}

export interface MatchSummary {
  overallMatchScore: number;
  candidate: MatchCandidateSummary | null;
  requirements: RequirementSummary[];
  strengths: string[];
  weaknesses: string[];
  jobHighlights: string[] | string | null;
  rawDetails: RequirementAnalysis[];
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
    summary: MatchSummary;
    completedAt: string;
  };
}
