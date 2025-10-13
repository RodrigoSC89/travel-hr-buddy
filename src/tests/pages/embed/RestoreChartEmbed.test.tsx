import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreChartEmbed from "@/pages/embed/RestoreChartEmbed";

/**
 * RestoreChartEmbed Tests
 * 
 * Tests the disabled state of the Restore Chart Embed component.
 * Component is disabled because required database schema doesn't exist yet.
 */
describe("RestoreChartEmbed Component", () => {
  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Component shows a configuration warning instead of loading data
    expect(screen.getByText((content) => 
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });

  it("should render alert with configuration message", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Check that the alert description is present
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });

  it("should render alert icon", () => {
    render(
      <MemoryRouter>
        <RestoreChartEmbed />
      </MemoryRouter>
    );

    // Verify alert component is rendered
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
