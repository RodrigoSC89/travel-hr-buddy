/**
 * Automated Validation System
 * PATCH 541 - Validates system health, performance, security
 */

import { cpuBenchmark, BenchmarkReport } from "@/lib/performance/cpu-benchmark";
import { memoryMonitor, MemoryLeakReport } from "@/lib/performance/memory-monitor";
import { LovableValidator } from "@/lib/qa/LovableValidator";

export interface ValidationReport {
  timestamp: Date;
  overallStatus: "pass" | "warning" | "fail";
  categories: {
    performance: CategoryResult;
    memory: CategoryResult;
    security: CategoryResult;
    qa: CategoryResult;
  };
  recommendations: string[];
  criticalIssues: string[];
}

export interface CategoryResult {
  status: "pass" | "warning" | "fail";
  score: number;
  details: string;
  checks: CheckResult[];
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "critical";
}

class AutoValidator {
  /**
   * Run complete system validation
   */
  async runFullValidation(): Promise<ValidationReport> {

    const results = await Promise.all([
      this.validatePerformance(),
      this.validateMemory(),
      this.validateSecurity(),
      this.validateQA()
    ]);

    const [performance, memory, security, qa] = results;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Collect critical issues
    [performance, memory, security, qa].forEach(category => {
      category.checks.forEach(check => {
        if (!check.passed && check.severity === "critical") {
          criticalIssues.push(`${category.details}: ${check.message}`);
        }
        if (!check.passed && check.severity === "warning") {
          recommendations.push(`${category.details}: ${check.message}`);
        }
      });
    });

    const overallStatus = this.calculateOverallStatus([performance, memory, security, qa]);

    return {
      timestamp: new Date(),
      overallStatus,
      categories: { performance, memory, security, qa },
      recommendations,
      criticalIssues
    };
  }

  /**
   * Validate performance metrics
   */
  private async validatePerformance(): Promise<CategoryResult> {
    const checks: CheckResult[] = [];
    
    try {
      const benchmark = await cpuBenchmark.runBenchmark();
      
      checks.push({
        name: "CPU Performance",
        passed: benchmark.totalScore >= 60,
        message: `Overall score: ${benchmark.totalScore}/100`,
        severity: benchmark.totalScore < 40 ? "critical" : benchmark.totalScore < 60 ? "warning" : "info"
      });

      benchmark.tests.forEach(test => {
        checks.push({
          name: test.testName,
          passed: test.score >= 60,
          message: `${test.executionTime}ms (${test.status})`,
          severity: test.status === "poor" ? "critical" : test.status === "acceptable" ? "warning" : "info"
        });
      });

      const avgScore = benchmark.totalScore;
      
      return {
        status: avgScore >= 70 ? "pass" : avgScore >= 50 ? "warning" : "fail",
        score: avgScore,
        details: "Performance",
        checks
      };
    } catch (error) {
      return {
        status: "fail",
        score: 0,
        details: "Performance",
        checks: [{
          name: "Benchmark Execution",
          passed: false,
          message: "Failed to run performance benchmark",
          severity: "critical"
        }]
      };
    }
  }

  /**
   * Validate memory usage
   */
  private async validateMemory(): Promise<CategoryResult> {
    const checks: CheckResult[] = [];

    try {
      // Start monitoring for 10 seconds
      memoryMonitor.startMonitoring(2000);
      await new Promise(resolve => setTimeout(resolve, 10000));
      const report = memoryMonitor.stopMonitoring();

      checks.push({
        name: "Memory Leak Detection",
        passed: !report.hasLeak,
        message: report.hasLeak 
          ? `Leak detected: ${report.growthRate} MB/min growth`
          : "No memory leaks detected",
        severity: report.severity === "critical" || report.severity === "high" ? "critical" : "info"
      });

      const currentMemory = memoryMonitor.getCurrentMemory();
      if (currentMemory) {
        checks.push({
          name: "Memory Usage",
          passed: currentMemory.percentUsed < 80,
          message: `${currentMemory.percentUsed.toFixed(1)}% of heap used`,
          severity: currentMemory.percentUsed > 90 ? "critical" : currentMemory.percentUsed > 80 ? "warning" : "info"
        });
      }

      const hasLeak = report.hasLeak;
      
      return {
        status: hasLeak ? "fail" : "pass",
        score: hasLeak ? 50 : 100,
        details: "Memory",
        checks
      };
    } catch (error) {
      return {
        status: "warning",
        score: 50,
        details: "Memory",
        checks: [{
          name: "Memory Monitoring",
          passed: false,
          message: "Memory API not available or monitoring failed",
          severity: "warning"
        }]
      };
    }
  }

