import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createJobFromFile, createJobFromText } from "../api/jobs";

type Mode = "file" | "text";

export function JobForm() {
  const [mode, setMode] = useState<Mode>("text");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fileMutation = useMutation({
    mutationFn: createJobFromFile,
    onSuccess: () => {
      setFile(null);
      setTitle("");
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    },
  });

  const textMutation = useMutation({
    mutationFn: createJobFromText,
    onSuccess: () => {
      setDescription("");
      setTitle("");
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (mode === "file") {
      if (!file) {
        setError("Select a job description file");
        return;
      }
      fileMutation.mutate({ title: title || undefined, file });
    } else {
      if (!description.trim()) {
        setError("Enter the job description text");
        return;
      }
      textMutation.mutate({ title: title || undefined, descriptionText: description });
    }
  };

  const isPending = fileMutation.isPending || textMutation.isPending;
  const isSuccess = fileMutation.isSuccess || textMutation.isSuccess;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="tabs">
        <button
          type="button"
          className={mode === "text" ? "tab active" : "tab"}
          onClick={() => setMode("text")}
        >
          Paste description
        </button>
        <button
          type="button"
          className={mode === "file" ? "tab active" : "tab"}
          onClick={() => setMode("file")}
        >
          Upload file
        </button>
      </div>

      <label className="form-label">
        Job title (optional)
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Senior Data Engineer"
        />
      </label>

      {mode === "text" ? (
        <label className="form-label">
          Job description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="Paste the job description text"
          />
        </label>
      ) : (
        <label className="form-label">
          Job description file
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </label>
      )}

      <div className="form-row">
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Job"}
        </button>
        {isSuccess ? <span className="form-success">Job queued for parsing.</span> : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
