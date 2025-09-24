import { postJson, request, upload } from "./client";
import type { JobDetail, JobRequirement, JobStatus, JobSummary } from "../types/api";

type JobSummaryResponse = {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

type JobRequirementResponse = {
  id: string;
  skill: string;
  importance: number | null;
  inferred: 0 | 1 | boolean;
  created_at: string;
};

type JobDetailResponse = {
  id: string;
  title: string | null;
  source: "file" | "text" | null;
  status: JobStatus;
  parsedData: JobDetail["parsedData"];
  requirements: JobRequirementResponse[];
  createdAt: string;
  updatedAt: string;
};

function toJobSummary(item: JobSummaryResponse): JobSummary {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function toJobRequirement(item: JobRequirementResponse): JobRequirement {
  return {
    id: item.id,
    skill: item.skill,
    importance: item.importance,
    inferred: Boolean(item.inferred),
    createdAt: item.created_at,
  };
}

function toJobDetail(item: JobDetailResponse): JobDetail {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    status: item.status,
    parsedData: item.parsedData,
    requirements: (item.requirements || []).map(toJobRequirement),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listJobs(): Promise<JobSummary[]> {
  const data = await request<JobSummaryResponse[]>("/jobs");
  return data.map(toJobSummary);
}

export async function getJob(id: string): Promise<JobDetail> {
  const data = await request<JobDetailResponse>(`/jobs/${id}`);
  return toJobDetail(data);
}

export async function createJobFromFile(params: {
  title?: string;
  file: File;
}): Promise<{ id: string; status: string }> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.title) {
    formData.append("title", params.title);
  }
  return upload<{ id: string; status: string }>("/jobs", formData);
}

export async function createJobFromText(params: {
  title?: string;
  descriptionText: string;
}): Promise<{ id: string; status: string }> {
  const payload = {
    title: params.title,
    description_text: params.descriptionText,
  };
  return postJson<{ id: string; status: string }>("/jobs", payload);
}
