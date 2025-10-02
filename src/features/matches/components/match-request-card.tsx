"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createMatchAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ResumeSummary } from "@/features/resumes/data";
import type { JobSummary } from "@/features/jobs/data";

interface Props {
  resumes: ResumeSummary[];
  jobs: JobSummary[];
  matches?: { id: string; status: string; createdAt: string }[]; // minimal fields needed
}

export function MatchRequestCard({ resumes, jobs, matches = [] }: Props) {
  const readyResumes = useMemo(
    () => resumes.filter((item) => item.status === "ready"),
    [resumes]
  );
  const readyJobs = useMemo(
    () => jobs.filter((item) => item.status === "ready"),
    [jobs]
  );
  const [resumeId, setResumeId] = useState<string | undefined>(
    readyResumes[0]?.id
  );
  const [jobId, setJobId] = useState<string | undefined>(readyJobs[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const activeMatchInProgress = useMemo(
    () => matches.some((m) => m.status === "queued" || m.status === "running"),
    [matches]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a match</CardTitle>
        <CardDescription>
          Select a ready resume and job description to compute an AI match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeMatchInProgress && (
          <div className="mb-4 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
            A match is currently <span className="font-medium">running</span>.
            You can queue a new one once it finishes.
          </div>
        )}
        <form
          className="grid gap-4 md:grid-cols-3"
          action={(formData) => {
            setError(null);
            formData.set("resumeId", resumeId ?? "");
            formData.set("jobId", jobId ?? "");
            startTransition(async () => {
              try {
                await createMatchAction(formData);
                // After queueing, refresh to pick up new match list; socket event will also come but this is a fallback.
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Failed to queue match"
                );
              }
            });
          }}
        >
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">
              Resume
            </label>
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
            <label className="text-sm font-medium text-muted-foreground">
              Job
            </label>
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
            <Button
              type="submit"
              disabled={pending || !resumeId || !jobId || activeMatchInProgress}
              className="w-full"
            >
              {pending
                ? "Queuing..."
                : activeMatchInProgress
                ? "Match running"
                : "Queue match"}
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
            Upload at least one resume and job with status Ready to enable
            matching.
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Select a match request in the list to inspect detailed scores and gap
          analysis.
        </p>
      </CardContent>
    </Card>
  );
}
