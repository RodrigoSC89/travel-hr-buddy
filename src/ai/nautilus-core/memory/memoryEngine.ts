import * as fs from "fs";
import * as path from "path";

/**
 * Nautilus Memory Engine
 * 
 * Registers, organizes and analyzes the history of failures and corrections.
 * Learns from the system's past behavior and provides preventive insights.
 */

interface MemoryEntry {
  id: number;
  timestamp: string;
  findings: string[];
  fixSummary: string;
}

interface RecurrentPattern {
  pattern: string;
  occurrences: number;
}

const MEMORY_PATH = path.resolve("src/ai/nautilus-core/memory/memoryDB.json");

export class MemoryEngine {
  private memory: MemoryEntry[] = [];

  constructor() {
    this.loadMemory();
  }

  /**
   * Loads memory from the persistent database file
   */
  private loadMemory(): void {
    if (fs.existsSync(MEMORY_PATH)) {
      try {
        const data = fs.readFileSync(MEMORY_PATH, "utf-8");
        this.memory = JSON.parse(data);
      } catch (error) {
        console.warn("⚠️  Failed to load memory, starting fresh:", error);
        this.memory = [];
      }
    } else {
      this.memory = [];
    }
  }

  /**
   * Saves memory to the persistent database file
   */
  private saveMemory(): void {
    try {
      fs.mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
      fs.writeFileSync(MEMORY_PATH, JSON.stringify(this.memory, null, 2), "utf-8");
    } catch (error) {
      console.error("❌ Failed to save memory:", error);
    }
  }

  /**
   * Stores a new record of failure and correction
   * 
   * @param findings - List of issues/findings detected
   * @param fixSummary - Summary of the fix applied
   */
  public store(findings: string[], fixSummary: string): void {
    const entry: MemoryEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      findings,
      fixSummary,
    };

    this.memory.push(entry);
    this.saveMemory();
  }

  /**
   * Analyzes recurrent failure patterns
   * 
   * @returns List of patterns that occurred more than 2 times
   */
  public getRecurrentPatterns(): RecurrentPattern[] {
    const patternCount: Record<string, number> = {};

    for (const entry of this.memory) {
      for (const issue of entry.findings) {
        // Normalize the pattern by removing non-alphanumeric characters and converting to lowercase
        const key = issue.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        patternCount[key] = (patternCount[key] || 0) + 1;
      }
    }

    // Filter patterns that occurred more than 2 times
    return Object.entries(patternCount)
      .filter(([, count]) => count > 2)
      .map(([pattern, occurrences]) => ({ pattern, occurrences }));
  }

  /**
   * Returns the complete history, sorted by most recent first
   * 
   * @returns Array of memory entries sorted by ID (most recent first)
   */
  public getHistory(): MemoryEntry[] {
    return this.memory.sort((a, b) => b.id - a.id);
  }

  /**
   * Gets the total number of entries in memory
   */
  public getEntryCount(): number {
    return this.memory.length;
  }

  /**
   * Clears all memory (use with caution!)
   */
  public clear(): void {
    this.memory = [];
    this.saveMemory();
  }
}
