import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestoreReportLogsPage from "@/pages/admin/reports/logs";

/**
 * RestoreReportLogsPage Tests
 * 
 * Tests the disabled state of the Restore Report Logs page.
 * Component is disabled because the required database table doesn't exist yet.
 */
describe("RestoreReportLogsPage Component", () => {
  it("should render the page title", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Logs de Relatórios")).toBeInTheDocument();
  });

  it("should render back button", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("← Voltar")).toBeInTheDocument();
  });

  it("should display database configuration warning", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Component shows a configuration warning instead of loading data
    expect(screen.getByText((content) =>
      content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
    )).toBeInTheDocument();
  });

  it("should render alert with specific table message", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Check that the alert mentions the specific table name
    expect(screen.getByText((content) =>
      content.includes("restore_report_logs")
    )).toBeInTheDocument();
  });

  it("should render alert icon", () => {
    render(
      <MemoryRouter>
        <RestoreReportLogsPage />
      </MemoryRouter>
    );

    // Verify alert component is rendered
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
