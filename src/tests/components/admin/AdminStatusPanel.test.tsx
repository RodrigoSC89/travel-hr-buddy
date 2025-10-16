import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminStatusPanel from "@/components/admin/AdminStatusPanel";

describe("AdminStatusPanel", () => {
  it("should render all 13 modules", () => {
    render(<AdminStatusPanel />);

    // Check for all module names
    expect(screen.getByText("Autenticação & Roles")).toBeDefined();
    expect(screen.getByText("Documentos com IA")).toBeDefined();
    expect(screen.getByText("Checklists Inteligentes")).toBeDefined();
    expect(screen.getByText("Assistente IA")).toBeDefined();
    expect(screen.getByText("Dashboard & Relatórios")).toBeDefined();
    expect(screen.getByText("Logs & Restauração")).toBeDefined();
    expect(screen.getByText("Smart Workflow")).toBeDefined();
    expect(screen.getByText("Templates com IA")).toBeDefined();
    expect(screen.getByText("Forecast (Previsão IA)")).toBeDefined();
    expect(screen.getByText("MMI - Manutenção Inteligente")).toBeDefined();
    expect(screen.getByText("Centro de Inteligência DP")).toBeDefined();
    expect(screen.getByText("Auditoria Técnica FMEA")).toBeDefined();
    expect(screen.getByText("PEO-DP Inteligente")).toBeDefined();
  });

  it("should render different status badges", () => {
    render(<AdminStatusPanel />);

    // Check for status badges
    const funcionalBadges = screen.getAllByText("Funcional");
    expect(funcionalBadges.length).toBe(6); // 6 modules with "ok" status

    const parcialBadges = screen.getAllByText("Parcial");
    expect(parcialBadges.length).toBe(3); // 3 modules with "partial" status

    const erroBadge = screen.getByText("Erro 404");
    expect(erroBadge).toBeDefined(); // 1 module with "error" status

    const planejadoBadges = screen.getAllByText("Planejado");
    expect(planejadoBadges.length).toBe(3); // 3 modules with "pending" status
  });

  it("should render module cards with proper styling", () => {
    const { container } = render(<AdminStatusPanel />);

    // Check that cards are rendered
    const cards = container.querySelectorAll(".border.shadow-md");
    expect(cards.length).toBe(13);
  });
});
