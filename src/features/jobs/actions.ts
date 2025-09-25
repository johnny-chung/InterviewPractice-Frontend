// Module: jobs/actions
// Purpose: Server Actions (Next.js "use server") for creating Job records from either raw text or uploaded file.
// Workflow:
//   1. Authenticate user to obtain bearer token (auth()).
//   2. Validate required form fields.
//   3. Call underlying data layer creator function (createJobFromText/createJobFromFile) which invokes backend API.
//   4. Revalidate dashboard path so UI reflects new job immediately.
// Error Handling: Throws Error early if required form fields missing so UI can surface message.
"use server";

import { auth } from "@/auth/auth";
import { revalidatePath } from "next/cache";

import { createJobFromFile, createJobFromText } from "./data";

/**
 * Create a job from a text description.
 * Expects a FormData with either 'description_text' or legacy 'text', plus optional 'title'.
 * @param formData FormData submitted from client.
 * @throws Error when no description field is present.
 * @returns Promise<void> (side-effects only). After success triggers ISR revalidation of /dashboard.
 */
export async function submitJobFromText(formData: FormData) {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!formData.get("description_text") && !formData.get("text")) {
    throw new Error("Provide a job description before submitting.");
  }
  await createJobFromText(formData, token);
  revalidatePath("/dashboard");
}

/**
 * Create a job by uploading a file (PDF / DOCX, etc.).
 * Requires a 'file' entry inside the FormData.
 * @param formData FormData containing 'file'.
 * @throws Error when file missing.
 * @returns Promise<void> (side-effects only). Revalidates /dashboard after backend upload success.
 */
export async function submitJobFromFile(formData: FormData) {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!formData.get("file")) {
    throw new Error("Select a job description file before uploading.");
  }
  await createJobFromFile(formData, token);
  revalidatePath("/dashboard");
}
