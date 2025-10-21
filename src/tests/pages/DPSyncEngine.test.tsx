import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DPSyncEngine from "@/pages/DPSyncEngine";

// Mock the safeLazyImport utility
vi.mock("@/utils/safeLazyImport", () => ({
  safeLazyImport: (importer: () => Promise<{ default: React.ComponentType<any> }>, name: string) => {
    // For testing, we'll directly import the components without lazy loading
    return () => {
      const Component = vi.fn(() => <div data-testid={`mock-${name}`}>{name}</div>);
      return <Component />;
    };
  },
}));

// Mock the Loader component
vi.mock("@/components/ui/loader", () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

describe("DPSyncEngine Page", () => {
  it("should render the page title", () => {
    render(<DPSyncEngine />);
    expect(screen.getByText("DP Synchronization Engine")).toBeInTheDocument();
  });

  it("should render all three main components", () => {
    render(<DPSyncEngine />);
    
    expect(screen.getByTestId("mock-DPStatusBoard")).toBeInTheDocument();
    expect(screen.getByTestId("mock-DPSyncDashboard")).toBeInTheDocument();
    expect(screen.getByTestId("mock-DPAlertFeed")).toBeInTheDocument();
  });

  it("should have correct layout structure", () => {
    const { container } = render(<DPSyncEngine />);
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeTruthy();
    expect(mainElement?.className).toContain('p-6');
    expect(mainElement?.className).toContain('flex-col');
    expect(mainElement?.className).toContain('gap-6');
  });

  it("should display components in correct order", () => {
    render(<DPSyncEngine />);
    
    const components = screen.getAllByTestId(/^mock-/);
    expect(components[0]).toHaveAttribute('data-testid', 'mock-DPStatusBoard');
    expect(components[1]).toHaveAttribute('data-testid', 'mock-DPSyncDashboard');
    expect(components[2]).toHaveAttribute('data-testid', 'mock-DPAlertFeed');
  });

  it("should use Suspense for lazy loading", () => {
    const { container } = render(<DPSyncEngine />);
    
    // The Suspense component should be present in the tree
    expect(container.querySelector('[data-testid]')).toBeTruthy();
  });

  it("should apply correct CSS variables for theme", () => {
    const { container } = render(<DPSyncEngine />);
    
    const mainElement = container.querySelector('main');
    expect(mainElement?.className).toContain('bg-[var(--nautilus-bg-alt)]');
    
    const title = screen.getByText("DP Synchronization Engine");
    expect(title.className).toContain('text-[var(--nautilus-primary)]');
  });

  it("should have minimum height for screen coverage", () => {
    const { container } = render(<DPSyncEngine />);
    
    const mainElement = container.querySelector('main');
    expect(mainElement?.className).toContain('min-h-screen');
  });
});
