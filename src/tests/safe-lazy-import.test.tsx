import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { safeLazyImport } from "@/utils/safeLazyImport";

describe("safeLazyImport", () => {
  it("should load a component successfully", async () => {
    const TestComponent = () => <div>Test Component Loaded</div>;
    const importer = () => Promise.resolve({ default: TestComponent });
    
    const LazyComponent = safeLazyImport(importer, "TestComponent");
    
    render(<LazyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Component Loaded")).toBeDefined();
    });
  });

  it("should show loading state", () => {
    const importer = () => new Promise(() => {}); // Never resolves
    const LazyComponent = safeLazyImport(importer, "SlowComponent");
    
    render(<LazyComponent />);
    
    expect(screen.getByText(/Carregando SlowComponent/i)).toBeDefined();
  });

  it("should handle errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const importer = () => Promise.reject(new Error("Failed to load"));
    const LazyComponent = safeLazyImport(importer, "FailingComponent");
    
    render(<LazyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar o módulo/i)).toBeDefined();
      expect(screen.getByText(/FailingComponent/i)).toBeDefined();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should display component name in error message", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const componentName = "CriticalModule";
    const importer = () => Promise.reject(new Error("Network error"));
    const LazyComponent = safeLazyImport(importer, componentName);
    
    render(<LazyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(new RegExp(componentName, "i"))).toBeDefined();
    });
    
    consoleErrorSpy.mockRestore();
  });
});
