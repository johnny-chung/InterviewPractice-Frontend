"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ResumeDetail } from "../data";

type Props = {
  resume?: ResumeDetail;
  isLoading?: boolean;
};

// NOTE: Previously we rendered arbitrary resume section JSON (summary, experience, etc.).
// The UX requirement changed: Only show parsed skills inside a single card on the right column.
// We keep the component lean and focused on skills and basic metadata.

export function ResumeDetailPanel({ resume, isLoading = false }: Props) {
  if (isLoading) {
    return <p className="empty-state">Loading resume...</p>;
  }
  if (!resume) {
    return <p className="empty-state">Select a resume to see details.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {resume.filename ?? "Untitled resume"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded {format(new Date(resume.createdAt), "PPpp")}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {resume.status}
        </Badge>
      </div>

      {resume.status !== "ready" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Parsing is {resume.status}. Skills list may be incomplete.
        </p>
      )}

      {/* Skills Card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-2">
          <h4 className="text-sm font-medium leading-none">
            Skills ({resume.skills.length})
          </h4>
        </div>
        <div className="flex-1 overflow-hidden">
          {resume.skills.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
              No skills parsed yet.
            </div>
          ) : (
            // Show roughly 5 skills before scroll: control via max height (estimate ~56px each inc. margin)
            <ul
              className="h-full space-y-2 overflow-auto p-4"
              style={{ maxHeight: "300px" }}
            >
              {resume.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-accent/40"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">{skill.skill}</p>
                    {(skill.experienceYears != null || skill.proficiency) && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {skill.experienceYears != null && (
                          <>
                            {skill.experienceYears}y{skill.proficiency && " · "}
                          </>
                        )}
                        {skill.proficiency}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
