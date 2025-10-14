import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "@/pages/admin/dashboard";

/**
 * AdminDashboard Tests
 * 
 * Tests the Admin Dashboard page functionality with:
 * - Public mode detection and display
 * - Role-based card visibility
 * - Combined public mode + role filtering
 */

// Mock fetch for cron status
global.fetch = vi.fn();

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth()
}));

// Mock usePermissions hook
const mockUsePermissions = vi.fn();
vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => mockUsePermissions()
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for cron status
    (global.fetch as typeof fetch).mockResolvedValue({
      headers: {
        get: () => "application/json"
      },
      json: async () => ({
        status: "ok",
        message: "Cron diário executado com sucesso nas últimas 24h"
      })
    } as Response);

    // Default auth mock
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "admin@test.com" }
    });
  });

  describe("Public Mode Functionality", () => {
    it("should display eye icon in title when in public mode", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading.textContent).toContain("Painel Administrativo");
      });

      // Eye icon should be present (as SVG element)
      const svgElements = document.querySelectorAll("svg");
      const hasEyeIcon = Array.from(svgElements).some(
        svg => svg.parentElement?.tagName === "H1"
      );
      expect(hasEyeIcon).toBe(true);
    });

    it("should display public mode banner at bottom when ?public=1", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Modo público somente leitura/i)).toBeInTheDocument();
      });
    });

    it("should NOT display public mode indicator in normal mode", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toBeInTheDocument();
      });

      expect(screen.queryByText(/Modo público somente leitura/i)).not.toBeInTheDocument();
    });
  });

  describe("Role-Based Card Visibility", () => {
    it("should show all 6 cards for admin role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Checklists")).toBeInTheDocument();
        expect(screen.getByText("Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
        expect(screen.getByText("Analytics")).toBeInTheDocument();
        expect(screen.getByText("Configurações")).toBeInTheDocument();
        expect(screen.getByText("Gestão de Usuários")).toBeInTheDocument();
      });
    });

    it("should show 3 cards for manager role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "manager",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Should see these 3 cards
        expect(screen.getByText("Checklists")).toBeInTheDocument();
        expect(screen.getByText("Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
      });

      // Should NOT see these cards
      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
      expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
      expect(screen.queryByText("Gestão de Usuários")).not.toBeInTheDocument();
    });

    it("should show 3 cards for hr_manager role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "hr_manager",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Checklists")).toBeInTheDocument();
        expect(screen.getByText("Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
      });

      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
      expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
      expect(screen.queryByText("Gestão de Usuários")).not.toBeInTheDocument();
    });

    it("should show only 1 card for employee role", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
      });

      // Should NOT see other cards
      expect(screen.queryByText("Checklists")).not.toBeInTheDocument();
      expect(screen.queryByText("Assistente IA")).not.toBeInTheDocument();
      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
      expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
      expect(screen.queryByText("Gestão de Usuários")).not.toBeInTheDocument();
    });
  });

  describe("Combined Public Mode + Role-Based Access", () => {
    it("should respect role-based access in public mode for admin", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Admin should see all cards even in public mode
        expect(screen.getByText("Checklists")).toBeInTheDocument();
        expect(screen.getByText("Analytics")).toBeInTheDocument();
        expect(screen.getByText("Gestão de Usuários")).toBeInTheDocument();
        // Public banner should be visible
        expect(screen.getByText(/Modo público somente leitura/i)).toBeInTheDocument();
      });
    });

    it("should respect role-based access in public mode for manager", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "manager",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Manager should see only their 3 cards in public mode
        expect(screen.getByText("Checklists")).toBeInTheDocument();
        expect(screen.getByText("Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
        // Public banner should be visible
        expect(screen.getByText(/Modo público somente leitura/i)).toBeInTheDocument();
      });

      // Should NOT see admin-only cards
      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
      expect(screen.queryByText("Gestão de Usuários")).not.toBeInTheDocument();
    });

    it("should respect role-based access in public mode for employee", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard?public=1"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Employee should see only their 1 card in public mode
        expect(screen.getByText("Restaurações Pessoais")).toBeInTheDocument();
        // Public banner should be visible
        expect(screen.getByText(/Modo público somente leitura/i)).toBeInTheDocument();
      });

      // Should NOT see other cards
      expect(screen.queryByText("Checklists")).not.toBeInTheDocument();
      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    });
  });

  describe("Cron Status Display", () => {
    it("should display cron status badge when status is available", async () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        isLoading: false,
        hasPermission: () => true
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <AdminDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Cron diário executado com sucesso/i)).toBeInTheDocument();
      });
    });
  });
});
