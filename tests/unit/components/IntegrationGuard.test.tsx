/**
 * Unit Tests: IntegrationGuard Component
 * R02 Compliance - UI Data Visibility Guards
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock the integration-status module
vi.mock("@/lib/integration-status", () => ({
  canShowData: vi.fn((status: string) => {
    return status === "CONNECTED" || status === "DEGRADED";
  }),
  getStatusMessage: vi.fn((status: string) => {
    const messages: Record<string, string> = {
      CONNECTED: "Conectado e funcionando",
      DEGRADED: "Conectado com limitações",
      DISCONNECTED: "Desconectado temporariamente",
      NOT_CONFIGURED: "Integração não configurada",
      ERROR: "Erro na integração",
    };
    return messages[status] || "Desconhecido";
  }),
}));

// Import the component after mocking
import { IntegrationGuard, IntegrationNotConfigured } from "@/components/ui/IntegrationStatusBadge";

describe("IntegrationGuard Component", () => {
  it("should render children when status is CONNECTED", () => {
    render(
      <IntegrationGuard status="CONNECTED" integrationName="Test Integration">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render children when status is DEGRADED", () => {
    render(
      <IntegrationGuard status="DEGRADED" integrationName="Test Integration">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("should NOT render children when status is NOT_CONFIGURED", () => {
    render(
      <IntegrationGuard status="NOT_CONFIGURED" integrationName="Test Integration">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });

  it("should NOT render children when status is DISCONNECTED", () => {
    render(
      <IntegrationGuard status="DISCONNECTED" integrationName="Test Integration">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });

  it("should NOT render children when status is ERROR", () => {
    render(
      <IntegrationGuard status="ERROR" integrationName="Test Integration">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });

  it("should render custom fallback when provided and status is NOT_CONFIGURED", () => {
    render(
      <IntegrationGuard
        status="NOT_CONFIGURED"
        integrationName="Test Integration"
        fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
      >
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Fallback")).toBeInTheDocument();
  });

  it("should show default IntegrationNotConfigured when no fallback provided", () => {
    render(
      <IntegrationGuard status="NOT_CONFIGURED" integrationName="Weather API">
        <div data-testid="child-content">Protected Content</div>
      </IntegrationGuard>
    );

    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    // Should show the integration name in the fallback
    expect(screen.getByText(/Weather API/i)).toBeInTheDocument();
  });
});

describe("IntegrationNotConfigured Component", () => {
  it("should render integration name", () => {
    render(<IntegrationNotConfigured integrationName="Weather API" />);
    
    expect(screen.getByText(/Weather API/i)).toBeInTheDocument();
    expect(screen.getByText(/não configurado/i)).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(
      <IntegrationNotConfigured
        integrationName="Weather API"
        description="Configure this integration to view real data."
      />
    );
    
    expect(screen.getByText(/Configure this integration/i)).toBeInTheDocument();
  });

  it("should render configure button when onConfigure is provided", () => {
    const onConfigure = vi.fn();
    
    render(
      <IntegrationNotConfigured
        integrationName="Weather API"
        onConfigure={onConfigure}
      />
    );
    
    const button = screen.getByRole("button", { name: /Configurar/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onConfigure when button is clicked", async () => {
    const onConfigure = vi.fn();
    
    render(
      <IntegrationNotConfigured
        integrationName="Weather API"
        onConfigure={onConfigure}
      />
    );
    
    const button = screen.getByRole("button", { name: /Configurar/i });
    button.click();
    
    expect(onConfigure).toHaveBeenCalledTimes(1);
  });
});
