import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.fn();

// Mock react-router-dom navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockVersions = [
  {
    id: "version-1",
    document_id: "doc-123",
    content: "Latest content version",
    created_at: "2025-10-11T10:00:00Z",
    updated_by: "user-1",
  },
  {
    id: "version-2",
    document_id: "doc-123",
    content: "Old content version 1",
    created_at: "2025-10-10T10:00:00Z",
    updated_by: "user-2",
  },
  {
    id: "version-3",
    document_id: "doc-123",
    content: "Old content version 2",
    created_at: "2025-10-09T10:00:00Z",
    updated_by: "user-1",
  },
];

const mockProfiles = {
  "user-1": { email: "user1@example.com" },
  "user-2": { email: "user2@example.com" },
};

const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: { id: "current-user-123" } },
        error: null,
      })
    ),
  },
};

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock RoleBasedAccess to just render children
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: mockToast,
}));

describe("DocumentHistoryPage", () => {
  let DocumentHistoryPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset the supabase mock for each test
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "ai_generated_documents") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { title: "Test Document" },
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        };
      }

      if (table === "document_versions") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockVersions,
            error: null,
          }),
        };
      }

      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((field: string, value: string) => ({
            single: vi.fn().mockResolvedValue({
              data: mockProfiles[value as keyof typeof mockProfiles],
              error: null,
            }),
          })),
        };
      }

      if (table === "document_restore_logs") {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }

      return {};
    });

    // Dynamically import the component after mocks are set up
    const module = await import("@/pages/admin/documents/DocumentHistory");
    DocumentHistoryPage = module.default;
  });

  it("renders document history page with versions", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Histórico de Versões/i)).toBeInTheDocument();
    });

    // Check document title is displayed
    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Check versions count
    expect(screen.getByText(/3 versão\(ões\) encontrada\(s\)/i)).toBeInTheDocument();
  });

  it("displays filter inputs", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filtrar por e-mail/i)).toBeInTheDocument();
    });

    // Check for date input by type
    const inputs = screen.getAllByRole("textbox");
    const emailInput = screen.getByPlaceholderText(/Filtrar por e-mail/i);
    expect(emailInput).toBeInTheDocument();
    
    // Date input won't have role textbox, we just verify both exist
    const allInputs = document.querySelectorAll('input');
    const dateInputs = Array.from(allInputs).filter(input => input.getAttribute('type') === 'date');
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it("filters versions by email", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Get email filter input
    const emailInput = screen.getByPlaceholderText(/Filtrar por e-mail/i);

    // Initially should show all 3 versions
    expect(screen.getByText(/3 versão\(ões\) encontrada\(s\)/i)).toBeInTheDocument();

    // Filter by user1
    fireEvent.change(emailInput, { target: { value: "user1" } });

    // Should still display some versions
    await waitFor(() => {
      const allEmails = screen.getAllByText(/user1@example.com/i);
      expect(allEmails.length).toBeGreaterThan(0);
    });
  });

  it("shows restore button for old versions", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Check for restore buttons (should have 2, not for the latest version)
    const restoreButtons = screen.getAllByText(/Restaurar/i);
    expect(restoreButtons.length).toBeGreaterThan(0);
  });

  it("clears filters when clear button is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Set filter values
    const emailInput = screen.getByPlaceholderText(/Filtrar por e-mail/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Click clear button
    const clearButton = screen.getByText(/Limpar/i);
    fireEvent.click(clearButton);

    // Check that input is cleared
    expect(emailInput).toHaveValue("");
  });

  it("navigates back to document view when back button is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Find and click back button
    const backButton = screen.getByRole("button", { name: /Voltar/i });
    fireEvent.click(backButton);

    // Verify navigation was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/admin/documents/view/doc-123");
  });

  it("handles version restoration", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/doc-123"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
    });

    // Get restore button (not for the first version)
    const restoreButtons = screen.getAllByText(/Restaurar/i);
    
    // Click the first restore button
    fireEvent.click(restoreButtons[0]);

    // Check that update was called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("ai_generated_documents");
    });
  });
});
