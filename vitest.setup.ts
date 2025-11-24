import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock ResizeObserver for recharts and other chart libraries
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver implements IntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? "0px";
    const threshold = options?.threshold;
    this.thresholds = Array.isArray(threshold)
      ? threshold
      : typeof threshold === "number"
        ? [threshold]
        : [];
  }

  disconnect(): void {
    // no-op
  }

  observe(target: Element): void {
    void target;
  }

  unobserve(): void {
    // no-op
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Custom helper for tests to simulate intersection changes if needed
  trigger(entries: IntersectionObserverEntry[]): void {
    this.callback(entries, this);
  }
};

// Mock ApplyTemplateModal for test stability
vi.mock("@/components/templates/ApplyTemplateModal", () => ({
  __esModule: true,
  default: () => React.createElement("div", { "data-testid": "apply-template-modal" })
}));

// Mock ApplyTemplateModal stub component for test stability
vi.mock("@/components/ApplyTemplateModal", () => ({
  __esModule: true,
  default: () => React.createElement("div", { "data-testid": "apply-template-modal" })
}));

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
