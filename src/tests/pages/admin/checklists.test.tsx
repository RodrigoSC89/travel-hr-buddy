import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChecklistsPage from "@/pages/admin/checklists";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
    session: null,
    isLoading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: "1", title: "Test Checklist" },
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
    functions: {
      invoke: vi.fn(() => ({
        data: { items: ["Item 1", "Item 2", "Item 3"] },
        error: null,
      })),
    },
  },
}));

// Mock html2canvas
vi.mock("html2canvas", () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: () => "data:image/png;base64,test",
    height: 100,
    width: 100,
  })),
}));

// Mock jsPDF
vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

describe("ChecklistsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const title = screen.getByText(/Checklists Inteligentes/i);
      expect(title).toBeInTheDocument();
    });
  });

  it("should render input field for new checklist", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Novo checklist/i);
      expect(input).toBeInTheDocument();
    });
  });

  it("should render create button", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const button = screen.getByText(/Criar/i);
      expect(button).toBeInTheDocument();
    });
  });

  it("create button should be disabled when input is empty", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /Criar/i });
      expect(button).toBeDisabled();
    });
  });

  it("should render 'Gerar com IA' button", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const button = screen.getByText(/Gerar com IA/i);
      expect(button).toBeInTheDocument();
    });
  });

  it("'Gerar com IA' button should be disabled when input is empty", async () => {
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <ChecklistsPage />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /Gerar com IA/i });
      expect(button).toBeDisabled();
    });
  });
});
