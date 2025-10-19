import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SGSOAuditPage from "@/pages/SGSOAuditPage";

// Mock html2pdf.js
vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
  })),
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("SGSOAuditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", () => {
    renderWithRouter(<SGSOAuditPage />);
    expect(screen.getByText("🛡️ Auditoria SGSO - IBAMA")).toBeInTheDocument();
  });

  it("should render vessel selector", () => {
    renderWithRouter(<SGSOAuditPage />);
    expect(screen.getByText("Selecione a Embarcação")).toBeInTheDocument();
  });

  it("should render all 17 SGSO requirements", async () => {
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first to show requirements
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/1\. Política de SMS/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/17\. Melhoria Contínua/)[0]).toBeInTheDocument();
    });
  });

  it("should render export PDF button after vessel selection", async () => {
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    });
  });

  it("should render submit button after vessel selection", async () => {
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(screen.getByText("Enviar Auditoria SGSO")).toBeInTheDocument();
    });
  });

  it("should call html2pdf when export PDF button is clicked", async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });
    
    const exportButton = await screen.findByText("Exportar PDF");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(html2pdf).toHaveBeenCalled();
    });
  });

  it("should have hidden PDF container with correct id", () => {
    const { container } = renderWithRouter(<SGSOAuditPage />);
    const pdfContainer = container.querySelector("#sgso-audit-pdf");
    expect(pdfContainer).toBeInTheDocument();
    expect(pdfContainer).toHaveClass("hidden");
  });

  it("should update audit data when evidence is entered", async () => {
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });
    
    await waitFor(() => {
      const evidenceInputs = screen.getAllByPlaceholderText(/Descreva a evidência observada/);
      fireEvent.change(evidenceInputs[0], { target: { value: "Evidência teste" } });
      expect(evidenceInputs[0]).toHaveValue("Evidência teste");
    });
  });

  it("should update audit data when comment is entered", async () => {
    renderWithRouter(<SGSOAuditPage />);
    
    // Select a vessel first
    const vesselSelect = screen.getByRole("combobox");
    fireEvent.click(vesselSelect);
    
    await waitFor(() => {
      const option = screen.getByText("PSV Atlântico");
      fireEvent.click(option);
    });
    
    await waitFor(() => {
      const commentInputs = screen.getAllByPlaceholderText(/Adicione comentários/);
      fireEvent.change(commentInputs[0], { target: { value: "Comentário teste" } });
      expect(commentInputs[0]).toHaveValue("Comentário teste");
    });
  });
});
