import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin/dashboard";

/**
 * AdminDashboard Tests
 * 
 * Tests the Admin Dashboard with:
 * 1. Public mode functionality (Eye icon, banner display)
 * 2. Role-based card visibility (admin, manager, employee)
 * 3. Combined features (public mode respects role-based access)
 */

// Mock fetch for cron status
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    headers: {
      get: () => "application/json",
    },
    json: () =>
      Promise.resolve({
        status: "ok",
        message: "Cron diário executado com sucesso nas últimas 24h",
      }),
  } as Response)
);

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Store current test role
let currentTestRole: string | null = null;

// Mock RoleBasedAccess with role checking
vi.mock("@/components/auth/role-based-access", () => ({
  RoleBasedAccess: ({ children, roles, showFallback }: { 
    children: React.ReactNode; 
    roles?: string[]; 
    showFallback?: boolean;
  }) => {
    // If no roles required or current role is in allowed roles, show children
    if (!roles || !currentTestRole || roles.includes(currentTestRole)) {
      return <>{children}</>;
    }
    // Otherwise, return null (or fallback if showFallback is true)
    return showFallback === false ? null : <div>Access Denied</div>;
  },
}));

function renderWithRouter(initialPath: string, userRole: string | null) {
  // Set the current test role
  currentTestRole = userRole;

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminDashboard Component - Public Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display Eye icon in title in public mode", async () => {
    renderWithRouter("/admin/dashboard?public=1", "admin");

    await waitFor(() => {
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeTruthy();
      // Eye icon should be present as an SVG
      const eyeIcon = title.querySelector("svg");
      expect(eyeIcon).toBeTruthy();
    });
  });

  it("should display public mode indicator banner in public mode", async () => {
    renderWithRouter("/admin/dashboard?public=1", "admin");

    await waitFor(() => {
      const banner = screen.getByText(/Modo público somente leitura/i);
      expect(banner).toBeTruthy();
    });
  });

  it("should NOT display Eye icon in normal mode", async () => {
    renderWithRouter("/admin/dashboard", "admin");

    await waitFor(() => {
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeTruthy();
      // Eye icon should not be present
      const eyeIcon = title.querySelector("svg");
      expect(eyeIcon).toBeFalsy();
    });
  });

  it("should NOT display public mode indicator in normal mode", async () => {
    renderWithRouter("/admin/dashboard", "admin");

    await waitFor(() => {
      const banner = screen.queryByText(/Modo público somente leitura/i);
      expect(banner).toBeFalsy();
    });
  });
});

describe("AdminDashboard Component - Role-Based Access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show all 6 cards for admin role", async () => {
    renderWithRouter("/admin/dashboard", "admin");

    await waitFor(() => {
      // Admin should see all 6 cards
      expect(screen.getByText("📋 Checklists")).toBeTruthy();
      expect(screen.getByText("🤖 Assistente IA")).toBeTruthy();
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();
      expect(screen.getByText("📊 Analytics")).toBeTruthy();
      expect(screen.getByText("⚙️ Configurações")).toBeTruthy();
      expect(screen.getByText("👥 Gerenciamento de Usuários")).toBeTruthy();
    });
  });

  it("should show 3 cards for manager role", async () => {
    renderWithRouter("/admin/dashboard", "manager");

    await waitFor(() => {
      // Manager should see 3 cards
      expect(screen.getByText("📋 Checklists")).toBeTruthy();
      expect(screen.getByText("🤖 Assistente IA")).toBeTruthy();
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();

      // Manager should NOT see admin-only cards
      expect(screen.queryByText("📊 Analytics")).toBeFalsy();
      expect(screen.queryByText("⚙️ Configurações")).toBeFalsy();
      expect(screen.queryByText("👥 Gerenciamento de Usuários")).toBeFalsy();
    });
  });

  it("should show 3 cards for hr_manager role", async () => {
    renderWithRouter("/admin/dashboard", "hr_manager");

    await waitFor(() => {
      // HR Manager should see 3 cards
      expect(screen.getByText("📋 Checklists")).toBeTruthy();
      expect(screen.getByText("🤖 Assistente IA")).toBeTruthy();
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();

      // HR Manager should NOT see admin-only cards
      expect(screen.queryByText("📊 Analytics")).toBeFalsy();
      expect(screen.queryByText("⚙️ Configurações")).toBeFalsy();
      expect(screen.queryByText("👥 Gerenciamento de Usuários")).toBeFalsy();
    });
  });

  it("should show only 1 card for employee role", async () => {
    renderWithRouter("/admin/dashboard", "employee");

    await waitFor(() => {
      // Employee should see only Personal Restorations
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();

      // Employee should NOT see other cards
      expect(screen.queryByText("📋 Checklists")).toBeFalsy();
      expect(screen.queryByText("🤖 Assistente IA")).toBeFalsy();
      expect(screen.queryByText("📊 Analytics")).toBeFalsy();
      expect(screen.queryByText("⚙️ Configurações")).toBeFalsy();
      expect(screen.queryByText("👥 Gerenciamento de Usuários")).toBeFalsy();
    });
  });
});

describe("AdminDashboard Component - Combined Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should respect role-based access in public mode for admin", async () => {
    renderWithRouter("/admin/dashboard?public=1", "admin");

    await waitFor(() => {
      // Public mode indicator should be present
      expect(screen.getByText(/Modo público somente leitura/i)).toBeTruthy();

      // Admin should still see all 6 cards in public mode
      expect(screen.getByText("📋 Checklists")).toBeTruthy();
      expect(screen.getByText("🤖 Assistente IA")).toBeTruthy();
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();
      expect(screen.getByText("📊 Analytics")).toBeTruthy();
      expect(screen.getByText("⚙️ Configurações")).toBeTruthy();
      expect(screen.getByText("👥 Gerenciamento de Usuários")).toBeTruthy();
    });
  });

  it("should respect role-based access in public mode for manager", async () => {
    renderWithRouter("/admin/dashboard?public=1", "manager");

    await waitFor(() => {
      // Public mode indicator should be present
      expect(screen.getByText(/Modo público somente leitura/i)).toBeTruthy();

      // Manager should see only 3 cards in public mode
      expect(screen.getByText("📋 Checklists")).toBeTruthy();
      expect(screen.getByText("🤖 Assistente IA")).toBeTruthy();
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();

      // Manager should NOT see admin-only cards even in public mode
      expect(screen.queryByText("📊 Analytics")).toBeFalsy();
      expect(screen.queryByText("⚙️ Configurações")).toBeFalsy();
      expect(screen.queryByText("👥 Gerenciamento de Usuários")).toBeFalsy();
    });
  });

  it("should respect role-based access in public mode for employee", async () => {
    renderWithRouter("/admin/dashboard?public=1", "employee");

    await waitFor(() => {
      // Public mode indicator should be present
      expect(screen.getByText(/Modo público somente leitura/i)).toBeTruthy();

      // Employee should see only Personal Restorations in public mode
      expect(screen.getByText("📄 Restaurações Pessoais")).toBeTruthy();

      // Employee should NOT see other cards even in public mode
      expect(screen.queryByText("📋 Checklists")).toBeFalsy();
      expect(screen.queryByText("🤖 Assistente IA")).toBeFalsy();
      expect(screen.queryByText("📊 Analytics")).toBeFalsy();
      expect(screen.queryByText("⚙️ Configurações")).toBeFalsy();
      expect(screen.queryByText("👥 Gerenciamento de Usuários")).toBeFalsy();
    });
  });
});
