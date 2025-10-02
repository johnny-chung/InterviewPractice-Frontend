import { deleteResume } from "../../resumes/data";

jest.mock("@/services/backend-client", () => ({
  backendFetch: jest.fn().mockResolvedValue(undefined),
  backendUpload: jest.fn(),
}));

import { backendFetch } from "@/services/backend-client";

describe("deleteResume", () => {
  it("calls backend DELETE endpoint", async () => {
    await deleteResume("resume-123", "token-xyz");
    expect(backendFetch).toHaveBeenCalledWith(
      "/resumes/resume-123",
      { method: "DELETE" },
      { token: "token-xyz" }
    );
  });
});
