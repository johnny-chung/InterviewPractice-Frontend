"use client";

import { useState, useTransition } from "react";

import { submitJobFromFile, submitJobFromText } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function JobSubmissionCard() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "text") {
          await submitJobFromText(formData);
        } else {
          await submitJobFromFile(formData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Job submission failed");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a job description</CardTitle>
        <CardDescription>
          Upload a file or paste raw text to extract requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "text" | "file")}
        >
          <TabsList>
            <TabsTrigger value="text">Paste text</TabsTrigger>
            <TabsTrigger value="file">Upload file</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="border-none p-0 shadow-none">
            <form
              className="flex flex-col gap-4"
              action={(formData) => {
                formData.set("mode", "text");
                handleSubmit(formData);
              }}
            >
              <Input name="title" placeholder="Job title" required />
              <Textarea
                name="description_text"
                placeholder="Paste the job description here"
                rows={8}
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Submit job"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="file" className="border-none p-0 shadow-none">
            <form
              className="flex flex-col gap-4"
              action={(formData) => {
                formData.set("mode", "file");
                handleSubmit(formData);
              }}
            >
              <Input name="title" placeholder="Job title" required />
              <Input type="file" name="file" accept=".pdf,.doc,.docx,.txt" />
              <Button type="submit" disabled={pending}>
                {pending ? "Uploading..." : "Upload job file"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
