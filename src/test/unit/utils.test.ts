import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes and removes duplicates", () => {
    const result = cn("p-2", "p-2", "text-sm", false && "hidden", "bg-red-500");
    expect(result).toContain("p-2");
    expect(result.match(/p-2/g)?.length).toBe(1);
    expect(result).toContain("text-sm");
    expect(result).toContain("bg-red-500");
  });
});
