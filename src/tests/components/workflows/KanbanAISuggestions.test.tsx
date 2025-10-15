import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanAISuggestions } from "@/components/workflows/KanbanAISuggestions";

describe("KanbanAISuggestions Component", () => {
  const mockSuggestions = [
    {
      etapa: "Análise de Requisitos",
      tipo_sugestao: "Melhoria de Processo",
      conteudo: "Adicionar reunião de kick-off",
      criticidade: "Alta",
      responsavel_sugerido: "João Silva",
    },
    {
      etapa: "Desenvolvimento",
      tipo_sugestao: "Checklist Técnico",
      conteudo: "Incluir code review obrigatório",
      criticidade: "Média",
      responsavel_sugerido: "Maria Santos",
    },
  ];

  it("should render the component title", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    expect(screen.getByText("🤖 Sugestões da IA para este workflow")).toBeInTheDocument();
  });

  it("should render all suggestions", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    expect(screen.getByText("Análise de Requisitos")).toBeInTheDocument();
    expect(screen.getByText("Desenvolvimento")).toBeInTheDocument();
  });

  it("should display all suggestion fields with emoji indicators", () => {
    render(<KanbanAISuggestions suggestions={[mockSuggestions[0]]} />);
    
    expect(screen.getByText(/🧩 Etapa:/)).toBeInTheDocument();
    expect(screen.getByText(/📌 Tipo:/)).toBeInTheDocument();
    expect(screen.getByText(/💬 Conteúdo:/)).toBeInTheDocument();
    expect(screen.getByText(/🔥 Criticidade:/)).toBeInTheDocument();
    expect(screen.getByText(/👤 Responsável:/)).toBeInTheDocument();
  });

  it("should display suggestion details correctly", () => {
    render(<KanbanAISuggestions suggestions={[mockSuggestions[0]]} />);
    
    expect(screen.getByText("Análise de Requisitos")).toBeInTheDocument();
    expect(screen.getByText("Melhoria de Processo")).toBeInTheDocument();
    expect(screen.getByText("Adicionar reunião de kick-off")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("should show accept button for non-accepted suggestions", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const acceptButtons = screen.getAllByText("✅ Aceitar sugestão");
    expect(acceptButtons).toHaveLength(2);
  });

  it("should apply opacity-50 class when suggestion is accepted", () => {
    const { container } = render(<KanbanAISuggestions suggestions={[mockSuggestions[0]]} />);
    const acceptButton = screen.getByText("✅ Aceitar sugestão");
    
    // Click accept button
    fireEvent.click(acceptButton);
    
    // Check if card has opacity-50 class
    const card = container.querySelector(".opacity-50");
    expect(card).toBeInTheDocument();
  });

  it("should hide accept button after accepting suggestion", () => {
    render(<KanbanAISuggestions suggestions={[mockSuggestions[0]]} />);
    const acceptButton = screen.getByText("✅ Aceitar sugestão");
    
    // Click accept button
    fireEvent.click(acceptButton);
    
    // Button should no longer be in the document
    expect(screen.queryByText("✅ Aceitar sugestão")).not.toBeInTheDocument();
  });

  it("should handle multiple accepts independently", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const acceptButtons = screen.getAllByText("✅ Aceitar sugestão");
    
    // Accept first suggestion
    fireEvent.click(acceptButtons[0]);
    
    // First should be hidden, second should still be visible
    expect(screen.getAllByText("✅ Aceitar sugestão")).toHaveLength(1);
  });

  it("should render empty list when no suggestions provided", () => {
    render(<KanbanAISuggestions suggestions={[]} />);
    expect(screen.getByText("🤖 Sugestões da IA para este workflow")).toBeInTheDocument();
    expect(screen.queryByText("✅ Aceitar sugestão")).not.toBeInTheDocument();
  });

  it("should add suggestions to accepted list when accept is clicked", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const acceptButtons = screen.getAllByText("✅ Aceitar sugestão");
    
    // Accept both suggestions
    fireEvent.click(acceptButtons[0]);
    fireEvent.click(acceptButtons[1]);
    
    // All accept buttons should be gone
    expect(screen.queryByText("✅ Aceitar sugestão")).not.toBeInTheDocument();
  });

  it("should maintain accepted state across re-renders", () => {
    const { rerender } = render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const acceptButton = screen.getAllByText("✅ Aceitar sugestão")[0];
    
    // Accept first suggestion
    fireEvent.click(acceptButton);
    
    // Re-render with same props
    rerender(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    // First suggestion should still be accepted
    expect(screen.getAllByText("✅ Aceitar sugestão")).toHaveLength(1);
  });
});
