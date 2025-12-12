/**
 * Data Integrity - PATCH 901
 * Ensures data consistency and validates sync operations
 */

import { logger } from "@/lib/logger";

export interface IntegrityCheck {
  id: string;
  table: string;
  operation: string;
  checksum: string;
  timestamp: string;
  status: "pending" | "verified" | "failed";
  retries: number;
}

interface IntegrityConfig {
  enableChecksums: boolean;
  maxRetries: number;
  checksumAlgorithm: "crc32" | "simple";
}

const DEFAULT_CONFIG: IntegrityConfig = {
  enableChecksums: true,
  maxRetries: 3,
  checksumAlgorithm: "simple",
};

class DataIntegrity {
  private config: IntegrityConfig;
  private checks: Map<string, IntegrityCheck> = new Map();
  private readonly STORAGE_KEY = "nautilus_integrity_checks";

  constructor(config: Partial<IntegrityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  /**
   * Generate checksum for data
   */
  generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    
    if (this.config.checksumAlgorithm === "simple") {
      return this.simpleChecksum(str);
    }
    
    return this.crc32Checksum(str);
  }

  private simpleChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  private crc32Checksum(str: string): string {
    let crc = 0xFFFFFFFF;
    
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, "0");
  }

  /**
   * Create integrity check for an operation
   */
  createCheck(table: string, operation: string, data: any): IntegrityCheck {
    const check: IntegrityCheck = {
      id: `check-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      table,
      operation,
      checksum: this.config.enableChecksums ? this.generateChecksum(data) : "",
      timestamp: new Date().toISOString(),
      status: "pending",
      retries: 0,
    };

    this.checks.set(check.id, check);
    this.saveToStorage();
    
    return check;
  }

  /**
   * Verify data against checksum
   */
  verifyChecksum(checkId: string, data: any): boolean {
    const check = this.checks.get(checkId);
    
    if (!check) {
      logger.warn("[DataIntegrity] Check not found", { checkId });
      return false;
    }

    if (!this.config.enableChecksums || !check.checksum) {
      check.status = "verified";
      this.saveToStorage();
      return true;
    }

    const newChecksum = this.generateChecksum(data);
    const isValid = newChecksum === check.checksum;

    if (isValid) {
      check.status = "verified";
      logger.debug("[DataIntegrity] Checksum verified", { checkId });
    } else {
      check.status = "failed";
      check.retries++;
      logger.error("[DataIntegrity] Checksum mismatch", {
        checkId,
        expected: check.checksum,
        actual: newChecksum,
      });
    }

    this.saveToStorage();
    return isValid;
  }

  /**
   * Mark check as verified
   */
  markVerified(checkId: string): void {
    const check = this.checks.get(checkId);
    if (check) {
      check.status = "verified";
      this.saveToStorage();
    }
  }

  /**
   * Get pending checks
   */
  getPendingChecks(): IntegrityCheck[] {
    return Array.from(this.checks.values()).filter(
      c => c.status === "pending" || (c.status === "failed" && c.retries < this.config.maxRetries)
    );
  }

  /**
   * Get failed checks
   */
  getFailedChecks(): IntegrityCheck[] {
    return Array.from(this.checks.values()).filter(
      c => c.status === "failed" && c.retries >= this.config.maxRetries
    );
  }

  /**
   * Clear verified checks
   */
  clearVerified(): number {
    let cleared = 0;
    
    for (const [id, check] of this.checks) {
      if (check.status === "verified") {
        this.checks.delete(id);
        cleared++;
      }
    }
    
    this.saveToStorage();
    return cleared;
  }

  /**
   * Get statistics
   */
  getStats() {
    const checks = Array.from(this.checks.values());
    
    return {
      total: checks.length,
      pending: checks.filter(c => c.status === "pending").length,
      verified: checks.filter(c => c.status === "verified").length,
      failed: checks.filter(c => c.status === "failed").length,
    };
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.checks.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error("[DataIntegrity] Failed to save", { error });
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as [string, IntegrityCheck][];
        this.checks = new Map(data);
      }
    } catch (error) {
      logger.error("[DataIntegrity] Failed to load", { error });
    }
  }
}

export const dataIntegrity = new DataIntegrity();

/**
 * Validate data structure
 */
export function validateDataStructure(data: any, schema: Record<string, string>): string[] {
  const errors: string[] = [];

  for (const [field, type] of Object.entries(schema)) {
    const value = data[field];
    const actualType = Array.isArray(value) ? "array" : typeof value;

    if (value === undefined && !type.endsWith("?")) {
      errors.push(`Missing required field: ${field}`);
    } else if (value !== undefined && !type.startsWith(actualType) && !type.endsWith("?")) {
      errors.push(`Invalid type for ${field}: expected ${type}, got ${actualType}`);
    }
  }

  return errors;
}

/**
 * Sanitize data for sync
 */
export function sanitizeForSync(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForSync);
  }
  
  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remove internal fields
      if (key.startsWith("_") || key.startsWith("$")) continue;
      
      // Sanitize nested objects
      sanitized[key] = sanitizeForSync(value);
    }
    
    return sanitized;
  }
  
  // Handle special types
  if (typeof data === "string") {
    // Trim and limit length
    return data.trim().slice(0, 10000);
  }
  
  return data;
}
