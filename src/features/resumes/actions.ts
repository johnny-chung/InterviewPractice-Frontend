// Module: resumes/actions
// Purpose: Server Action for uploading a resume file and triggering dashboard revalidation.
// Flow: auth() -> validate presence of file -> uploadResume(data.ts) -> revalidate dashboard path.
"use server";

import { auth } from "@/auth/auth";
import { revalidatePath } from "next/cache";

import { uploadResume } from "./data";

/**
 * Upload a resume file selected by the user.
 * @param formData FormData containing a 'file' entry (PDF, DOCX, etc.).
 * @throws Error when no file provided.
 * @returns Promise<void> (side effects only). Revalidates /dashboard on success.
 */
export async function submitResumeAction(formData: FormData) {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!formData.get("file")) {
    throw new Error("Please select a resume file before uploading.");
  }
  await uploadResume(formData, token);
  revalidatePath("/dashboard");
}
