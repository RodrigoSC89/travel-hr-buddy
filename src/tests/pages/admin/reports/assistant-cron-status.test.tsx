import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AssistantReportLogsPage from "@/pages/admin/reports/assistant";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase client
const mockGetSession = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("AssistantReportLogsPage - Cron Status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "mock-token",
        },
      },
    });
    
    // Reset all mock functions
    mockSelect.mockClear();
    mockEq.mockClear();
    mockOrder.mockClear();
    mockLimit.mockClear();
  });

  it("should display cron status badge when status is ok", async () => {
    // Mock successful fetch for logs
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // Mock Supabase query for health check - recent execution
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValue({
      data: [
        {
          sent_at: twoHoursAgo.toISOString(),
          status: "success",
        },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Wait for the health status to be displayed
    await waitFor(() => {
      const statusMessage = screen.getByText(/Sistema operando normalmente/i);
      expect(statusMessage).toBeDefined();
    });

    // Check that the status contains the success emoji
    const statusMessage = screen.getByText(/Sistema operando normalmente/i);
    expect(statusMessage.textContent).toContain("✅");
  });

  it("should display warning badge when cron has not run recently", async () => {
    // Mock fetch for logs
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // Mock Supabase query for health check - old execution (38 hours ago)
    const thirtyEightHoursAgo = new Date(Date.now() - 38 * 60 * 60 * 1000);
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValue({
      data: [
        {
          sent_at: thirtyEightHoursAgo.toISOString(),
          status: "success",
        },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Wait for the health status to be displayed
    await waitFor(() => {
      const statusMessage = screen.getByText(/Atenção necessária/i);
      expect(statusMessage).toBeDefined();
    });

    // Check that the status contains the warning emoji
    const statusMessage = screen.getByText(/Atenção necessária/i);
    expect(statusMessage.textContent).toContain("⚠️");
  });

  it("should not display status badge if cron-status API fails", async () => {
    // Mock fetch for logs
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // Mock Supabase query for health check - error case
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Wait a bit and verify no status badge is shown
    await waitFor(() => {
      const heading = screen.getByText(/Logs de Envio de Relatórios/i);
      expect(heading).toBeDefined();
    });

    // Check that no health status is displayed
    expect(screen.queryByText(/Sistema operando/i)).toBeNull();
    expect(screen.queryByText(/Atenção necessária/i)).toBeNull();
  });

  it("should render page title and filters", async () => {
    // Mock successful fetch for logs
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // Mock Supabase query for health check
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValue({
      data: [
        {
          sent_at: twoHoursAgo.toISOString(),
          status: "success",
        },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Verify page title is rendered
    expect(screen.getByText(/Logs de Envio de Relatórios/i)).toBeDefined();

    // Verify filter inputs are rendered
    expect(screen.getByPlaceholderText(/E-mail do usuário/i)).toBeDefined();
    expect(screen.getByText(/🔍 Buscar/i)).toBeDefined();
  });
});
