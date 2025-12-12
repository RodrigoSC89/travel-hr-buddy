/**
 * Tests for Audit Center Workflow
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useCallback } from "react";

// Mock audit hook
const useAuditWorkflow = () => {
  let audits: unknown[] = [];
  let currentAudit: unknown = null;

  const createAudit = async (data: unknown) => {
    const newAudit = {
      id: `audit-${Date.now()}`,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    audits = [...audits, newAudit];
    return newAudit;
  };

  const startAudit = async (auditId: string) => {
    const audit = audits.find((a: unknown: unknown: unknown) => a.id === auditId);
    if (audit) {
      const updated = { ...audit, status: "in_progress", startedAt: new Date() };
      audits = audits.map((a: unknown) => (a.id === auditId ? updated : a));
      currentAudit = updated;
    }
  };

  const completeAudit = async (auditId: string, findings: unknown[]) => {
    const audit = audits.find((a: unknown: unknown: unknown) => a.id === auditId);
    if (audit) {
      const updated = { 
        ...audit, 
        status: "completed", 
        completedAt: new Date(),
        findings 
      };
      audits = audits.map((a: unknown) => (a.id === auditId ? updated : a));
      return updated;
    }
  };

  return {
    audits,
    currentAudit,
    createAudit,
    startAudit,
    completeAudit,
  };
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("Audit Center Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Audit Creation", () => {
    it("should create new audit", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createAudit({
          type: "safety",
          vessel: "vessel-001",
          inspector: "inspector-001",
        });
      });

      expect(result.current.audits).toHaveLength(1);
      expect(result.current.audits[0]).toMatchObject({
        type: "safety",
        vessel: "vessel-001",
        status: "pending",
      });
    });

    it("should assign unique ID to audit", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createAudit({ type: "compliance" });
        await result.current.createAudit({ type: "safety" });
      });

      expect(result.current.audits[0].id).not.toBe(result.current.audits[1].id);
    });
  });

  describe("Audit Execution", () => {
    it("should start audit and change status", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      let auditId: string;

      await act(async () => {
        const audit = await result.current.createAudit({ type: "safety" });
        auditId = audit.id;
      });

      await act(async () => {
        await result.current.startAudit(auditId);
      });

      expect(result.current.currentAudit).toBeDefined();
      expect(result.current.currentAudit?.status).toBe("in_progress");
    });

    it("should record start time", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      let auditId: string;

      await act(async () => {
        const audit = await result.current.createAudit({ type: "compliance" });
        auditId = audit.id;
      });

      await act(async () => {
        await result.current.startAudit(auditId);
      });

      expect(result.current.currentAudit?.startedAt).toBeInstanceOf(Date);
    });
  });

  describe("Audit Completion", () => {
    it("should complete audit with findings", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      const findings = [
        { item: "Safety Equipment", status: "pass" },
        { item: "Documentation", status: "fail", notes: "Missing certificate" },
      ];

      let auditId: string;

      await act(async () => {
        const audit = await result.current.createAudit({ type: "safety" });
        auditId = audit.id;
        await result.current.startAudit(auditId);
      });

      await act(async () => {
        await result.current.completeAudit(auditId, findings);
      });

      const completed = result.current.audits.find((a: unknown: unknown: unknown) => a.id === auditId);
      expect(completed?.status).toBe("completed");
      expect(completed?.findings).toEqual(findings);
      expect(completed?.completedAt).toBeInstanceOf(Date);
    });

    it("should handle completion without findings", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      let auditId: string;

      await act(async () => {
        const audit = await result.current.createAudit({ type: "routine" });
        auditId = audit.id;
      });

      await act(async () => {
        await result.current.completeAudit(auditId, []);
      });

      const completed = result.current.audits.find((a: unknown: unknown: unknown) => a.id === auditId);
      expect(completed?.status).toBe("completed");
      expect(completed?.findings).toEqual([]);
    });
  });

  describe("Multiple Audits", () => {
    it("should manage multiple audits independently", async () => {
      const { result } = renderHook(() => useAuditWorkflow(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createAudit({ type: "safety", vessel: "vessel-001" });
        await result.current.createAudit({ type: "compliance", vessel: "vessel-002" });
        await result.current.createAudit({ type: "routine", vessel: "vessel-003" });
      });

      expect(result.current.audits).toHaveLength(3);
      expect(result.current.audits.map((a: unknown) => a.type)).toEqual([
        "safety",
        "compliance",
        "routine",
      ]);
    });
  });
});
