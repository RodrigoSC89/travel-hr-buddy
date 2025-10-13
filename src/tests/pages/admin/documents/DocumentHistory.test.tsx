import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentHistoryPage from "@/pages/admin/documents/DocumentHistory";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user" } },
        error: null,
      }),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock RoleBasedAccess to always allow access
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DocumentHistoryPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for empty versions
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("should render the page with loading state initially", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show loading state initially
    expect(screen.getByText(/Carregando histórico de versões.../i)).toBeInTheDocument();
  });

  it("should display no versions message when there are no versions", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma versão encontrada/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Este documento ainda não possui versões anteriores./i)).toBeInTheDocument();
    });
  });

  it("should render back button that navigates to document view", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /Voltar/i });
      expect(backButton).toBeInTheDocument();
    });
  });
});
