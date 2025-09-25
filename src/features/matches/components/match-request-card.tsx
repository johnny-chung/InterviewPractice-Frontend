"use client";

import { useMemo, useState, useTransition } from "react";

import { createMatchAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ResumeSummary } from "@/features/resumes/data";
import type { JobSummary } from "@/features/jobs/data";

interface Props {
  resumes: ResumeSummary[];
  jobs: JobSummary[];
}

export function MatchRequestCard({ resumes, jobs }: Props) {
  const readyResumes = useMemo(() => resumes.filter((item) => item.status === "ready"), [resumes]);
  const readyJobs = useMemo(() => jobs.filter((item) => item.status === "ready"), [jobs]);
  const [resumeId, setResumeId] = useState<string | undefined>(readyResumes[0]?.id);
  const [jobId, setJobId] = useState<string | undefined>(readyJobs[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a match</CardTitle>
        <CardDescription>Select a ready resume and job description to compute an AI match.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-3"
          action={(formData) => {
            setError(null);
            formData.set("resumeId", resumeId ?? "");
            formData.set("jobId", jobId ?? "");
            startTransition(async () => {
              try {
                await createMatchAction(formData);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to queue match");
              }
            });
          }}
        >
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">Resume</label>
            <select
              value={resumeId}
              onChange={(event) => setResumeId(event.target.value)}
              disabled={readyResumes.length === 0}
            >
              {readyResumes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.filename ?? item.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">Job</label>
            <select
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
              disabled={readyJobs.length === 0}
            >
              {readyJobs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title ?? item.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end md:col-span-1">
            <Button type="submit" disabled={pending || !resumeId || !jobId} className="w-full">
              {pending ? "Queuing..." : "Queue match"}
            </Button>
          </div>
        </form>
        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {(readyResumes.length === 0 || readyJobs.length === 0) && (
          <p className="mt-4 text-sm text-muted-foreground">
            Upload at least one resume and job with status Ready to enable matching.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
