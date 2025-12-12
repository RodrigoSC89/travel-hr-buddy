/**
 * PATCH 630 - Evidence Ledger
 * Cryptographic immutable ledger for compliance evidence and audit trails
 * Implements Merkle Tree-like structure for tamper detection
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface EvidenceEntry {
  id: string;
  blockNumber: number;
  timestamp: string;
  eventType: "inspection" | "audit" | "correction" | "checklist" | "incident" | "training";
  moduleId: string;
  moduleName: string;
  originator: string;
  description: string;
  data: Record<string, any>;
  hash: string;
  previousHash: string;
  signature: string;
  vesselId?: string;
  metadata?: Record<string, any>;
}

export interface LedgerSummary {
  totalBlocks: number;
  firstBlock: string;
  lastBlock: string;
  integrityStatus: "verified" | "compromised";
  totalEvents: Record<string, number>;
  recentEntries: EvidenceEntry[];
}

/**
 * Generate SHA-256 hash for evidence data
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate digital signature for evidence entry
 * NOTE: This is a simplified implementation for demonstration.
 * In production, use proper cryptographic signing with ECDSA or RSA-PSS.
 */
async function generateSignature(data: string, privateKey: string): Promise<string> {
  // TODO: Replace with proper digital signature algorithm (ECDSA/RSA-PSS) for production
  // This simplified version is for demonstration purposes only
  const combined = data + privateKey;
  return await generateHash(combined);
}

/**
 * In-memory ledger (in production, this would be stored in database or blockchain)
 */
let evidenceLedger: EvidenceEntry[] = [];
let blockCounter = 0;

/**
 * Initialize ledger with genesis block
 */
export async function initializeEvidenceLedger(reset = false): Promise<void> {
  if (reset || evidenceLedger.length === 0) {
    evidenceLedger = []; // Clear existing entries
    blockCounter = 0;
    
    const genesisBlock: EvidenceEntry = {
      id: "genesis-block",
      blockNumber: 0,
      timestamp: new Date().toISOString(),
      eventType: "audit",
      moduleId: "system",
      moduleName: "Evidence Ledger",
      originator: "system",
      description: "Genesis block - Evidence Ledger initialized",
      data: { version: "1.0", initDate: new Date().toISOString() },
      hash: await generateHash("genesis"),
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      signature: "genesis-signature"
    });
    
    evidenceLedger.push(genesisBlock);
    blockCounter = 1;
    
    logger.info("✅ Evidence Ledger initialized with genesis block");
  }
}

/**
 * Record evidence entry to ledger
 */
export async function recordEvidence(
  eventType: EvidenceEntry["eventType"],
  moduleId: string,
  moduleName: string,
  originator: string,
  description: string,
  data: Record<string, any>,
  vesselId?: string,
  metadata?: Record<string, any>
): Promise<EvidenceEntry> {
  try {
    // Ensure ledger is initialized
    if (evidenceLedger.length === 0) {
      await initializeEvidenceLedger();
    }

    const previousBlock = evidenceLedger[evidenceLedger.length - 1];
    const timestamp = new Date().toISOString();
    
    // Create data string for hashing
    const blockData = JSON.stringify({
      blockNumber: blockCounter,
      timestamp,
      eventType,
      moduleId,
      moduleName,
      originator,
      description,
      data,
      previousHash: previousBlock.hash
    });

    // Generate hash and signature
    const hash = await generateHash(blockData);
    const signature = await generateSignature(blockData, "nautilus-private-key");

    const entry: EvidenceEntry = {
      id: `block-${blockCounter}`,
      blockNumber: blockCounter,
      timestamp,
      eventType,
      moduleId,
      moduleName,
      originator,
      description,
      data,
      hash,
      previousHash: previousBlock.hash,
      signature,
      vesselId,
      metadata
    });

    evidenceLedger.push(entry);
    blockCounter++;

    logger.info("📝 Evidence recorded to ledger", {
      blockNumber: entry.blockNumber,
      eventType,
      moduleId,
      hash: hash.substring(0, 16) + "..."
    });

    return entry;
  } catch (error) {
    logger.error("❌ Error recording evidence", { error });
    throw error;
  }
}

/**
 * Verify ledger integrity by validating hash chain
 */
