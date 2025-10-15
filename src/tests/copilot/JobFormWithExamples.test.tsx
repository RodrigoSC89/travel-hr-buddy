import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobFormWithExamples from "@/components/copilot/JobFormWithExamples";

describe("JobFormWithExamples Component", () => {
  it("should render the component title", () => {
    render(<JobFormWithExamples />);
    expect(screen.getByText(/Criar Job com IA/i)).toBeDefined();
  });

  it("should render the component input field", () => {
    render(<JobFormWithExamples />);
    const componentInput = screen.getByPlaceholderText(/Componente/i);
    expect(componentInput).toBeDefined();
  });

  it("should render the description textarea", () => {
    render(<JobFormWithExamples />);
    const descriptionTextarea = screen.getByPlaceholderText(/Descreva o problema/i);
    expect(descriptionTextarea).toBeDefined();
  });

  it("should render the submit button", () => {
    render(<JobFormWithExamples />);
    const submitButton = screen.getByRole("button", { name: /Criar Job/i });
    expect(submitButton).toBeDefined();
  });

  it("should render the component without errors", () => {
    const { container } = render(<JobFormWithExamples />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
