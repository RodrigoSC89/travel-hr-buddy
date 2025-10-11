import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RestoreVersionPage from "@/pages/admin/documents/RestoreVersion";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock navigation
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("RestoreVersionPage Component", () => {
  it("should render the page", () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/restore/123"]}>
        <Routes>
          <Route path="/admin/documents/restore/:id" element={<RestoreVersionPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check that the page loads (either loading state or content)
    expect(screen.getByText(/Carregando versão.../i)).toBeInTheDocument();
  });
});

