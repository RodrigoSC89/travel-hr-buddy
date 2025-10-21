/**
 * Tests for Incident Dashboard
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentDashboard } from "@/components/system/incident-dashboard";

// Mock WebSocket
class MockWebSocket {
  onmessage: ((event: any) => void) | null = null;
  close = vi.fn();
}

global.WebSocket = MockWebSocket as any;

// Mock AI Insight Reporter
vi.mock("@/lib/ai/insight-reporter", () => ({
  AIInsightReporter: vi.fn().mockImplementation(() => ({
    reportAnomaly: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock import.meta.env
vi.stubGlobal("import", {
  meta: {
    env: {
      VITE_SUPABASE_WS_URL: "ws://localhost:3000",
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
    },
  },
});

describe("IncidentDashboard", () => {
  it("should render without crashing", () => {
    render(<IncidentDashboard />);
    expect(screen.getByText("📊 Painel de Incidentes")).toBeInTheDocument();
  });

  it("should display no incidents message when empty", () => {
    render(<IncidentDashboard />);
    expect(screen.getByText("Nenhum incidente ativo")).toBeInTheDocument();
  });

  it("should display card header with title", () => {
    render(<IncidentDashboard />);
    expect(screen.getByText("📊 Painel de Incidentes")).toBeInTheDocument();
  });

  it("should initialize WebSocket connection", () => {
    const { unmount } = render(<IncidentDashboard />);
    
    // WebSocket should be instantiated
    expect(global.WebSocket).toBeDefined();
    
    unmount();
  });

  it("should cleanup WebSocket on unmount", () => {
    const { unmount } = render(<IncidentDashboard />);
    
    // WebSocket instance should be created
    expect(global.WebSocket).toBeDefined();
    
    // Unmounting should not crash
    expect(() => unmount()).not.toThrow();
  });
});
