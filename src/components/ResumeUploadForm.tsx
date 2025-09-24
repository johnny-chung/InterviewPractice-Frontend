import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadResume } from "../api/resumes";

export function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      setFile(null);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Select a file before uploading");
      return;
    }
    mutation.mutate(file);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form-label">
        Resume file
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            setFile(nextFile);
            setError(null);
          }}
        />
      </label>
      <div className="form-row">
        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? "Uploading..." : "Upload Resume"}
        </button>
        {mutation.isSuccess ? <span className="form-success">Resume queued for parsing.</span> : null}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
