import fs from "fs";
import path from "path";

/**
 * 🧠 Nautilus Memory Engine
 * 
 * Registra, organiza e analisa histórico de falhas e correções.
 * Aprende com o comportamento passado do sistema e fornece insights preventivos.
 */

const MEMORY_PATH = path.resolve("src/ai/nautilus-core/memory/memoryDB.json");

export class MemoryEngine {
  constructor() {
    this.memory = [];
    this.loadMemory();
  }

  loadMemory() {
    if (fs.existsSync(MEMORY_PATH)) {
      const data = fs.readFileSync(MEMORY_PATH, "utf-8");
      this.memory = JSON.parse(data);
    } else {
      this.memory = [];
    }
  }

  saveMemory() {
    fs.mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(this.memory, null, 2));
  }

  /**
   * Armazena um novo registro de falha e correção.
   */
  store(findings, fixSummary) {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      findings,
      fixSummary,
    };

    this.memory.push(entry);
    this.saveMemory();
  }

  /**
   * Analisa padrões recorrentes de falhas.
   */
  getRecurrentPatterns() {
    const patternCount = {};

    for (const entry of this.memory) {
      for (const issue of entry.findings) {
        const key = issue.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        patternCount[key] = (patternCount[key] || 0) + 1;
      }
    }

    return Object.entries(patternCount)
      .filter(([_, count]) => count > 2)
      .map(([pattern, count]) => ({ pattern, occurrences: count }));
  }

  /**
   * Retorna o histórico completo.
   */
  getHistory() {
    return this.memory.sort((a, b) => b.id - a.id);
  }
}
