/**
 * System Benchmark - PATCH 970
 * Embedded performance benchmark with automatic diagnostics
 */

export interface BenchmarkResult {
  score: number;
  status: "excellent" | "good" | "fair" | "critical";
  details: {
    diskRead: { time: number; score: number };
    diskWrite: { time: number; score: number };
    memory: { usage: number; score: number };
    cpu: { time: number; score: number };
    network: { latency: number; score: number };
    aiResponse: { time: number; score: number };
    rendering: { fps: number; score: number };
  };
  recommendations: string[];
  timestamp: number;
}

class SystemBenchmark {
  private readonly STORAGE_KEY = "system_benchmark_history";
  private readonly MAX_HISTORY = 10;

  async runFullBenchmark(): Promise<BenchmarkResult> {
    
    const [
      diskRead,
      diskWrite,
      memory,
      cpu,
      network,
      aiResponse,
      rendering
    ] = await Promise.all([
      this.benchmarkDiskRead(),
      this.benchmarkDiskWrite(),
      this.benchmarkMemory(),
      this.benchmarkCPU(),
      this.benchmarkNetwork(),
      this.benchmarkAIResponse(),
      this.benchmarkRendering()
    ]);

    const totalScore = Math.round(
      (diskRead.score + diskWrite.score + memory.score + cpu.score + 
       network.score + aiResponse.score + rendering.score) / 7
    );

    const status = this.getStatusFromScore(totalScore);
    const recommendations = this.generateRecommendations({
      diskRead, diskWrite, memory, cpu, network, aiResponse, rendering
    });

    const result: BenchmarkResult = {
      score: totalScore,
      status,
      details: { diskRead, diskWrite, memory, cpu, network, aiResponse, rendering },
      recommendations,
      timestamp: Date.now()
    });

    this.saveResult(result);
    
    return result;
  }

  private async benchmarkDiskRead(): Promise<{ time: number; score: number }> {
    const testData = "x".repeat(100000); // 100KB test
    const key = "benchmark_read_test";
    
    try {
      localStorage.setItem(key, testData);
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        localStorage.getItem(key);
      }
      
      const time = performance.now() - start;
      localStorage.removeItem(key);
      
      // Score: <50ms = 100, >500ms = 0
      const score = Math.max(0, Math.min(100, Math.round(100 - (time / 5))));
      return { time: Math.round(time), score };
    } catch {
      return { time: 9999, score: 0 };
    }
  }

  private async benchmarkDiskWrite(): Promise<{ time: number; score: number }> {
    const testData = "x".repeat(10000); // 10KB per write
    
    try {
      const start = performance.now();
      
      for (let i = 0; i < 50; i++) {
        localStorage.setItem(`benchmark_write_${i}`, testData);
      }
      
      const time = performance.now() - start;
      
      // Cleanup
      for (let i = 0; i < 50; i++) {
        localStorage.removeItem(`benchmark_write_${i}`);
      }
      
      const score = Math.max(0, Math.min(100, Math.round(100 - (time / 10))));
      return { time: Math.round(time), score };
    } catch {
      return { time: 9999, score: 0 };
    }
  }

  private benchmarkMemory(): { usage: number; score: number } {
    const perf = performance as any;
    if (perf.memory) {
      const usage = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
      // Lower usage = higher score
      const score = Math.round((1 - usage) * 100);
      return { usage: Math.round(usage * 100), score };
    }
    return { usage: 50, score: 50 }; // Default if API unavailable
  }

  private async benchmarkCPU(): Promise<{ time: number; score: number }> {
    const start = performance.now();
    
    // CPU-intensive task: prime number calculation
    let count = 0;
    for (let i = 2; i < 50000; i++) {
      let isPrime = true;
      for (let j = 2; j <= Math.sqrt(i); j++) {
        if (i % j === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) count++;
    }
    
    const time = performance.now() - start;
    // Score: <200ms = 100, >2000ms = 0
    const score = Math.max(0, Math.min(100, Math.round(100 - (time / 20))));
    return { time: Math.round(time), score };
  }

  private async benchmarkNetwork(): Promise<{ latency: number; score: number }> {
    if (!navigator.onLine) {
      return { latency: 9999, score: 0 };
    }
    
    try {
      const start = performance.now();
      await fetch("/manifest.json", { method: "HEAD", cache: "no-store" });
      const latency = performance.now() - start;
      
      // Score: <100ms = 100, >1000ms = 0
      const score = Math.max(0, Math.min(100, Math.round(100 - (latency / 10))));
      return { latency: Math.round(latency), score };
    } catch {
      return { latency: 9999, score: 10 }; // Offline but give minimal score
    }
  }

  private async benchmarkAIResponse(): Promise<{ time: number; score: number }> {
    const start = performance.now();
    
    // Simulate AI processing (local context lookup)
    const testPrompt = "Teste de performance do sistema";
    const tokens = testPrompt.split(" ");
    
    // Simulate tokenization and basic processing
    for (let i = 0; i < 1000; i++) {
      tokens.map(t => t.toLowerCase().trim());
    }
    
    const time = performance.now() - start;
    const score = Math.max(0, Math.min(100, Math.round(100 - (time / 5))));
    return { time: Math.round(time), score };
  }

  private async benchmarkRendering(): Promise<{ fps: number; score: number }> {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const countFrame = () => {
        frames++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = frames;
          const score = Math.min(100, Math.round((fps / 60) * 100));
          resolve({ fps, score });
        }
      };
      
      requestAnimationFrame(countFrame);
    });
  }

  private getStatusFromScore(score: number): BenchmarkResult["status"] {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "fair";
    return "critical";
  }

  private generateRecommendations(details: BenchmarkResult["details"]): string[] {
    const recommendations: string[] = [];
    
    if (details.memory.score < 50) {
      recommendations.push("Limpe o cache do navegador e feche abas não utilizadas");
    }
    if (details.diskRead.score < 50 || details.diskWrite.score < 50) {
      recommendations.push("Execute limpeza de dados antigos no sistema");
    }
    if (details.cpu.score < 50) {
      recommendations.push("Feche aplicações em segundo plano para liberar CPU");
    }
    if (details.network.score < 30) {
      recommendations.push("Conexão lenta detectada - ative o modo offline");
    }
    if (details.rendering.score < 50) {
      recommendations.push("Desative animações para melhorar performance");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Sistema operando em condições ideais");
    }
    
    return recommendations;
  }

  private saveResult(result: BenchmarkResult): void {
    try {
      const history = this.getHistory();
      history.unshift(result);
      if (history.length > this.MAX_HISTORY) {
        history.pop();
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("[Benchmark] Failed to save result:", e);
      console.warn("[Benchmark] Failed to save result:", e);
    }
  }

  getHistory(): BenchmarkResult[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  getLastResult(): BenchmarkResult | null {
    const history = this.getHistory();
    return history[0] || null;
  }
}

export const systemBenchmark = new SystemBenchmark();
