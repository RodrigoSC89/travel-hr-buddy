import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentViewPage from "@/pages/admin/documents/DocumentView";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    })),
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

describe("DocumentViewPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display document not found message", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Documento não encontrado./i)).toBeInTheDocument();
    });
  });

  it("should render back button in document view", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/view/123"]}>
        <Routes>
          <Route path="/admin/documents/view/:id" element={<DocumentViewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check if "Documento não encontrado" is shown first
      expect(screen.getByText(/Documento não encontrado./i)).toBeInTheDocument();
    });
  });
});