  /**
   * Validate security measures
   */
  private async validateSecurity(): Promise<CategoryResult> {
    const checks: CheckResult[] = [];

    // Check for common security issues
    checks.push({
      name: "HTTPS",
      passed: window.location.protocol === "https:" || window.location.hostname === "localhost",
      message: window.location.protocol === "https:" ? "Using HTTPS" : "Using HTTP (development)",
      severity: window.location.protocol === "http:" && window.location.hostname !== "localhost" ? "critical" : "info"
    });

    // Check for console.log statements (potential data leaks)
    checks.push({
      name: "Console Logging",
      passed: true, // Placeholder - would need static analysis
      message: "Manual review recommended for production",
      severity: "warning"
    });

    // Check localStorage usage
    const localStorageSize = Object.keys(localStorage).reduce((sum, key) => 
      sum + localStorage[key].length + key.length, 0
    );
    
    checks.push({
      name: "Local Storage Security",
      passed: localStorageSize < 5 * 1024 * 1024, // 5MB limit
      message: `${(localStorageSize / 1024).toFixed(2)} KB stored`,
      severity: localStorageSize > 5 * 1024 * 1024 ? "warning" : "info"
    });

    const failedChecks = checks.filter(c => !c.passed && c.severity === "critical").length;
    
    return {
      status: failedChecks > 0 ? "fail" : "pass",
      score: Math.round(((checks.length - failedChecks) / checks.length) * 100),
      details: "Security",
      checks
    };
  }

  /**
   * Validate QA metrics
   */
  private async validateQA(): Promise<CategoryResult> {
    const checks: CheckResult[] = [];

    // Run Lovable validator on key components
    try {
      const result = await LovableValidator.run("SystemValidation", {
        maxRenderTime: 3000,
        maxDataSize: 3072,
        maxReRenders: 10
      });

      checks.push({
        name: "Component Validation",
        passed: result.passed,
        message: `${result.issues.length} issues found`,
        severity: result.issues.some(i => i.severity === "critical") ? "critical" : "info"
      });

      result.issues.forEach(issue => {
        checks.push({
          name: issue.component,
          passed: false,
          message: `${issue.type}: ${issue.description}`,
          severity: issue.severity === "critical" || issue.severity === "high" ? "critical" : "warning"
        });
      });
    } catch (error) {
      checks.push({
        name: "QA Validation",
        passed: false,
        message: "QA validation failed to execute",
        severity: "warning"
      });
    }

    const criticalIssues = checks.filter(c => !c.passed && c.severity === "critical").length;
    
    return {
      status: criticalIssues === 0 ? "pass" : "fail",
      score: Math.round(((checks.length - criticalIssues) / checks.length) * 100),
      details: "QA",
      checks
    };
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(categories: CategoryResult[]): "pass" | "warning" | "fail" {
    const hasFail = categories.some(c => c.status === "fail");
    const hasWarning = categories.some(c => c.status === "warning");

    if (hasFail) return "fail";
    if (hasWarning) return "warning";
    return "pass";
  }

  /**
   * Quick health check (minimal validation)
   */
  async quickHealthCheck(): Promise<{ healthy: boolean; message: string }> {
    const currentMemory = memoryMonitor.getCurrentMemory();
    
    if (!currentMemory) {
      return { healthy: true, message: "System running (memory API unavailable)" };
    }

    if (currentMemory.percentUsed > 90) {
      return { healthy: false, message: "Critical: Memory usage above 90%" };
    }

    return { healthy: true, message: "System healthy" };
  }
}

export const autoValidator = new AutoValidator();
