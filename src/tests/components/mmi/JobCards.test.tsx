import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JobCards from "@/components/mmi/JobCards";

describe("JobCards Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<JobCards />);
    expect(container).toBeTruthy();
  });

  it("displays job cards with correct structure", async () => {
    render(<JobCards />);
    
    // Wait for the component to render with mock data
    await waitFor(() => {
      const jobTitles = screen.queryAllByRole("heading", { level: 3 });
      expect(jobTitles.length).toBeGreaterThan(0);
    });
  });

  it("shows job component information", async () => {
    const { container } = render(<JobCards />);
    
    await waitFor(() => {
      // Check if the component renders the text "Componente:"
      expect(container.textContent).toContain("Componente:");
    });
  });

  it("displays priority and status information", async () => {
    const { container } = render(<JobCards />);
    
    await waitFor(() => {
      expect(container.textContent).toContain("Prioridade:");
      expect(container.textContent).toContain("Status:");
    });
  });

  it("shows AI suggestion when available", async () => {
    const { container } = render(<JobCards />);
    
    await waitFor(() => {
      expect(container.textContent).toContain("💡 Sugestão IA");
    });
  });

  it("displays action buttons", async () => {
    render(<JobCards />);
    
    await waitFor(() => {
      const detailsButtons = screen.queryAllByText("Ver detalhes");
      const executeButtons = screen.queryAllByText("Executar Job");
      expect(detailsButtons.length).toBeGreaterThan(0);
      expect(executeButtons.length).toBeGreaterThan(0);
    });
  });
});
