/**
 * Tests for PATCH 630 - Evidence Ledger
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeEvidenceLedger,
  recordEvidence,
  verifyLedgerIntegrity,
  queryLedger,
  getLedgerSummary,
  getEvidenceEntry,
  getModuleEvidenceChain,
  exportLedger
} from "@/lib/compliance/evidence-ledger";

describe("PATCH 630 - Evidence Ledger", () => {
  beforeEach(async () => {
    // Reset ledger for each test
    await initializeEvidenceLedger(true);
  });

  describe("Ledger Initialization", () => {
    it("should initialize ledger with genesis block", async () => {
      await initializeEvidenceLedger();
      const summary = await getLedgerSummary();
      
      expect(summary.totalBlocks).toBeGreaterThanOrEqual(1);
      expect(summary.integrityStatus).toBe("verified");
    });

    it("should create genesis block with zero previous hash", async () => {
      const genesis = await getEvidenceEntry(0);
      
      expect(genesis).toBeDefined();
      expect(genesis?.blockNumber).toBe(0);
      expect(genesis?.previousHash).toBe("0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Evidence Recording", () => {
    it("should record evidence entry with valid hash", async () => {
      const entry = await recordEvidence(
        "inspection",
        "test-module",
        "Test Module",
        "test-user",
        "Test inspection completed",
        { result: "pass" }
      );

      expect(entry).toBeDefined();
      expect(entry.hash).toBeDefined();
      expect(entry.hash.length).toBe(64); // SHA-256 produces 64 hex characters
      expect(entry.previousHash).toBeDefined();
      expect(entry.signature).toBeDefined();
    });

    it("should increment block number for each entry", async () => {
      const entry1 = await recordEvidence(
        "audit",
        "module-1",
        "Module 1",
        "user-1",
        "First entry",
        {}
      );

      const entry2 = await recordEvidence(
        "audit",
        "module-2",
        "Module 2",
        "user-2",
        "Second entry",
        {}
      );

      expect(entry2.blockNumber).toBe(entry1.blockNumber + 1);
    });

    it("should link entries through hash chain", async () => {
      const entry1 = await recordEvidence(
        "checklist",
        "module-a",
        "Module A",
        "user-a",
        "Entry A",
        {}
      );

      const entry2 = await recordEvidence(
        "checklist",
        "module-b",
        "Module B",
        "user-b",
        "Entry B",
        {}
      );

      expect(entry2.previousHash).toBe(entry1.hash);
    });

    it("should record all event types", async () => {
      const eventTypes = ["inspection", "audit", "correction", "checklist", "incident", "training"] as const;
      
      for (const eventType of eventTypes) {
        const entry = await recordEvidence(
          eventType,
          "test-module",
          "Test Module",
          "test-user",
          `Test ${eventType}`,
          {}
        );
        
        expect(entry.eventType).toBe(eventType);
      }
    });

    it("should include optional vessel ID and metadata", async () => {
      const entry = await recordEvidence(
        "inspection",
        "test-module",
        "Test Module",
        "inspector-001",
        "Inspection with vessel data",
        { findings: 3 },
        "vessel-123",
        { location: "Singapore", weather: "clear" }
      );

      expect(entry.vesselId).toBe("vessel-123");
      expect(entry.metadata).toEqual({ location: "Singapore", weather: "clear" });
    });
  });

  describe("Integrity Verification", () => {
    it("should verify integrity of valid ledger", async () => {
      await recordEvidence("audit", "m1", "M1", "u1", "Entry 1", {});
      await recordEvidence("audit", "m2", "M2", "u2", "Entry 2", {});
      await recordEvidence("audit", "m3", "M3", "u3", "Entry 3", {});

      const result = await verifyLedgerIntegrity();

      expect(result.isValid).toBe(true);
      expect(result.corruptedBlocks).toHaveLength(0);
      expect(result.message).toContain("verified");
    });

    it("should return valid status for genesis block only", async () => {
      const result = await verifyLedgerIntegrity();

      expect(result.isValid).toBe(true);
    });
  });

  describe("Ledger Querying", () => {
    beforeEach(async () => {
      // Create sample data
      await recordEvidence("inspection", "ism", "ISM Code", "user1", "ISM inspection", {});
      await recordEvidence("audit", "mlc", "MLC 2006", "user2", "MLC audit", {});
      await recordEvidence("inspection", "ism", "ISM Code", "user1", "Another ISM inspection", {});
      await recordEvidence("checklist", "sgso", "SGSO", "user3", "SGSO checklist", {});
    });

    it("should query all entries", async () => {
      const entries = await queryLedger();
      
      // Should not include genesis block
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.every(e => e.blockNumber > 0)).toBe(true);
    });

    it("should filter by event type", async () => {
      const inspections = await queryLedger({ eventType: "inspection" });
      
      expect(inspections.every(e => e.eventType === "inspection")).toBe(true);
      expect(inspections.length).toBe(2);
    });

    it("should filter by module ID", async () => {
      const ismEntries = await queryLedger({ moduleId: "ism" });
      
      expect(ismEntries.every(e => e.moduleId === "ism")).toBe(true);
      expect(ismEntries.length).toBe(2);
    });

    it("should limit results", async () => {
      const limited = await queryLedger({ limit: 2 });
      
      expect(limited.length).toBe(2);
    });

    it("should return entries in reverse chronological order", async () => {
      const entries = await queryLedger();
      
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].blockNumber).toBeGreaterThan(entries[i].blockNumber);
      }
    });

    it("should filter by date range", async () => {
      const now = new Date().toISOString();
      const past = new Date(Date.now() - 60000).toISOString();
      
      const entries = await queryLedger({
        startDate: past,
        endDate: now
      });
      
      expect(entries.length).toBeGreaterThan(0);
    });

    it("should filter by originator", async () => {
      const user1Entries = await queryLedger({ originator: "user1" });
      
      expect(user1Entries.every(e => e.originator === "user1")).toBe(true);
    });
  });

  describe("Ledger Summary", () => {
    it("should generate comprehensive summary", async () => {
      await recordEvidence("inspection", "m1", "M1", "u1", "Entry 1", {});
      await recordEvidence("audit", "m2", "M2", "u2", "Entry 2", {});
      await recordEvidence("inspection", "m3", "M3", "u3", "Entry 3", {});

      const summary = await getLedgerSummary();

      expect(summary.totalBlocks).toBeGreaterThan(0);
      expect(summary.integrityStatus).toBe("verified");
      expect(summary.totalEvents).toBeDefined();
      expect(summary.recentEntries).toBeDefined();
      expect(summary.firstBlock).toBeDefined();
      expect(summary.lastBlock).toBeDefined();
    });

    it("should count events by type", async () => {
      await recordEvidence("inspection", "m1", "M1", "u1", "E1", {});
      await recordEvidence("inspection", "m2", "M2", "u2", "E2", {});
      await recordEvidence("audit", "m3", "M3", "u3", "E3", {});

      const summary = await getLedgerSummary();

      expect(summary.totalEvents.inspection).toBe(2);
      expect(summary.totalEvents.audit).toBe(1);
    });

    it("should include recent entries", async () => {
      await recordEvidence("inspection", "m1", "M1", "u1", "E1", {});
      
      const summary = await getLedgerSummary();

      expect(summary.recentEntries.length).toBeGreaterThan(0);
      expect(summary.recentEntries[0].blockNumber).toBeGreaterThan(0);
    });
  });

  describe("Evidence Retrieval", () => {
    it("should get specific evidence entry by block number", async () => {
      const recorded = await recordEvidence(
        "audit",
        "test-module",
        "Test Module",
        "test-user",
        "Test entry",
        { key: "value" }
      );

      const retrieved = await getEvidenceEntry(recorded.blockNumber);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(recorded.id);
      expect(retrieved?.hash).toBe(recorded.hash);
    });

    it("should return null for non-existent block", async () => {
      const entry = await getEvidenceEntry(9999);
      
      expect(entry).toBeNull();
    });

    it("should get module evidence chain", async () => {
      await recordEvidence("inspection", "module-x", "Module X", "u1", "E1", {});
      await recordEvidence("audit", "module-y", "Module Y", "u2", "E2", {});
      await recordEvidence("inspection", "module-x", "Module X", "u1", "E3", {});

      const chain = await getModuleEvidenceChain("module-x");

      expect(chain.length).toBe(2);
      expect(chain.every(e => e.moduleId === "module-x")).toBe(true);
    });
  });

  describe("Export Functionality", () => {
    it("should export ledger as JSON string", async () => {
      await recordEvidence("audit", "m1", "M1", "u1", "Entry", {});
      
      const exported = exportLedger();

      expect(typeof exported).toBe("string");
      expect(() => JSON.parse(exported)).not.toThrow();
      
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it("should include all entry fields in export", async () => {
      await recordEvidence(
        "inspection",
        "test-module",
        "Test Module",
        "test-user",
        "Test description",
        { data: "value" },
        "vessel-001"
      );

      const exported = exportLedger();
      const parsed = JSON.parse(exported);
      const entry = parsed.find((e: any) => e.blockNumber > 0);

      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("blockNumber");
      expect(entry).toHaveProperty("timestamp");
      expect(entry).toHaveProperty("eventType");
      expect(entry).toHaveProperty("moduleId");
      expect(entry).toHaveProperty("hash");
      expect(entry).toHaveProperty("previousHash");
      expect(entry).toHaveProperty("signature");
    });
  });

  describe("Hash Generation", () => {
    it("should generate unique hashes for different entries", async () => {
      const entry1 = await recordEvidence("audit", "m1", "M1", "u1", "E1", {});
      const entry2 = await recordEvidence("audit", "m2", "M2", "u2", "E2", {});

      expect(entry1.hash).not.toBe(entry2.hash);
    });

    it("should generate 64-character SHA-256 hashes", async () => {
      const entry = await recordEvidence("audit", "m1", "M1", "u1", "Entry", {});

      expect(entry.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should include timestamp in hash calculation", async () => {
      // Recording entries at different times should produce different hashes
      const entry1 = await recordEvidence("audit", "m1", "M1", "u1", "E1", {});
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entry2 = await recordEvidence("audit", "m1", "M1", "u1", "E1", {});

      expect(entry1.hash).not.toBe(entry2.hash);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty data object", async () => {
      const entry = await recordEvidence(
        "audit",
        "test-module",
        "Test Module",
        "test-user",
        "Empty data test",
        {}
      );

      expect(entry).toBeDefined();
      expect(entry.data).toEqual({});
    });

    it("should handle complex nested data", async () => {
      const complexData = {
        findings: [
          { id: 1, severity: "high", description: "Issue 1" },
          { id: 2, severity: "low", description: "Issue 2" }
        ],
        metadata: {
          inspector: "John",
          location: { port: "Singapore", berth: "A1" }
        }
      };

      const entry = await recordEvidence(
        "inspection",
        "test-module",
        "Test Module",
        "test-user",
        "Complex data test",
        complexData
      );

      expect(entry.data).toEqual(complexData);
    });

    it("should handle special characters in strings", async () => {
      const entry = await recordEvidence(
        "audit",
        "test-module",
        "Test Module",
        "test-user",
        "Special chars: @#$%^&*(){}[]|\\<>?",
        { text: "UTF-8: 你好 🚢 ⚓" }
      );

      expect(entry.description).toContain("@#$%^&*()");
      expect(entry.data.text).toContain("你好");
    });
  });
});
