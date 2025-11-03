/**
 * CPU Benchmark Utility
 * PATCH 541 Phase 3 - Performance Validation
 */

export interface BenchmarkResult {
  testName: string;
  executionTime: number;
  operationsPerSecond: number;
  score: number;
  status: "excellent" | "good" | "acceptable" | "poor";
}

export interface BenchmarkReport {
  timestamp: Date;
  totalScore: number;
  tests: BenchmarkResult[];
  systemInfo: {
    userAgent: string;
    cores: number;
    memory: number;
  };
}

class CPUBenchmark {
  /**
   * Run complete benchmark suite
   */
  async runBenchmark(): Promise<BenchmarkReport> {
    const tests: BenchmarkResult[] = [];

    // Test 1: Array operations
    tests.push(await this.benchmarkArrayOperations());

    // Test 2: Object manipulation
    tests.push(await this.benchmarkObjectOperations());

    // Test 3: String processing
    tests.push(await this.benchmarkStringOperations());

    // Test 4: Mathematical calculations
    tests.push(await this.benchmarkMathOperations());

    // Test 5: DOM operations (React-specific)
    tests.push(await this.benchmarkDOMOperations());

    const totalScore = tests.reduce((sum, test) => sum + test.score, 0) / tests.length;

    return {
      timestamp: new Date(),
      totalScore: Math.round(totalScore),
      tests,
      systemInfo: this.getSystemInfo()
    };
  }

  /**
   * Benchmark array operations
   */
  private async benchmarkArrayOperations(): Promise<BenchmarkResult> {
    const iterations = 100000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const arr = Array.from({ length: 100 }, (_, idx) => idx);
      arr.map(x => x * 2).filter(x => x % 2 === 0).reduce((acc, x) => acc + x, 0);
    }

    const executionTime = performance.now() - startTime;
    const opsPerSecond = Math.round((iterations / executionTime) * 1000);
    
    return {
      testName: "Array Operations",
      executionTime: Math.round(executionTime),
      operationsPerSecond: opsPerSecond,
      score: this.calculateScore(executionTime, 500),
      status: this.getStatus(executionTime, 500)
    };
  }

  /**
   * Benchmark object operations
   */
  private async benchmarkObjectOperations(): Promise<BenchmarkResult> {
    const iterations = 50000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const cloned = { ...obj };
      Object.keys(cloned).forEach(key => {
        cloned[key] = cloned[key] * 2;
      });
      JSON.stringify(cloned);
    }

    const executionTime = performance.now() - startTime;
    const opsPerSecond = Math.round((iterations / executionTime) * 1000);

    return {
      testName: "Object Operations",
      executionTime: Math.round(executionTime),
      operationsPerSecond: opsPerSecond,
      score: this.calculateScore(executionTime, 300),
      status: this.getStatus(executionTime, 300)
    };
  }

  /**
   * Benchmark string operations
   */
  private async benchmarkStringOperations(): Promise<BenchmarkResult> {
    const iterations = 50000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const str = "Hello World Testing Performance Benchmark";
      str.split(" ").map(s => s.toUpperCase()).join("-").toLowerCase().repeat(2);
    }

    const executionTime = performance.now() - startTime;
    const opsPerSecond = Math.round((iterations / executionTime) * 1000);

    return {
      testName: "String Operations",
      executionTime: Math.round(executionTime),
      operationsPerSecond: opsPerSecond,
      score: this.calculateScore(executionTime, 200),
      status: this.getStatus(executionTime, 200)
    };
  }

  /**
   * Benchmark math operations
   */
  private async benchmarkMathOperations(): Promise<BenchmarkResult> {
    const iterations = 100000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      Math.sqrt(i) * Math.PI / Math.E + Math.sin(i) - Math.cos(i);
    }

    const executionTime = performance.now() - startTime;
    const opsPerSecond = Math.round((iterations / executionTime) * 1000);

    return {
      testName: "Math Operations",
      executionTime: Math.round(executionTime),
      operationsPerSecond: opsPerSecond,
      score: this.calculateScore(executionTime, 100),
      status: this.getStatus(executionTime, 100)
    };
  }

  /**
   * Benchmark DOM operations (simulated)
   */
  private async benchmarkDOMOperations(): Promise<BenchmarkResult> {
    const iterations = 10000;
    const startTime = performance.now();

    const container = document.createElement("div");
    document.body.appendChild(container);

    for (let i = 0; i < iterations; i++) {
      const element = document.createElement("div");
      element.textContent = `Test ${i}`;
      element.className = "test-class";
      container.appendChild(element);
      if (i % 100 === 0) {
        container.innerHTML = ""; // Clear periodically
      }
    }

    document.body.removeChild(container);

    const executionTime = performance.now() - startTime;
    const opsPerSecond = Math.round((iterations / executionTime) * 1000);

    return {
      testName: "DOM Operations",
      executionTime: Math.round(executionTime),
      operationsPerSecond: opsPerSecond,
      score: this.calculateScore(executionTime, 800),
      status: this.getStatus(executionTime, 800)
    };
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculateScore(executionTime: number, baseline: number): number {
    const ratio = baseline / executionTime;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  }

  /**
   * Determine status based on execution time
   */
  private getStatus(
    executionTime: number,
    baseline: number
  ): "excellent" | "good" | "acceptable" | "poor" {
    const ratio = executionTime / baseline;
    
    if (ratio <= 0.7) return "excellent";
    if (ratio <= 1.0) return "good";
    if (ratio <= 1.5) return "acceptable";
    return "poor";
  }

  /**
   * Get system information
   */
  private getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      cores: navigator.hardwareConcurrency || 1,
      memory: (performance as any).memory?.jsHeapSizeLimit 
        ? Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        : 0
    };
  }
}

export const cpuBenchmark = new CPUBenchmark();
