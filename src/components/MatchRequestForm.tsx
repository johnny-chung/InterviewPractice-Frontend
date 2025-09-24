import { type FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestMatch } from "../api/matches";
import type { JobSummary, ResumeSummary } from "../types/api";

type Props = {
  resumes: ResumeSummary[];
  jobs: JobSummary[];
};

export function MatchRequestForm({ resumes, jobs }: Props) {
  const readyResumes = resumes.filter((item) => item.status === "ready");
  const readyJobs = jobs.filter((item) => item.status === "ready");
  const [resumeId, setResumeId] = useState<string>(readyResumes[0]?.id ?? "");
  const [jobId, setJobId] = useState<string>(readyJobs[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (readyResumes.length > 0 && !readyResumes.find((item) => item.id === resumeId)) {
      setResumeId(readyResumes[0].id);
    }
  }, [readyResumes, resumeId]);

  useEffect(() => {
    if (readyJobs.length > 0 && !readyJobs.find((item) => item.id === jobId)) {
      setJobId(readyJobs[0].id);
    }
  }, [readyJobs, jobId]);

  const mutation = useMutation({
    mutationFn: requestMatch,
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to request match");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resumeId || !jobId) {
      setError("Select a ready resume and job");
      return;
    }
    mutation.mutate({ resumeId, jobId });
  };

  const disabled = mutation.isPending || readyResumes.length === 0 || readyJobs.length === 0;

  return (
    <form className="form inline" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          Resume
          <select
            value={resumeId}
            onChange={(event) => setResumeId(event.target.value)}
            disabled={readyResumes.length === 0}
          >
            {readyResumes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.filename ?? "Untitled"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-group">
        <label>
          Job
          <select
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            disabled={readyJobs.length === 0}
          >
            {readyJobs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title ?? "Untitled"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn" disabled={disabled}>
        {mutation.isPending ? "Requesting..." : "Request Match"}
      </button>
      {mutation.isSuccess ? <span className="form-success">Match request queued.</span> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {readyResumes.length === 0 || readyJobs.length === 0 ? (
        <p className="form-hint">Upload a resume and job that are parsed (status Ready) to enable matching.</p>
      ) : null}
    </form>
  );
}
