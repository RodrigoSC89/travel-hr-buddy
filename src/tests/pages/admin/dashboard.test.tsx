import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "@/pages/admin/dashboard";

/**
 * AdminDashboard Tests
 * 
 * Tests the Admin Dashboard with public mode and role-based access functionality.
 */

// Mock usePermissions hook
const mockUsePermissions = vi.fn();
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => mockUsePermissions()
}));

// Mock useAuth hook
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id", email: "test@example.com" }
  }))
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

// Mock fetch for cron status
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      status: "ok",
      message: "Cron diário executado com sucesso nas últimas 24h"
    }),
    headers: {
      get: () => "application/json"
    }
  } as Response)
);

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for admin user
    mockUsePermissions.mockReturnValue({
      userRole: "admin",
      permissions: [],
      isLoading: false,
      hasPermission: () => true,
      canAccessModule: () => true,
      getRoleDisplayName: () => "Administrador"
    });
  });

  describe("Public Mode Functionality", () => {
    it("should show Eye icon in title when in public mode", async () => {
      const { container } = render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        const title = screen.getByText(/Painel Administrativo/);
        expect(title).toBeInTheDocument();
        // Eye icon should be inline with the title
        const eyeIcon = container.querySelector(".lucide-eye");
        expect(eyeIcon).toBeInTheDocument();
      });
    });

    it("should display public mode indicator in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("🔒 Modo público somente leitura")).toBeInTheDocument();
      });
    });

    it("should not display public mode indicator in normal mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("🔒 Modo público somente leitura")).not.toBeInTheDocument();
      });
    });

    it("should still display cron status in public mode", async () => {
      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Cron diário executado com sucesso/)).toBeInTheDocument();
      });
    });
  });

  describe("Role-Based Access Functionality", () => {
    it("should show all cards for admin role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        permissions: [],
        isLoading: false,
        hasPermission: () => true,
        canAccessModule: () => true,
        getRoleDisplayName: () => "Administrador"
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Admin should see all cards
        expect(screen.getByText("📋 Checklists")).toBeInTheDocument();
        expect(screen.getByText("💬 Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("🔄 Restaurações Pessoais")).toBeInTheDocument();
        expect(screen.getByText("📊 Analytics")).toBeInTheDocument();
        expect(screen.getByText("⚙️ System Settings")).toBeInTheDocument();
        expect(screen.getByText("👥 User Management")).toBeInTheDocument();
      });
    });

    it("should show limited cards for manager role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "manager",
        permissions: [],
        isLoading: false,
        hasPermission: () => false,
        canAccessModule: () => false,
        getRoleDisplayName: () => "Gerente"
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Manager should see checklists, IA, and personal restorations
        expect(screen.getByText("📋 Checklists")).toBeInTheDocument();
        expect(screen.getByText("💬 Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("🔄 Restaurações Pessoais")).toBeInTheDocument();
        
        // Manager should NOT see admin-only cards
        expect(screen.queryByText("📊 Analytics")).not.toBeInTheDocument();
        expect(screen.queryByText("⚙️ System Settings")).not.toBeInTheDocument();
        expect(screen.queryByText("👥 User Management")).not.toBeInTheDocument();
      });
    });

    it("should show only personal restorations for employee role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        permissions: [],
        isLoading: false,
        hasPermission: () => false,
        canAccessModule: () => false,
        getRoleDisplayName: () => "Funcionário"
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Employee should only see personal restorations
        expect(screen.getByText("🔄 Restaurações Pessoais")).toBeInTheDocument();
        
        // Employee should NOT see role-restricted cards
        expect(screen.queryByText("📋 Checklists")).not.toBeInTheDocument();
        expect(screen.queryByText("💬 Assistente IA")).not.toBeInTheDocument();
        expect(screen.queryByText("📊 Analytics")).not.toBeInTheDocument();
        expect(screen.queryByText("⚙️ System Settings")).not.toBeInTheDocument();
        expect(screen.queryByText("👥 User Management")).not.toBeInTheDocument();
      });
    });

    it("should show cards for hr_manager role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "hr_manager",
        permissions: [],
        isLoading: false,
        hasPermission: () => false,
        canAccessModule: () => false,
        getRoleDisplayName: () => "Gerente de RH"
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // HR Manager should see checklists, IA, and personal restorations
        expect(screen.getByText("📋 Checklists")).toBeInTheDocument();
        expect(screen.getByText("💬 Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("🔄 Restaurações Pessoais")).toBeInTheDocument();
        
        // HR Manager should NOT see admin-only cards
        expect(screen.queryByText("📊 Analytics")).not.toBeInTheDocument();
        expect(screen.queryByText("⚙️ System Settings")).not.toBeInTheDocument();
        expect(screen.queryByText("👥 User Management")).not.toBeInTheDocument();
      });
    });
  });

  describe("Combined Public Mode and Role-Based Access", () => {
    it("should respect role-based access even in public mode", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        permissions: [],
        isLoading: false,
        hasPermission: () => false,
        canAccessModule: () => false,
        getRoleDisplayName: () => "Funcionário"
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Employee should still only see personal restorations in public mode
        expect(screen.getByText("🔄 Restaurações Pessoais")).toBeInTheDocument();
        expect(screen.getByText("🔒 Modo público somente leitura")).toBeInTheDocument();
        
        // Should not see role-restricted cards
        expect(screen.queryByText("📋 Checklists")).not.toBeInTheDocument();
        expect(screen.queryByText("💬 Assistente IA")).not.toBeInTheDocument();
      });
    });
  });
});
