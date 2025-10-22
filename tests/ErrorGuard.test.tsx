/**
 * ErrorGuard - Unit Tests
 * Validates error boundary functionality
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ErrorGuard } from "@/lib/core/ErrorGuard";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorGuard - Unit Tests", () => {
  it("deve renderizar children quando não há erro", () => {
    const { container } = render(
      <ErrorGuard>
        <div data-testid="child-component">Child Component</div>
      </ErrorGuard>
    );

    expect(container.textContent).toContain("Child Component");
  });

  it("deve capturar erro e exibir UI de fallback", () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorGuard>
        <ThrowError shouldThrow={true} />
      </ErrorGuard>
    );

    expect(container.textContent).toContain("Falha de módulo detectada");
    expect(container.textContent).toContain("O sistema detectou um erro no componente");

    consoleError.mockRestore();
  });

  it("deve exibir mensagem de erro no fallback UI", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorGuard>
        <ThrowError shouldThrow={true} />
      </ErrorGuard>
    );

    expect(container.textContent).toContain("Test error");

    consoleError.mockRestore();
  });

  it("deve ter botão de recarregar quando há erro", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorGuard>
        <ThrowError shouldThrow={true} />
      </ErrorGuard>
    );

    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain("Recarregar");

    consoleError.mockRestore();
  });

  it("deve manter estado de erro após captura", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container, rerender } = render(
      <ErrorGuard>
        <ThrowError shouldThrow={true} />
      </ErrorGuard>
    );

    expect(container.textContent).toContain("Falha de módulo detectada");

    // Re-render with different props but should still show error
    rerender(
      <ErrorGuard>
        <ThrowError shouldThrow={false} />
      </ErrorGuard>
    );

    expect(container.textContent).toContain("Falha de módulo detectada");

    consoleError.mockRestore();
  });

  it("valida getDerivedStateFromError retorna estado correto", () => {
    const testError = new Error("Test error");
    const state = ErrorGuard.getDerivedStateFromError(testError);

    expect(state).toEqual({
      hasError: true,
      error: testError,
    });
  });

  it("não deve afetar children quando não há erro", () => {
    const { container } = render(
      <ErrorGuard>
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      </ErrorGuard>
    );

    expect(container.querySelector("h1")).toBeTruthy();
    expect(container.querySelector("p")).toBeTruthy();
    expect(container.textContent).toContain("Title");
    expect(container.textContent).toContain("Content");
  });
});
