"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import type { ResumeDetail } from "../data";

type Props = {
  resume?: ResumeDetail;
  isLoading?: boolean;
};

function renderValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ResumeDetailPanel({ resume, isLoading = false }: Props) {
  if (isLoading) {
    return <p className="empty-state">Loading resume...</p>;
  }
  if (!resume) {
    return <p className="empty-state">Select a resume to see details.</p>;
  }

  const sections = resume.parsedData?.sections ?? {};

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h3 className="detail-title">{resume.filename ?? "Untitled resume"}</h3>
          <p className="detail-meta">Uploaded {format(new Date(resume.createdAt), "PPpp")}</p>
        </div>
        <Badge variant="secondary">{resume.status}</Badge>
      </div>

      {resume.status !== "ready" ? (
        <p className="detail-alert">
          Parsing is {resume.status}. Data below may be incomplete.
        </p>
      ) : null}

      <div className="detail-card">
        <h4>Skills ({resume.skills.length})</h4>
        {resume.skills.length === 0 ? (
          <p className="empty-state">No skills parsed yet.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {resume.skills.map((skill) => (
              <div key={skill.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                <p className="font-medium text-foreground">{skill.skill}</p>
                <p className="text-xs text-muted-foreground">
                  Experience: {skill.experienceYears ?? "n/a"} · Proficiency: {skill.proficiency ?? "n/a"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.keys(sections).length > 0 ? (
        <div className="detail-card">
          <h4>Sections</h4>
          <div className="section-list">
            {Object.entries(sections).map(([key, value]) => (
              <div key={key} className="section-item">
                <h5>{key.replace(/_/g, " ")}</h5>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
                  {Array.isArray(value)
                    ? value.map((entry) => renderValue(entry)).join("\n")
                    : renderValue(value)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

