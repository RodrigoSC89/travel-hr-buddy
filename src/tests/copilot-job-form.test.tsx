import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobFormWithExamples from "@/components/copilot/JobFormWithExamples";
import "@testing-library/jest-dom";

// Mock the dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/copilot/SimilarExamples", () => ({
  default: ({ input, onSelect }: { input: string; onSelect?: (text: string) => void }) => (
    <div data-testid="similar-examples">
      <span data-testid="similar-examples-input">{input}</span>
      <button
        data-testid="select-example-btn"
        onClick={() => onSelect?.("Example suggestion from AI")}
      >
        Use Example
      </button>
    </div>
  ),
}));

describe("JobFormWithExamples", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with all required fields", () => {
    render(<JobFormWithExamples />);

    expect(screen.getByLabelText(/componente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar job/i })).toBeInTheDocument();
  });

  it("should display component and description inputs", () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByPlaceholderText(/603.0004.02/i);
    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i);

    expect(componentInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });

  it("should update component input value on change", async () => {
    render(<JobFormWithExamples />);

    const componentInput = screen.getByPlaceholderText(/603.0004.02/i) as HTMLInputElement;
    
    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });

    await waitFor(() => {
      expect(componentInput.value).toBe("603.0004.02");
    });
  });

  it("should update description input value on change", async () => {
    render(<JobFormWithExamples />);

    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i) as HTMLTextAreaElement;
    
    fireEvent.change(descriptionInput, { target: { value: "Generator failure" } });

    await waitFor(() => {
      expect(descriptionInput.value).toBe("Generator failure");
    });
  });

  it("should call onSubmit when form is submitted with valid data", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<JobFormWithExamples onSubmit={mockOnSubmit} />);

    const componentInput = screen.getByPlaceholderText(/603.0004.02/i);
    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i);
    const submitButton = screen.getByRole("button", { name: /criar job/i });

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Generator with noise" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        component: "603.0004.02",
        description: "Generator with noise",
      });
    });
  });

  it("should display submit button as disabled while submitting", async () => {
    const mockOnSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<JobFormWithExamples onSubmit={mockOnSubmit} />);

    const componentInput = screen.getByPlaceholderText(/603.0004.02/i);
    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i);
    const submitButton = screen.getByRole("button", { name: /criar job/i });

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Generator with noise" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("should render SimilarExamples component", () => {
    render(<JobFormWithExamples />);

    expect(screen.getByTestId("similar-examples")).toBeInTheDocument();
  });

  it("should pass input to SimilarExamples component", async () => {
    render(<JobFormWithExamples />);

    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i);
    
    fireEvent.change(descriptionInput, { target: { value: "Test description" } });

    await waitFor(() => {
      const similarExamplesInput = screen.getByTestId("similar-examples-input");
      expect(similarExamplesInput.textContent).toBe("Test description");
    });
  });

  it("should update description when example is selected", async () => {
    render(<JobFormWithExamples />);

    const selectExampleBtn = screen.getByTestId("select-example-btn");
    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i) as HTMLTextAreaElement;

    fireEvent.click(selectExampleBtn);

    await waitFor(() => {
      expect(descriptionInput.value).toBe("Example suggestion from AI");
    });
  });

  it("should clear form after successful submission", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<JobFormWithExamples onSubmit={mockOnSubmit} />);

    const componentInput = screen.getByPlaceholderText(/603.0004.02/i) as HTMLInputElement;
    const descriptionInput = screen.getByPlaceholderText(/descreva o problema/i) as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /criar job/i });

    fireEvent.change(componentInput, { target: { value: "603.0004.02" } });
    fireEvent.change(descriptionInput, { target: { value: "Generator with noise" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(componentInput.value).toBe("");
      expect(descriptionInput.value).toBe("");
    });
  });

  it("should have proper structure with cards", () => {
    render(<JobFormWithExamples />);

    expect(screen.getByText(/criar novo job de manutenção/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /exemplos similares/i })).toBeInTheDocument();
  });
});
