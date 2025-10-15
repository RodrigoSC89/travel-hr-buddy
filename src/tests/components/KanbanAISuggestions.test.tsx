import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanAISuggestions } from "@/components/workflows/KanbanAISuggestions";

describe("KanbanAISuggestions Component", () => {
  const mockSuggestions = [
    {
      etapa: "Planejamento",
      tipo_sugestao: "Melhoria",
      conteudo: "Adicionar reunião de kickoff",
      criticidade: "Alta",
      responsavel_sugerido: "João Silva",
    },
    {
      etapa: "Execução",
      tipo_sugestao: "Automação",
      conteudo: "Implementar envio automático de emails",
      criticidade: "Média",
      responsavel_sugerido: "Maria Santos",
    },
    {
      etapa: "Revisão",
      tipo_sugestao: "Processo",
      conteudo: "Criar checklist de validação",
      criticidade: "Baixa",
      responsavel_sugerido: "Pedro Costa",
    },
  ];

  it("should render the component with title", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    expect(screen.getByText(/Sugestões da IA para este workflow/i)).toBeInTheDocument();
  });

  it("should render all suggestions", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    expect(screen.getByText("Planejamento")).toBeInTheDocument();
    expect(screen.getByText("Execução")).toBeInTheDocument();
    expect(screen.getByText("Revisão")).toBeInTheDocument();
  });

  it("should display all suggestion fields", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    // Check etapa
    expect(screen.getByText("Planejamento")).toBeInTheDocument();
    
    // Check tipo_sugestao
    expect(screen.getByText("Melhoria")).toBeInTheDocument();
    
    // Check conteudo
    expect(screen.getByText("Adicionar reunião de kickoff")).toBeInTheDocument();
    
    // Check criticidade
    expect(screen.getByText("Alta")).toBeInTheDocument();
    
    // Check responsavel_sugerido
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("should render accept buttons for all suggestions initially", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const acceptButtons = screen.getAllByText(/Aceitar sugestão/i);
    expect(acceptButtons).toHaveLength(3);
  });

  it("should hide accept button and apply opacity when suggestion is accepted", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    const acceptButtons = screen.getAllByText(/Aceitar sugestão/i);
    const firstButton = acceptButtons[0];
    
    // Click the first accept button
    fireEvent.click(firstButton);
    
    // Button should no longer be visible for the accepted suggestion
    const remainingButtons = screen.getAllByText(/Aceitar sugestão/i);
    expect(remainingButtons).toHaveLength(2);
  });

  it("should apply opacity class to accepted suggestion card", () => {
    const { container } = render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    const acceptButtons = screen.getAllByText(/Aceitar sugestão/i);
    fireEvent.click(acceptButtons[0]);
    
    // Check that one card has the opacity-50 class
    const cards = container.querySelectorAll('.opacity-50');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("should handle multiple accepts", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    const acceptButtons = screen.getAllByText(/Aceitar sugestão/i);
    
    // Accept first two suggestions
    fireEvent.click(acceptButtons[0]);
    fireEvent.click(acceptButtons[1]);
    
    // Only one button should remain
    const remainingButtons = screen.getAllByText(/Aceitar sugestão/i);
    expect(remainingButtons).toHaveLength(1);
  });

  it("should render empty grid when no suggestions provided", () => {
    render(<KanbanAISuggestions suggestions={[]} />);
    expect(screen.getByText(/Sugestões da IA para este workflow/i)).toBeInTheDocument();
    expect(screen.queryByText(/Aceitar sugestão/i)).not.toBeInTheDocument();
  });

  it("should display emoji indicators in labels", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    // Check for emoji indicators in the rendered content
    const etapaLabels = screen.getAllByText(/🧩 Etapa:/);
    expect(etapaLabels.length).toBe(3); // One for each suggestion
    
    const tipoLabels = screen.getAllByText(/📌 Tipo:/);
    expect(tipoLabels.length).toBe(3);
    
    const conteudoLabels = screen.getAllByText(/💬 Conteúdo:/);
    expect(conteudoLabels.length).toBe(3);
    
    const criticidadeLabels = screen.getAllByText(/🔥 Criticidade:/);
    expect(criticidadeLabels.length).toBe(3);
    
    const responsavelLabels = screen.getAllByText(/👤 Responsável:/);
    expect(responsavelLabels.length).toBe(3);
  });

  it("should maintain state across multiple interactions", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    const acceptButtons = screen.getAllByText(/Aceitar sugestão/i);
    
    // Accept first suggestion
    fireEvent.click(acceptButtons[0]);
    let remainingButtons = screen.getAllByText(/Aceitar sugestão/i);
    expect(remainingButtons).toHaveLength(2);
    
    // Accept second suggestion
    fireEvent.click(remainingButtons[0]);
    remainingButtons = screen.getAllByText(/Aceitar sugestão/i);
    expect(remainingButtons).toHaveLength(1);
    
    // Accept third suggestion
    fireEvent.click(remainingButtons[0]);
    expect(screen.queryByText(/Aceitar sugestão/i)).not.toBeInTheDocument();
  });

  it("should render all three suggestions with correct criticidade values", () => {
    render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Média")).toBeInTheDocument();
    expect(screen.getByText("Baixa")).toBeInTheDocument();
  });

  it("should render suggestions in grid layout", () => {
    const { container } = render(<KanbanAISuggestions suggestions={mockSuggestions} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('gap-4');
  });
});
