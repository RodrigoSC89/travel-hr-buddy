import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TestDashboard from "@/pages/admin/tests";
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

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("TestDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard title", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Not found"));
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <TestDashboard />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const title = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === "h1" && 
               content.includes("Painel de Testes Automatizados");
      });
      expect(title).toBeInTheDocument();
    });
  });

  it("should display fallback message when coverage report is not available", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Not found"));
    
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <TestDashboard />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Relatório de cobertura não disponível/i)).toBeInTheDocument();
    });
  });

  it("should display coverage percentage when report is available", async () => {
    const mockHtml = "<span class='strong'>85%</span>";
    (global.fetch as any).mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });
    
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <TestDashboard />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Cobertura total atual: 85%/i)).toBeInTheDocument();
    });
  });

  it("should render link to full coverage report", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Not found"));
    
    render(
      <MemoryRouter>
        <OrganizationProvider>
          <TestDashboard />
        </OrganizationProvider>
      </MemoryRouter>
    );
    
    // Wait for the organization provider to finish loading
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /Ver relatório de cobertura HTML completo/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/coverage/index.html");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });
});
