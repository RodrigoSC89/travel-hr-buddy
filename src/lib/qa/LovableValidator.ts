/**
 * Lovable Preview QA Validator
 * PATCH 624 - Sistema de validação para módulos React em preview
 */

import { logger } from "@/lib/logger";

interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
  warnings: string[];
  performance: PerformanceMetrics;
}

interface ValidationIssue {
  severity: "critical" | "high" | "medium" | "low";
  type: "infinite-loop" | "memory-leak" | "heavy-data" | "missing-fallback" | "console-spam";
  component: string;
  description: string;
  fix?: string;
}

interface PerformanceMetrics {
  renderTime: number;
  dataSize: number;
  memoryUsage?: number;
  reRenderCount: number;
}

class LovableValidatorClass {
  private renderCounts = new Map<string, number>();
  private lastRenderTime = new Map<string, number>();
  private intervals = new Set<number>();
  private issues: ValidationIssue[] = [];
  private warnings: string[] = [];

  /**
   * Executa validação completa de módulo
   */
  async run(componentName: string, options?: {
    maxRenderTime?: number;
    maxDataSize?: number;
    maxReRenders?: number;
  }): Promise<ValidationResult> {
    logger.info(`[LovableValidator] Iniciando validação para ${componentName}`);
    
    const startTime = performance.now();
    this.issues = [];
    this.warnings = [];

    const defaultOptions = {
      maxRenderTime: 3000,
      maxDataSize: 3072, // 3KB
      maxReRenders: 10,
      ...options
    };

    // 1. Verifica loops infinitos de render
    this.checkInfiniteRenderLoop(componentName, defaultOptions.maxReRenders);

    // 2. Verifica performance de renderização
    const renderTime = this.checkRenderPerformance(componentName, defaultOptions.maxRenderTime);

    // 3. Verifica tamanho de dados mockados
    const dataSize = this.checkMockedDataSize(defaultOptions.maxDataSize);

    // 4. Verifica intervals não limpos
    this.checkUncleanedIntervals();

    // 5. Verifica console.error spam
    this.checkConsoleSpam();

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    const passed = this.issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0;

    const result: ValidationResult = {
      passed,
      issues: this.issues,
      warnings: this.warnings,
      performance: {
        renderTime,
        dataSize,
        reRenderCount: this.renderCounts.get(componentName) || 0,
        memoryUsage: this.getMemoryUsage()
      }
    };

    logger.info(`[LovableValidator] Validação concluída`, { duration: `${totalTime.toFixed(2)}ms` });
    logger.info(`[LovableValidator] Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
    logger.debug(`[LovableValidator] Resultados`, { issues: this.issues.length, warnings: this.warnings.length });

    return result;
  }

  /**
   * Rastreia renders de componente
   */
  trackRender(componentName: string) {
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);
    this.lastRenderTime.set(componentName, Date.now());

    // Detecta re-renders em loop (mais de 5 renders em 1 segundo)
    if (currentCount > 5) {
      const firstRenderTime = this.lastRenderTime.get(componentName) || Date.now();
      const timeDiff = Date.now() - firstRenderTime;
      
      if (timeDiff < 1000) {
        this.addIssue({
          severity: "critical",
          type: "infinite-loop",
          component: componentName,
          description: `Detectado loop infinito: ${currentCount} renders em ${timeDiff}ms`,
          fix: "Verifique useEffect dependencies e atualizações de estado"
        });
      }
    }
  }

  /**
   * Registra interval para tracking de cleanup
   */
  registerInterval(intervalId: number) {
    this.intervals.add(intervalId);
  }

  /**
   * Remove interval do tracking
   */
  clearInterval(intervalId: number) {
    this.intervals.delete(intervalId);
  }

  /**
   * Aplica modo preview-safe ao componente
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic component shape
  applyPreviewSafeMode(component: Record<string, unknown>) {
    return {
      ...component,
      __previewSafe: true,
      __maxDataSize: 3072,
      __fallbackEnabled: true,
      __consoleErrorsSilenced: true
    };
  }

  /**
   * Valida dados mockados
   */
  validateMockedData(data: unknown, maxSize = 3072): { valid: boolean; size: number; issues: string[] } {
    const dataString = JSON.stringify(data);
    const size = new Blob([dataString]).size;
    const issues: string[] = [];

    if (size > maxSize) {
      issues.push(`Dados excedem ${maxSize} bytes: ${size} bytes`);
    }

    // Verifica nested depth excessivo
    const depth = this.getObjectDepth(data);
    if (depth > 5) {
      issues.push(`Profundidade de objeto muito alta: ${depth} níveis`);
    }

    // Verifica arrays muito grandes
    if (Array.isArray(data) && data.length > 100) {
      issues.push(`Array muito grande: ${data.length} items (máximo recomendado: 100)`);
    }

    return {
      valid: issues.length === 0,
      size,
      issues
    };
  }

  /**
   * Cria dados mockados leves para preview
   */
  createLightweightMock<T>(template: T, count = 5): T[] {
    const items: T[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      items.push({ ...template, id: `mock-${i}` } as T);
    }
    return items;
  }

  // Private methods

  private checkInfiniteRenderLoop(componentName: string, maxReRenders: number) {
    const renderCount = this.renderCounts.get(componentName) || 0;
    
    if (renderCount > maxReRenders) {
      this.addIssue({
        severity: "critical",
        type: "infinite-loop",
        component: componentName,
        description: `Componente renderizou ${renderCount} vezes (limite: ${maxReRenders})`,
        fix: "Adicione dependências corretas ao useEffect ou use useCallback/useMemo"
      });
    }
  }

  private checkRenderPerformance(componentName: string, maxRenderTime: number): number {
    const renderTime = performance.now();
    
    if (renderTime > maxRenderTime) {
      this.addIssue({
        severity: "high",
        type: "memory-leak",
        component: componentName,
        description: `Render time excedeu ${maxRenderTime}ms: ${renderTime.toFixed(2)}ms`,
        fix: "Otimize computações pesadas com useMemo e divida componente"
      });
    }

    return renderTime;
  }

  private checkMockedDataSize(maxDataSize: number): number {
    // Estima tamanho de dados no localStorage/sessionStorage
    let totalSize = 0;
    
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      if (totalSize > maxDataSize) {
        this.addIssue({
          severity: "medium",
          type: "heavy-data",
          component: "Global",
          description: `Dados mockados excedem ${maxDataSize} bytes: ${totalSize} bytes`,
          fix: "Reduza quantidade de dados mockados ou use paginação"
        });
      }
    } catch {
      this.warnings.push("Não foi possível verificar tamanho de dados mockados");
    }

    return totalSize;
  }

  private checkUncleanedIntervals() {
    if (this.intervals.size > 0) {
      this.addIssue({
        severity: "high",
        type: "memory-leak",
        component: "Global",
        description: `${this.intervals.size} intervals não foram limpos`,
        fix: "Use clearInterval no cleanup do useEffect"
      });
    }
  }

  private checkConsoleSpam() {
    // Hook into console.error to detect spam
    // Este é um placeholder - implementação real requer override de console
    this.warnings.push("Console spam check não implementado (requer override de console)");
  }

  private getMemoryUsage(): number | undefined {
    const perfWithMemory = performance as unknown as { memory?: { usedJSHeapSize: number } };
    if (perfWithMemory.memory) {
      return perfWithMemory.memory.usedJSHeapSize;
    }
    return undefined;
  }

  private getObjectDepth(obj: unknown, depth = 0): number {
    if (obj === null || typeof obj !== "object") return depth;
    
    const depths = Object.values(obj).map(value => 
      this.getObjectDepth(value, depth + 1)
    );
    
    return depths.length > 0 ? Math.max(...depths) : depth;
  }

  private addIssue(issue: ValidationIssue) {
    this.issues.push(issue);
    
    const emoji = issue.severity === "critical" ? "🔴" : 
      issue.severity === "high" ? "🟠" : 
        issue.severity === "medium" ? "🟡" : "🟢";
    
    logger.warn(`${emoji} [${issue.severity.toUpperCase()}] ${issue.component}: ${issue.description}`);
    if (issue.fix) {
      logger.debug(`   💡 Fix: ${issue.fix}`);
    }
  }

  /**
   * Reset validator state
   */
  reset() {
    this.renderCounts.clear();
    this.lastRenderTime.clear();
    this.intervals.clear();
    this.issues = [];
    this.warnings = [];
  }
}

// Singleton instance
export const LovableValidator = new LovableValidatorClass();

// Export types
export type { ValidationResult, ValidationIssue, PerformanceMetrics };
