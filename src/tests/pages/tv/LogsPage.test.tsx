import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TVWallLogsPage from "@/pages/tv/LogsPage";

/**
 * TVWallLogsPage Tests
 * 
 * Tests the disabled state of the TV Wall Logs page.
 * Component is disabled because required database schema doesn't exist yet.
 */
describe("TVWallLogsPage Component", () => {
  it("should render TV Wall title", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("TV Wall - Logs")).toBeInTheDocument();
  });

  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
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
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Check that the alert description is present
    expect(screen.getByText(/Entre em contato com o administrador do sistema/i)).toBeInTheDocument();
  });

  it("should render alert icon", () => {
    render(
      <MemoryRouter>
        <TVWallLogsPage />
      </MemoryRouter>
    );

    // Verify alert component is rendered
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
