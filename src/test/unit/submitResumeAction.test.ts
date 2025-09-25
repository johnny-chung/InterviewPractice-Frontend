import { submitResumeAction } from "@/features/resumes/actions";
import { uploadResume } from "@/features/resumes/data";
import { revalidatePath } from "next/cache";

jest.mock("@/auth/auth", () => ({
  auth: jest.fn(async () => ({ user: { accessToken: "TEST_TOKEN" } })),
}));
jest.mock("@/features/resumes/data", () => ({
  uploadResume: jest.fn(async () => ({ ok: true })),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

describe("submitResumeAction", () => {
  it("throws when file missing", async () => {
    await expect(submitResumeAction(new FormData())).rejects.toThrow(
      /select a resume/i
    );
  });
  it("calls uploadResume and revalidatePath with file present", async () => {
    const fd = new FormData();
    fd.append(
      "file",
      new File([new Uint8Array([1, 2, 3])], "resume.pdf", {
        type: "application/pdf",
      })
    );
    await submitResumeAction(fd);
    expect(uploadResume).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
