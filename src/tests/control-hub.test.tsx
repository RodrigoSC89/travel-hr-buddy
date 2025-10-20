import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ControlHub from "@/pages/ControlHub";
import { BridgeLink } from "@/core/BridgeLink";

// Mock BridgeLink
vi.mock("@/core/BridgeLink", () => ({
  BridgeLink: {
    on: vi.fn((event: string, callback: (data: any) => void) => {
      return () => {}; // Return unsubscribe function
    }),
    emit: vi.fn(),
  },
}));

describe("ControlHub", () => {
  it("should render the Control Hub title", () => {
    render(<ControlHub />);
    expect(screen.getByText(/Nautilus Control Hub/i)).toBeDefined();
  });

  it("should render the telemetry panel", () => {
    render(<ControlHub />);
    expect(screen.getByText(/Telemetria Ativa/i)).toBeDefined();
  });

  it("should show waiting message when no events", () => {
    render(<ControlHub />);
    expect(screen.getByText(/Aguardando eventos/i)).toBeDefined();
  });

  it("should register event listener on mount", () => {
    render(<ControlHub />);
    expect(BridgeLink.on).toHaveBeenCalledWith("nautilus:event", expect.any(Function));
  });

  it("should render without errors", () => {
    const { container } = render(<ControlHub />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });
});