export async function verifyLedgerIntegrity(): Promise<{
  isValid: boolean;
  corruptedBlocks: number[];
  message: string;
}> {
  try {
    const corruptedBlocks: number[] = [];

    // Skip genesis block
    for (let i = 1; i < evidenceLedger.length; i++) {
      const currentBlock = evidenceLedger[i];
      const previousBlock = evidenceLedger[i - 1];

      // Verify previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        corruptedBlocks.push(i);
        logger.warn("⚠️ Hash mismatch detected", {
          blockNumber: i,
          expected: previousBlock.hash.substring(0, 16),
          actual: currentBlock.previousHash.substring(0, 16)
        });
      }

      // Verify current block hash
      const blockData = JSON.stringify({
        blockNumber: currentBlock.blockNumber,
        timestamp: currentBlock.timestamp,
        eventType: currentBlock.eventType,
        moduleId: currentBlock.moduleId,
        moduleName: currentBlock.moduleName,
        originator: currentBlock.originator,
        description: currentBlock.description,
        data: currentBlock.data,
        previousHash: currentBlock.previousHash
      });

      const expectedHash = await generateHash(blockData);
      if (expectedHash !== currentBlock.hash) {
        corruptedBlocks.push(i);
        logger.warn("⚠️ Block hash corrupted", {
          blockNumber: i,
          expected: expectedHash.substring(0, 16),
          actual: currentBlock.hash.substring(0, 16)
        });
      }
    }

    const isValid = corruptedBlocks.length === 0;
    const message = isValid
      ? `✅ Ledger integrity verified: ${evidenceLedger.length} blocks validated`
      : `⚠️ Ledger compromised: ${corruptedBlocks.length} corrupted blocks detected`;

    logger.info(message, { totalBlocks: evidenceLedger.length, corruptedBlocks });

    return { isValid, corruptedBlocks, message };
  } catch (error) {
    logger.error("❌ Error verifying ledger integrity", { error });
    return {
      isValid: false,
      corruptedBlocks: [],
      message: "Error during verification"
    });
  }
}

/**
 * Query ledger entries by criteria
 */
export async function queryLedger(filters?: {
  eventType?: EvidenceEntry["eventType"];
  moduleId?: string;
  startDate?: string;
  endDate?: string;
  vesselId?: string;
  originator?: string;
  limit?: number;
}): Promise<EvidenceEntry[]> {
  let results = [...evidenceLedger];

  // Skip genesis block for queries
  results = results.slice(1);

  if (filters) {
    if (filters.eventType) {
      results = results.filter(e => e.eventType === filters.eventType);
    }
    if (filters.moduleId) {
      results = results.filter(e => e.moduleId === filters.moduleId);
    }
    if (filters.startDate) {
      results = results.filter(e => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      results = results.filter(e => e.timestamp <= filters.endDate!);
    }
    if (filters.vesselId) {
      results = results.filter(e => e.vesselId === filters.vesselId);
    }
    if (filters.originator) {
      results = results.filter(e => e.originator === filters.originator);
    }
    if (filters.limit) {
      results = results.slice(-filters.limit);
    }
  }

  return results.reverse(); // Most recent first
}

/**
 * Get ledger summary
 */
export async function getLedgerSummary(): Promise<LedgerSummary> {
  const integrity = await verifyLedgerIntegrity();
  
  const totalEvents: Record<string, number> = {};
  evidenceLedger.forEach(entry => {
    if (entry.blockNumber > 0) { // Skip genesis
      totalEvents[entry.eventType] = (totalEvents[entry.eventType] || 0) + 1;
    }
  });

  const recentEntries = await queryLedger({ limit: 10 });

  return {
    totalBlocks: evidenceLedger.length,
    firstBlock: evidenceLedger[0]?.timestamp || "",
    lastBlock: evidenceLedger[evidenceLedger.length - 1]?.timestamp || "",
    integrityStatus: integrity.isValid ? "verified" : "compromised",
    totalEvents,
    recentEntries
  };
}

/**
 * Get specific evidence entry
 */
export async function getEvidenceEntry(blockNumber: number): Promise<EvidenceEntry | null> {
  return evidenceLedger.find(e => e.blockNumber === blockNumber) || null;
}

/**
 * Export ledger for auditing (JSON format)
 */
export function exportLedger(): string {
  return JSON.stringify(evidenceLedger, null, 2);
}

/**
 * Get evidence chain for a specific module
 */
export async function getModuleEvidenceChain(moduleId: string): Promise<EvidenceEntry[]> {
  return queryLedger({ moduleId });
}

/**
 * Simulate evidence recording for demo purposes
 */
export async function seedDemoEvidence(): Promise<void> {
  await initializeEvidenceLedger();

  // Sample evidence entries
  await recordEvidence(
    "inspection",
    "ism-code",
    "ISM Code Compliance",
    "inspector-001",
    "Annual ISM audit completed",
    { result: "pass", findings: 2, recommendations: 3 },
    "vessel-001",
    { inspector: "John Smith", location: "Singapore" }
  );

  await recordEvidence(
    "checklist",
    "mlc-2006",
    "MLC 2006 Maritime Labor",
    "captain-002",
    "Monthly crew welfare checklist completed",
    { items_checked: 15, non_conformances: 0 },
    "vessel-001"
  );

  await recordEvidence(
    "correction",
    "marpol-73-78",
    "MARPOL 73/78 Environmental",
    "engineer-003",
    "Oil discharge separator corrected",
    { issue: "sensor_malfunction", action: "sensor_replaced" },
    "vessel-001"
  );

  await recordEvidence(
    "audit",
    "sgso",
    "SGSO Safety Management",
    "auditor-004",
    "SGSO annual audit completed",
    { score: 92, areas_improved: ["emergency_procedures", "drill_documentation"] },
    "vessel-001"
  );

  await recordEvidence(
    "training",
    "imca-m117",
    "IMCA M117 DP Operations",
    "trainer-005",
    "DP operator refresher training",
    { participants: 4, duration_hours: 8, certification: "valid" },
    "vessel-001"
  );

  logger.info("✅ Demo evidence seeded", { totalBlocks: evidenceLedger.length });
}
