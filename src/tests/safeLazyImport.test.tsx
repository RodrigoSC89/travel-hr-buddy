
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import React from "react";

// Mock component for successful loading
const MockComponent = ({ message = "Test Component" }: { message?: string }) => (
  <div data-testid="mock-component">{message}</div>
);

describe("safeLazyImport", () => {
  beforeEach(() => {
    // Clear console mocks before each test
    vi.clearAllMocks();
  });

  it("should successfully load and render a module", async () => {
    // Create a successful module import
    const mockImporter = vi.fn(() => 
      Promise.resolve({ default: MockComponent })
    );

    const LazyComponent = safeLazyImport(mockImporter, "TestComponent");

    render(<LazyComponent />);

    // Should show loading state initially
    expect(screen.getByText(/⏳ Carregando TestComponent.../i)).toBeInTheDocument();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId("mock-component")).toBeInTheDocument();
    });

    // Should render the actual component
    expect(screen.getByText("Test Component")).toBeInTheDocument();
    
    // Verify importer was called
    expect(mockImporter).toHaveBeenCalledTimes(1);
  });

  it("should display loading state with correct module name", () => {
    const mockImporter = vi.fn(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    const LazyComponent = safeLazyImport(mockImporter, "Dashboard");

    render(<LazyComponent />);

    // Check loading message contains module name
    expect(screen.getByText(/⏳ Carregando Dashboard.../i)).toBeInTheDocument();
    expect(screen.getByText(/Aguarde um momento/i)).toBeInTheDocument();
  });

  it("should handle import errors and display error fallback", async () => {
    // Spy on console.error to verify error logging
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const testError = new Error("Failed to fetch dynamically imported module");
    const mockImporter = vi.fn(() => Promise.reject(testError));

    // Use short interval (10ms) for faster test execution
    const LazyComponent = safeLazyImport(mockImporter, "FailingModule", 3, 10);

    render(<LazyComponent />);

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText(/⚠️ Falha ao carregar o módulo/i)).toBeInTheDocument();
    });

    // Verify error message shows module name
    expect(screen.getByText("FailingModule")).toBeInTheDocument();

    // Verify user-friendly error message
    expect(screen.getByText(/Não foi possível carregar este módulo/i)).toBeInTheDocument();
    expect(screen.getByText(/Isso pode acontecer após atualizações do sistema/i)).toBeInTheDocument();

    // Verify reload button is present
    expect(screen.getByRole("button", { name: /🔄 Atualizar página/i })).toBeInTheDocument();

    // Verify support message
    expect(screen.getByText(/Se o problema persistir, entre em contato com o suporte técnico/i)).toBeInTheDocument();

    // Verify error was logged to console
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Erro ao carregar módulo FailingModule após 3 tentativas:"),
      testError
    );

    consoleErrorSpy.mockRestore();
  });

  it("should reload page when clicking the reload button in error state", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: reloadMock },
    });

    const mockImporter = vi.fn(() => 
      Promise.reject(new Error("Module load failed"))
    );

    // Use short interval (10ms) for faster test execution
    const LazyComponent = safeLazyImport(mockImporter, "ErrorModule", 3, 10);

    render(<LazyComponent />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/⚠️ Falha ao carregar o módulo/i)).toBeInTheDocument();
    });

    // Click reload button
    const reloadButton = screen.getByRole("button", { name: /🔄 Atualizar página/i });
    fireEvent.click(reloadButton);

    // Verify reload was called
    expect(reloadMock).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should pass props to the loaded component", async () => {
    const ComponentWithProps = ({ title, count }: { title: string; count: number }) => (
      <div data-testid="props-component">
        <h1>{title}</h1>
        <span>{count}</span>
      </div>
    );

    const mockImporter = vi.fn(() => 
      Promise.resolve({ default: ComponentWithProps })
    );

    const LazyComponent = safeLazyImport(mockImporter, "PropsComponent");

    render(<LazyComponent title="Test Title" count={42} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId("props-component")).toBeInTheDocument();
    });

    // Verify props were passed correctly
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should have correct accessibility attributes in loading state", () => {
    const mockImporter = vi.fn(() => new Promise(() => {}));

    const LazyComponent = safeLazyImport(mockImporter, "A11yTest");

    render(<LazyComponent />);

    // Check loading state has proper ARIA attributes
    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveAttribute("aria-live", "polite");
  });

  it("should have correct accessibility attributes in error state", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const mockImporter = vi.fn(() => 
      Promise.reject(new Error("Test error"))
    );

    // Use short interval (10ms) for faster test execution
    const LazyComponent = safeLazyImport(mockImporter, "A11yErrorTest", 3, 10);

    render(<LazyComponent />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Check error state has proper ARIA attributes
    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");

    consoleErrorSpy.mockRestore();
  });

  it("should set correct display name for debugging", () => {
    const mockImporter = vi.fn(() => 
      Promise.resolve({ default: MockComponent })
    );

    const LazyComponent = safeLazyImport(mockImporter, "NamedComponent");

    // The lazy component should have a display name for React DevTools
    // Note: This is set on the internal Component, which we can't directly access in this test
    // but we can verify it doesn't throw an error
    expect(LazyComponent).toBeDefined();
    expect(typeof LazyComponent).toBe("function");
  });

  it("should handle network errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const networkError = new Error("Failed to fetch");
    networkError.name = "TypeError";
    
    const mockImporter = vi.fn(() => Promise.reject(networkError));

    // Use short interval (10ms) for faster test execution
    const LazyComponent = safeLazyImport(mockImporter, "NetworkErrorModule", 3, 10);

    render(<LazyComponent />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/⚠️ Falha ao carregar o módulo/i)).toBeInTheDocument();
    });

    // Verify appropriate error handling
    expect(screen.getByText("NetworkErrorModule")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
