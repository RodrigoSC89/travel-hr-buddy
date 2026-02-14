/**
 * Tests for AccessibilityProvider
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessibilityProvider, useAccessibility } from "@/components/AccessibilityProvider";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Test consumer component
function TestConsumer() {
  const { reducedMotion, highContrast, announce, skipToMain } = useAccessibility();
  return (
    <div>
      <span data-testid="reduced-motion">{String(reducedMotion)}</span>
      <span data-testid="high-contrast">{String(highContrast)}</span>
      <button onClick={() => announce("test message")}>Announce</button>
      <button onClick={skipToMain}>Skip</button>
    </div>
  );
}

describe("AccessibilityProvider", () => {
  it("renders children with skip link", () => {
    render(
      <AccessibilityProvider>
        <div data-testid="child">Content</div>
      </AccessibilityProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Pular para conteúdo principal")).toBeInTheDocument();
  });

  it("provides accessibility context values", () => {
    render(
      <AccessibilityProvider>
        <TestConsumer />
      </AccessibilityProvider>
    );
    expect(screen.getByTestId("reduced-motion")).toHaveTextContent("false");
    expect(screen.getByTestId("high-contrast")).toHaveTextContent("false");
  });

  it("throws when useAccessibility is used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAccessibility must be used within AccessibilityProvider"
    );
    consoleSpy.mockRestore();
  });
});
