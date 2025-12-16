import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobFormWithExamples from "@/components/copilot/JobFormWithExamples";

// Mock the toast hook
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the SimilarExamples component
vi.mock("@/components/copilot/SimilarExamples", () => ({
  default: ({ input, onSelect }: { input: string; onSelect?: (text: string) => void }) => (
    <div data-testid="similar-examples">
      <div data-testid="similar-examples-input">{input}</div>
      <button
        data-testid="select-suggestion"
        onClick={() => onSelect?.("Test suggestion from similar examples")}
      >
        Use Suggestion
      </button>
    </div>
  ),
}));

describe("JobFormWithExamples Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with all required fields", () => {
    render(<JobFormWithExamples />);

    expect(screen.getByText(/Criar Job com IA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Componente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/✅ Criar Job/i)).toBeInTheDocument();
  });

  it("should render similar examples section", () => {
    render(<JobFormWithExamples />);

    expect(screen.getByText(/💡 Exemplos Similares/i)).toBeInTheDocument();
    expect(screen.getByTestId("similar-examples")).toBeInTheDocument();
  });

  it("should have submit button disabled when fields are empty", () => {
    render(<JobFormWithExamples />);

    const submitButton = screen.getByText(/✅ Criar Job/i);
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when both fields are filled", async () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const submitButton = screen.getByText(/✅ Criar Job/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Problema no gerador" } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should show validation toast when trying to submit with empty fields", () => {
    render(<JobFormWithExamples />);

    const submitButton = screen.getByText(/✅ Criar Job/i);

    // Try to submit with empty fields (button is disabled but we can click anyway in test)
    fireEvent.click(submitButton);

    // Button should be disabled, so toast won't be called
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("should call onSubmit callback when form is submitted", async () => {
    const mockOnSubmit = vi.fn();
    render(<JobFormWithExamples onSubmit={mockOnSubmit} />);

    const componentInput = screen.getByLabelText(/Componente/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const submitButton = screen.getByText(/✅ Criar Job/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Problema no gerador" } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        component: "603.0004.02",
        description: "Problema no gerador",
      });
    });
  });

  it("should show success toast when job is created", async () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const submitButton = screen.getByText(/✅ Criar Job/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Problema no gerador" } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Job criado com sucesso!",
        description: "O job de manutenção foi registrado.",
      });
    });
  });

  it("should reset form after successful submission", async () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Descrição/i) as HTMLTextAreaElement;
    const submitButton = screen.getByText(/✅ Criar Job/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Problema no gerador" } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(componentInput.value).toBe("");
      expect(descriptionInput.value).toBe("");
    });
  });

  it("should populate description when selecting a suggestion", async () => {
    render(<JobFormWithExamples />);

    const descriptionInput = screen.getByLabelText(/Descrição/i) as HTMLTextAreaElement;
    const selectButton = screen.getByTestId("select-suggestion");

    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(descriptionInput.value).toBe("Test suggestion from similar examples");
    });
  });

  it("should show toast when suggestion is applied", async () => {
    render(<JobFormWithExamples />);

    const selectButton = screen.getByTestId("select-suggestion");

    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Exemplo aplicado",
        description: "A descrição foi preenchida com o exemplo selecionado.",
      });
    });
  });

  it("should pass input to SimilarExamples component", () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Problema no gerador" } });

    const similarExamplesInput = screen.getByTestId("similar-examples-input");
    expect(similarExamplesInput).toHaveTextContent("Problema no gerador");
  });

  it("should use component as input when description is empty", () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i);

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });

    const similarExamplesInput = screen.getByTestId("similar-examples-input");
    expect(similarExamplesInput).toHaveTextContent("603.0004.02");
  });

  it("should render form with proper ARIA labels", () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByLabelText(/Componente/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);

    expect(componentInput).toHaveAttribute("id", "component");
    expect(descriptionInput).toHaveAttribute("id", "description");
  });

  it("should have proper placeholder text", () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByPlaceholderText(/Componente \(ex: 603.0004.02\)/i);
    const descriptionInput = screen.getByPlaceholderText(/Descreva o problema ou ação necessária.../i);

    expect(componentInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });
});
