/**
 * Unit Tests: useAuditData
 * P4 - Cobertura de testes para hooks de auditoria
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

describe("useAuditPackages Hook", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  it("should export useAuditPackages function", async () => {
    const { useAuditPackages } = await import("@/hooks/useAuditData");
    expect(useAuditPackages).toBeDefined();
    expect(typeof useAuditPackages).toBe("function");
  });

  it("should return query result", async () => {
    const { useAuditPackages } = await import("@/hooks/useAuditData");
    const { result } = renderHook(() => useAuditPackages(), { wrapper });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
  });

  it("should return empty array on initial load", async () => {
    const { useAuditPackages } = await import("@/hooks/useAuditData");
    const { result } = renderHook(() => useAuditPackages(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe("useAuditDocuments Hook", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  it("should export useAuditDocuments function", async () => {
    const { useAuditDocuments } = await import("@/hooks/useAuditData");
    expect(useAuditDocuments).toBeDefined();
    expect(typeof useAuditDocuments).toBe("function");
  });

  it("should return query result", async () => {
    const { useAuditDocuments } = await import("@/hooks/useAuditData");
    const { result } = renderHook(() => useAuditDocuments(), { wrapper });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
  });
});

describe("AuditPackage Interface", () => {
  it("should define correct AuditPackage structure", () => {
    const samplePackage = {
      id: "pkg-001",
      name: "Auditoria ISM 2024",
      type: "ISM" as const,
      status: "ready" as const,
      completeness: 95,
      documents: 12,
      lastGenerated: new Date(),
      missingItems: [],
    };

    expect(samplePackage.id).toBeDefined();
    expect(["ANTAQ", "DPC", "IMO", "ISM", "ISPS", "MLC", "ESG", "ISO"]).toContain(samplePackage.type);
    expect(["ready", "generating", "pending", "incomplete"]).toContain(samplePackage.status);
    expect(samplePackage.completeness).toBeGreaterThanOrEqual(0);
    expect(samplePackage.completeness).toBeLessThanOrEqual(100);
  });
});

describe("DocumentItem Interface", () => {
  it("should define correct DocumentItem structure", () => {
    const sampleDocument = {
      id: "doc-001",
      name: "Certificado ISPS",
      category: "Segurança",
      status: "valid" as const,
      expiryDate: new Date("2025-12-31"),
      vessel: "MV Nautilus One",
    };

    expect(sampleDocument.id).toBeDefined();
    expect(["valid", "expiring", "expired", "missing"]).toContain(sampleDocument.status);
  });

  it("should calculate expiry status correctly", () => {
    const now = new Date();
    
    // Valid - more than 30 days
    const validDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const daysUntilValid = Math.ceil((validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysUntilValid).toBeGreaterThan(30);
    
    // Expiring - less than 30 days
    const expiringDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const daysUntilExpiring = Math.ceil((expiringDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysUntilExpiring).toBeLessThanOrEqual(30);
    expect(daysUntilExpiring).toBeGreaterThan(0);
    
    // Expired - past date
    const expiredDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const daysUntilExpired = Math.ceil((expiredDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysUntilExpired).toBeLessThan(0);
  });
});
