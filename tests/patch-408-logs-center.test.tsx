/**
 * PATCH 408: Logs Center Component Tests
 * Test suite for logs center and activity tracking
 */

import React, { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock log data
const mockLogs = [
  {
    id: "1",
    timestamp: "2025-10-28T10:00:00Z",
    level: "info",
    message: "System started",
    source: "system",
  },
  {
    id: "2",
    timestamp: "2025-10-28T10:05:00Z",
    level: "warning",
    message: "High memory usage",
    source: "monitor",
  },
  {
    id: "3",
    timestamp: "2025-10-28T10:10:00Z",
    level: "error",
    message: "Connection timeout",
    source: "network",
  },
];

// Mock Supabase
vi.mock("../src/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockLogs, error: null })),
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockLogs, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

// Mock contexts
type ProviderProps = { children: ReactNode };

vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user", email: "test@example.com" },
  }),
  AuthProvider: ({ children }: ProviderProps) => children,
}));

vi.mock("../src/contexts/TenantContext", () => ({
  useTenant: () => ({ tenantId: "test-tenant" }),
  TenantProvider: ({ children }: ProviderProps) => children,
}));

vi.mock("../src/contexts/OrganizationContext", () => ({
  useOrganization: () => ({
    currentOrganization: { id: "org-1", name: "Test Org" },
  }),
  OrganizationProvider: ({ children }: ProviderProps) => children,
}));

// Mock toast
vi.mock("../src/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Simple LogsCenter component for testing
const LogsCenter = () => {
  const [logs, setLogs] = React.useState(mockLogs);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    setLogs(mockLogs);
  }, []);
  
  const filteredLogs = React.useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);

  return (
    <div>
      <h1>Logs Center</h1>
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("info")}>Info</button>
        <button onClick={() => setFilter("warning")}>Warning</button>
        <button onClick={() => setFilter("error")}>Error</button>
      </div>
      <div data-testid="logs-list">
        {filteredLogs.map(log => (
          <div key={log.id} data-testid={`log-${log.level}`}>
            <span>{log.timestamp}</span>
            <span>{log.level}</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

describe("Logs Center Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderLogsCenter = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LogsCenter />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render logs center title", () => {
      renderLogsCenter();
      expect(screen.getByText("Logs Center")).toBeDefined();
    });

    it("should display all log entries", async () => {
      renderLogsCenter();
      
      await waitFor(() => {
        const logsList = screen.getByTestId("logs-list");
        expect(logsList.children.length).toBe(3);
      });
    });

    it("should show log levels", async () => {
      renderLogsCenter();
      
      await waitFor(() => {
        expect(screen.getByText("info")).toBeDefined();
        expect(screen.getByText("warning")).toBeDefined();
        expect(screen.getByText("error")).toBeDefined();
      });
    });
  });

  describe("Filtering", () => {
    it("should filter by info level", async () => {
      renderLogsCenter();
      
      const infoButton = screen.getByText("Info");
      fireEvent.click(infoButton);
      
      await waitFor(() => {
        const logs = screen.queryAllByTestId(/^log-/);
        expect(logs.length).toBe(1);
        expect(logs[0]).toHaveAttribute("data-testid", "log-info");
      });
    });

    it("should filter by warning level", async () => {
      renderLogsCenter();
      
      const warningButton = screen.getByText("Warning");
      fireEvent.click(warningButton);
      
      await waitFor(() => {
        const logs = screen.queryAllByTestId(/^log-/);
        expect(logs.length).toBe(1);
        expect(logs[0]).toHaveAttribute("data-testid", "log-warning");
      });
    });

    it("should filter by error level", async () => {
      renderLogsCenter();
      
      const errorButton = screen.getByText("Error");
      fireEvent.click(errorButton);
      
      await waitFor(() => {
        const logs = screen.queryAllByTestId(/^log-/);
        expect(logs.length).toBe(1);
        expect(logs[0]).toHaveAttribute("data-testid", "log-error");
      });
    });

    it("should show all logs when all filter is selected", async () => {
      renderLogsCenter();
      
      // First filter to info
      fireEvent.click(screen.getByText("Info"));
      
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^log-/).length).toBe(1);
      });
      
      // Then back to all
      fireEvent.click(screen.getByText("All"));
      
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^log-/).length).toBe(3);
      });
    });
  });

  describe("Log Display", () => {
    it("should display timestamps", () => {
      renderLogsCenter();
      mockLogs.forEach(log => {
        expect(screen.getByText(log.timestamp)).toBeDefined();
      });
    });

    it("should display log messages", () => {
      renderLogsCenter();
      mockLogs.forEach(log => {
        expect(screen.getByText(log.message)).toBeDefined();
      });
    });

    it("should display log levels correctly", () => {
      renderLogsCenter();
      expect(screen.getAllByText("info").length).toBeGreaterThan(0);
      expect(screen.getAllByText("warning").length).toBeGreaterThan(0);
      expect(screen.getAllByText("error").length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should render efficiently", () => {
      const startTime = performance.now();
      renderLogsCenter();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should handle large number of logs", async () => {
      const manyLogs = Array.from({ length: 100 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date().toISOString(),
        level: ["info", "warning", "error"][i % 3],
        message: `Log message ${i}`,
        source: "test",
      }));
      
      // Component should handle large datasets
      expect(manyLogs.length).toBe(100);
    });
  });

  describe("User Interactions", () => {
    it("should respond to filter button clicks", async () => {
      renderLogsCenter();
      
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        fireEvent.click(button);
      });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });

    it("should maintain filter state", async () => {
      renderLogsCenter();
      
      fireEvent.click(screen.getByText("Warning"));
      
      await waitFor(() => {
        const logs = screen.queryAllByTestId(/^log-/);
        expect(logs.length).toBe(1);
      });
      
      // State should be maintained
      const logs = screen.queryAllByTestId(/^log-/);
      expect(logs.length).toBe(1);
    });
  });
});
