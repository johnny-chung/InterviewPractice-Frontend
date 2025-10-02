import { deleteJob } from "../../jobs/data";

// Mock backendFetch
jest.mock("@/services/backend-client", () => ({
  backendFetch: jest.fn().mockResolvedValue(undefined),
  backendUpload: jest.fn(),
}));

import { backendFetch } from "@/services/backend-client";

describe("deleteJob", () => {
  it("calls backend DELETE endpoint", async () => {
    await deleteJob("job-123", "token-abc");
    expect(backendFetch).toHaveBeenCalledWith(
      "/jobs/job-123",
      { method: "DELETE" },
      { token: "token-abc" }
    );
  });
});
