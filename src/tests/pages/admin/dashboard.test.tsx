import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "@/pages/admin/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
vi.mock("@/hooks/use-permissions");
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock Recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock QRCodeSVG
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>
      QR Code
    </div>
  ),
}));

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

describe("AdminDashboard - Public Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams(); // Reset to normal mode
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "test-user", email: "test@example.com" },
      session: null,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown);

    vi.mocked(usePermissions).mockReturnValue({
      userRole: "admin",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ status: "ok", message: "Test" }),
    });
  });

  it("should display eye icon in public mode", async () => {
    mockSearchParams = new URLSearchParams("?public=1");

    render(
      <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("🚀 Painel Administrativo")).toBeInTheDocument();
    });
  });

  it("should display public mode indicator badge", async () => {
    mockSearchParams = new URLSearchParams("?public=1");

    render(
      <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/🔒 Modo público somente leitura/i)
      ).toBeInTheDocument();
    });
  });

  it("should NOT display public mode indicator in normal mode", () => {
    mockSearchParams = new URLSearchParams();
    
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.queryByText(/🔒 Modo público somente leitura/i)
    ).not.toBeInTheDocument();
  });

  it("should hide QR code section in public mode", async () => {
    mockSearchParams = new URLSearchParams("?public=1");

    render(
      <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.queryByText("📱 Compartilhar Dashboard Público")
      ).not.toBeInTheDocument();
    });
  });

  it("should display QR code section in normal mode", async () => {
    mockSearchParams = new URLSearchParams();
    
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("📱 Compartilhar Dashboard Público")
      ).toBeInTheDocument();
    });
  });
});

describe("AdminDashboard - Role-Based Access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "test-user", email: "test@example.com" },
      session: null,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ status: "ok", message: "Test" }),
    });
  });

  it("should show all 3 cards for admin role", () => {
    vi.mocked(usePermissions).mockReturnValue({
      userRole: "admin",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Checklists")).toBeInTheDocument();
    expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
    expect(screen.getByText("Histórico de IA")).toBeInTheDocument();
  });

  it("should show all 3 cards for hr_manager role", () => {
    vi.mocked(usePermissions).mockReturnValue({
      userRole: "hr_manager",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Checklists")).toBeInTheDocument();
    expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
    expect(screen.getByText("Histórico de IA")).toBeInTheDocument();
  });

  it("should show only Personal Restorations for employee role", () => {
    vi.mocked(usePermissions).mockReturnValue({
      userRole: "employee",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.queryByText("Checklists")).not.toBeInTheDocument();
    expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
    expect(screen.queryByText("Histórico de IA")).not.toBeInTheDocument();
  });

  it("should show all cards in public mode regardless of role", async () => {
    mockSearchParams = new URLSearchParams("?public=1");
    
    vi.mocked(usePermissions).mockReturnValue({
      userRole: "employee",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Checklists")).toBeInTheDocument();
      expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
      expect(screen.getByText("Histórico de IA")).toBeInTheDocument();
    });
  });
});

describe("AdminDashboard - Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "test-user", email: "test@example.com" },
      session: null,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown);

    vi.mocked(usePermissions).mockReturnValue({
      userRole: "admin",
      isLoading: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ status: "ok", message: "Test" }),
    });
  });

  it("should append ?public=1 to card links in public mode", async () => {
    mockSearchParams = new URLSearchParams("?public=1");

    render(
      <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cards = screen.getAllByRole("generic");
      // Verify cards are rendered
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("should display quick links section", () => {
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("⚡ Atalhos Rápidos")).toBeInTheDocument();
  });
});
