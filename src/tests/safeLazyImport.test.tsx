import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";

describe("safeLazyImport", () => {
  it("should successfully load a valid module", async () => {
    // Create a mock component
    const MockComponent = () => <div>Mock Component Content</div>;
    
    // Create a successful importer
    const successfulImporter = () => Promise.resolve({ default: MockComponent });
    
    // Use safeLazyImport
    const SafeComponent = safeLazyImport(successfulImporter, "Test Component");
    
    // Render the component
    render(<SafeComponent />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Mock Component Content")).toBeInTheDocument();
    });
  });

  it("should show loading state while component is loading", () => {
    // Create a delayed importer
    const delayedImporter = () => new Promise(() => {}); // Never resolves
    
    const SafeComponent = safeLazyImport(delayedImporter, "Delayed Component");
    
    render(<SafeComponent />);
    
    // Check for loading message
    expect(screen.getByText(/Carregando Delayed Component/i)).toBeInTheDocument();
  });

  it("should show error fallback when module fails to load", async () => {
    // Mock console.error to avoid test output noise
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Create a failing importer
    const failingImporter = () => Promise.reject(new Error("Module not found"));
    
    const SafeComponent = safeLazyImport(failingImporter, "Failing Component");
    
    render(<SafeComponent />);
    
    // Wait for error fallback to appear
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar o módulo/i)).toBeInTheDocument();
      expect(screen.getByText(/Failing Component/)).toBeInTheDocument();
    });
    
    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it("should pass props to the loaded component", async () => {
    // Create a component that uses props
    const PropsComponent = ({ title }: { title: string }) => <h1>{title}</h1>;
    
    const importer = () => Promise.resolve({ default: PropsComponent });
    
    const SafeComponent = safeLazyImport(importer, "Props Component");
    
    render(<SafeComponent title="Test Title" />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
  });
});
