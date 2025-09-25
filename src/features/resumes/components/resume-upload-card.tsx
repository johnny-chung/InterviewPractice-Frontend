"use client";

import { useState, useTransition } from "react";

import { submitResumeAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResumeUploadCard() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a resume</CardTitle>
        <CardDescription>Supported formats: PDF, DOCX, TXT up to 10 MB.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              try {
                await submitResumeAction(formData);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to upload resume");
              }
            });
          }}
        >
          <Input type="file" name="file" accept=".pdf,.doc,.docx,.txt" required />
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Upload Resume"}
          </Button>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
