import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmailLogsPage from "@/pages/admin/reports/email-logs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase client
const mockEmailLogs = [
  {
    id: "1",
    sent_at: "2025-10-12T10:00:00Z",
    status: "success",
    message: "Daily restore report sent successfully",
    recipient_email: "admin@example.com",
    error_details: null,
    report_type: "daily_restore_report",
  },
  {
    id: "2",
    sent_at: "2025-10-11T15:30:00Z",
    status: "error",
    message: "Failed to send weekly report",
    recipient_email: "user@example.com",
    error_details: "SMTP connection failed",
    report_type: "weekly_report",
  },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                data: mockEmailLogs,
                error: null,
              })),
            })),
          })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              data: mockEmailLogs,
              error: null,
            })),
          })),
          lte: vi.fn(() => ({
            data: mockEmailLogs,
            error: null,
          })),
          data: mockEmailLogs,
          error: null,
        })),
      })),
    })),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("EmailLogsPage", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders the page title correctly", () => {
    renderWithProviders(<EmailLogsPage />);
    expect(screen.getByText("Email Report Logs")).toBeInTheDocument();
  });

  it("renders the page description", () => {
    renderWithProviders(<EmailLogsPage />);
    expect(
      screen.getByText("Audit trail of all email reports sent by the system")
    ).toBeInTheDocument();
  });

  it("renders filter inputs", () => {
    renderWithProviders(<EmailLogsPage />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Start Date")).toBeInTheDocument();
    expect(screen.getByText("End Date")).toBeInTheDocument();
  });

  it("renders the update button", () => {
    renderWithProviders(<EmailLogsPage />);
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("displays logs with correct information", async () => {
    renderWithProviders(<EmailLogsPage />);

    await waitFor(() => {
      expect(screen.getByText("Daily restore report sent successfully")).toBeInTheDocument();
    });

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("daily_restore_report")).toBeInTheDocument();
  });

  it("displays error logs with error details", async () => {
    renderWithProviders(<EmailLogsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to send weekly report")).toBeInTheDocument();
    });

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("SMTP connection failed")).toBeInTheDocument();
  });

  it("displays status badges with correct variants", async () => {
    renderWithProviders(<EmailLogsPage />);

    await waitFor(() => {
      const successBadges = screen.getAllByText("success");
      const errorBadges = screen.getAllByText("error");
      
      expect(successBadges.length).toBeGreaterThan(0);
      expect(errorBadges.length).toBeGreaterThan(0);
    });
  });

  it("displays formatted dates", async () => {
    renderWithProviders(<EmailLogsPage />);

    await waitFor(() => {
      // Check that dates are formatted as dd/MM/yyyy HH:mm
      expect(screen.getByText(/12\/10\/2025/)).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    renderWithProviders(<EmailLogsPage />);
    expect(screen.getByText("Loading logs...")).toBeInTheDocument();
  });

  it("displays logs section header", async () => {
    renderWithProviders(<EmailLogsPage />);

    await waitFor(() => {
      expect(screen.getByText("Logs")).toBeInTheDocument();
    });
  });
});
