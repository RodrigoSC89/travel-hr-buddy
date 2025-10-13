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

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
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
  });

  it("should display cron status badge when status is ok", async () => {
    // Mock successful fetch responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("cron-status")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              message: "✅ Cron executado há 2 hora(s) - Status: success",
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Wait for the cron status to be fetched and displayed
    await waitFor(() => {
      const statusBadge = screen.getByText(/Cron executado há 2 hora/i);
      expect(statusBadge).toBeDefined();
    });

    // Check that the status badge contains the success emoji
    const statusBadge = screen.getByText(/Cron executado há 2 hora/i);
    expect(statusBadge.textContent).toContain("✅");
  });

  it("should display warning badge when cron has not run recently", async () => {
    // Mock fetch responses with warning status
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("cron-status")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "warning",
              message: "⚠️ Última execução há 48 horas (mais de 36h atrás)",
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MemoryRouter>
        <AssistantReportLogsPage />
      </MemoryRouter>
    );

    // Wait for the cron status to be fetched and displayed
    await waitFor(() => {
      const statusBadge = screen.getByText(/Última execução há 48 horas/i);
      expect(statusBadge).toBeDefined();
    });

    // Check that the status badge contains the warning emoji
    const statusBadge = screen.getByText(/Última execução há 48 horas/i);
    expect(statusBadge.textContent).toContain("⚠️");
  });

  it("should not display status badge if cron-status API fails", async () => {
    // Mock fetch responses where cron-status fails
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("cron-status")) {
        return Promise.resolve({
          ok: false,
        });
      }
      return Promise.reject(new Error("Unknown URL"));
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

    // Check that no cron status badge is displayed
    expect(screen.queryByText(/Cron executado/i)).toBeNull();
    expect(screen.queryByText(/Última execução/i)).toBeNull();
  });

  it("should render page title and filters", async () => {
    // Mock successful fetch responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("assistant-report-logs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("cron-status")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              message: "✅ Cron executado há 2 hora(s) - Status: success",
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
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
