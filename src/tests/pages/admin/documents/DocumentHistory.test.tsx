import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentHistoryPage from "@/pages/admin/documents/DocumentHistory";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: "test-user-id" } },
        error: null,
      })),
    },
  },
}));

// Mock RoleBasedAccess component
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("DocumentHistoryPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Histórico de Versões/i)).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("should render back button", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Voltar/i })).toBeInTheDocument();
    });
  });
});
