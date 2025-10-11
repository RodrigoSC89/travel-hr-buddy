import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRestoreLogsMetrics } from "@/hooks/use-restore-logs-metrics";

describe("useRestoreLogsMetrics Hook", () => {
  it("should calculate total logs correctly", () => {
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: "2025-10-11T12:00:00Z",
        email: "user1@example.com",
      },
      {
        id: "2",
        document_id: "doc-2",
        version_id: "ver-2",
        restored_by: "user-2",
        restored_at: "2025-10-10T10:00:00Z",
        email: "user2@example.com",
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.total).toBe(2);
  });

  it("should calculate weekly and monthly totals", () => {
    const now = new Date();
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: now.toISOString(),
        email: "user1@example.com",
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.thisWeek).toBeGreaterThan(0);
    expect(result.current.thisMonth).toBeGreaterThan(0);
  });

  it("should identify most active user", () => {
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: "2025-10-11T12:00:00Z",
        email: "active@example.com",
      },
      {
        id: "2",
        document_id: "doc-2",
        version_id: "ver-2",
        restored_by: "user-1",
        restored_at: "2025-10-11T13:00:00Z",
        email: "active@example.com",
      },
      {
        id: "3",
        document_id: "doc-3",
        version_id: "ver-3",
        restored_by: "user-2",
        restored_at: "2025-10-11T14:00:00Z",
        email: "other@example.com",
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.mostActiveUser).toBe("active@example.com");
    expect(result.current.mostActiveCount).toBe(2);
  });

  it("should generate trend data for last 7 days", () => {
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: new Date().toISOString(),
        email: "user@example.com",
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.trendData).toHaveLength(7);
    expect(result.current.trendData[0]).toHaveProperty("date");
    expect(result.current.trendData[0]).toHaveProperty("count");
  });

  it("should generate top 5 user distribution", () => {
    const logs = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      document_id: `doc-${i}`,
      version_id: `ver-${i}`,
      restored_by: `user-${i % 6}`, // 6 different users
      restored_at: "2025-10-11T12:00:00Z",
      email: `user${i % 6}@example.com`,
    }));

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.userDistribution.length).toBeLessThanOrEqual(5);
    expect(result.current.userDistribution[0]).toHaveProperty("name");
    expect(result.current.userDistribution[0]).toHaveProperty("count");
  });

  it("should handle empty logs", () => {
    const { result } = renderHook(() => useRestoreLogsMetrics([]));

    expect(result.current.total).toBe(0);
    expect(result.current.thisWeek).toBe(0);
    expect(result.current.thisMonth).toBe(0);
    expect(result.current.mostActiveUser).toBe("N/A");
    expect(result.current.mostActiveCount).toBe(0);
  });

  it("should handle logs with null email", () => {
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: "2025-10-11T12:00:00Z",
        email: null,
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    expect(result.current.total).toBe(1);
    expect(result.current.mostActiveUser).toBe("Unknown");
  });

  it("should truncate long email names in user distribution", () => {
    const longEmail = "verylongemailaddress@example.com";
    const logs = [
      {
        id: "1",
        document_id: "doc-1",
        version_id: "ver-1",
        restored_by: "user-1",
        restored_at: "2025-10-11T12:00:00Z",
        email: longEmail,
      },
    ];

    const { result } = renderHook(() => useRestoreLogsMetrics(logs));

    const userInDistribution = result.current.userDistribution[0];
    if (longEmail.length > 20) {
      expect(userInDistribution.name).toMatch(/\.\.\.$/);
    }
  });
});
