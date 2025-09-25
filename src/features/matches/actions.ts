// Module: matches/actions
// Purpose: Server Action to request a new resume-vs-job match computation.
// Flow: auth() -> extract resumeId & jobId from FormData -> validate -> call requestMatch(data.ts) -> revalidate dashboard.
// Validation: Ensures both resumeId and jobId provided; throws early otherwise.
"use server";

import { auth } from "@/auth/auth";
import { revalidatePath } from "next/cache";

import { requestMatch } from "./data";

/**
 * Trigger backend to compute a match between a specific resume and job.
 * @param formData FormData containing 'resumeId' and 'jobId'.
 * @throws Error when either id is missing.
 * @returns Promise<void> (side effects only). Revalidates /dashboard after queuing match.
 */
export async function createMatchAction(formData: FormData) {
  const session = await auth();
  const token = session?.user?.accessToken;
  const resumeId = formData.get("resumeId") as string | null;
  const jobId = formData.get("jobId") as string | null;
  if (!resumeId || !jobId) {
    throw new Error(
      "Select both a resume and a job before requesting a match."
    );
  }
  await requestMatch({ resumeId, jobId }, token);
  revalidatePath("/dashboard");
}
