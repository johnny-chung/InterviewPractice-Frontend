import "@testing-library/jest-dom";
import "whatwg-fetch";

// Mock next/navigation for hooks used in components
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
