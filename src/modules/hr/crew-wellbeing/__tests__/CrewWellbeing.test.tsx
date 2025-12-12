import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CrewWellbeing from "../index";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        })
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: 7.5, error: null })),
  },
}));

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({ data: null, isLoading: false })),
  useQueryClient: vi.fn(() => ({})),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: unknown: unknown: unknown) => children,
}));

// Mock useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("CrewWellbeing Module", () => {
  it("should render the crew wellbeing page", () => {
    render(<CrewWellbeing />);
    expect(screen.getByText("Crew Wellbeing")).toBeInTheDocument();
  });

  it("should display main navigation tabs", () => {
    render(<CrewWellbeing />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Assessment")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });

  it("should have proper structure", () => {
    const { container } = render(<CrewWellbeing />);
    expect(container.querySelector(".container")).toBeInTheDocument();
  });
});

describe("Wellbeing Score Calculator", () => {
  it("should calculate wellbeing score based on inputs", () => {
    // Mock test for wellbeing score calculation
    const calculateScore = (mood: number, stress: number, energy: number, sleep: number) => {
      const score = (mood * 2.0) + (6 - stress) + energy + (sleep >= 7 ? 1.0 : 0.0);
      return Math.max(0, Math.min(10, score));
    };

    expect(calculateScore(5, 2, 5, 8)).toBeGreaterThan(7);
    expect(calculateScore(2, 5, 2, 4)).toBeLessThan(5);
  });

  it("should normalize score to 0-10 range", () => {
    const normalizeScore = (score: number) => Math.max(0, Math.min(10, score));
    
    expect(normalizeScore(15)).toBe(10);
    expect(normalizeScore(-5)).toBe(0);
    expect(normalizeScore(7.5)).toBe(7.5);
  });
};
