import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ApplyTemplateModal from "@/components/templates/ApplyTemplateModal";

/**
 * Tests for ApplyTemplateModal Placeholder Component
 * 
 * This component is a placeholder that requires the ai_document_templates table.
 * These tests verify the placeholder renders correctly and shows appropriate messaging.
 */
describe("ApplyTemplateModal Component (Placeholder)", () => {
  it("should render the trigger button", () => {
    const onApply = () => {};
    render(<ApplyTemplateModal onApply={onApply} />);
    
    expect(screen.getByRole("button", { name: /Aplicar Template/i })).toBeInTheDocument();
  });

  it("should open modal when trigger button is clicked", async () => {
    const onApply = () => {};
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText("Aplicar Template")).toBeInTheDocument();
    });
  });

  it("should show unavailable feature message in modal", async () => {
    const onApply = () => {};
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Recurso Indisponível/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ai_document_templates/i).length).toBeGreaterThan(0);
    });
  });

  it("should show instructions for enabling the feature", async () => {
    const onApply = () => {};
    render(<ApplyTemplateModal onApply={onApply} />);
    
    const triggerButton = screen.getByRole("button", { name: /Aplicar Template/i });
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Criar a migração da tabela ai_document_templates/i)).toBeInTheDocument();
      expect(screen.getByText(/supabase gen types/i)).toBeInTheDocument();
    });
  });
});
