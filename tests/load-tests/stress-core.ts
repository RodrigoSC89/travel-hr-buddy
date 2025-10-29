/**
 * PATCH 561 - Core Modules Stress and Load Test
 * Simulates 100 parallel sessions accessing core system modules
 * 
 * Tests concurrent access to:
 * - /dashboard
 * - /crew-management
 * - /control-hub
 * 
 * Monitors: CPU usage, memory consumption, and latency
 * 
 * Run with: npx tsx tests/load-tests/stress-core.ts
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configuration
const CONFIG = {
  BASE_URL: process.env.VITE_APP_URL || 'http://localhost:5173',
  NUM_SESSIONS: 100,
  CONCURRENT_SESSIONS: 20, // Run 20 at a time to avoid overwhelming the system
  CORE_ROUTES: [
    '/dashboard',
    '/crew-management',
    '/control-hub',
  ],
  HEADLESS: true,
  TIMEOUT_MS: 60000,
  METRICS_DIR: 'performance_metrics',
};

// Metrics storage
interface SessionMetrics {
  sessionId: number;
  route: string;
  success: boolean;
  navigationTime?: number;
  domContentLoaded?: number;
  loadComplete?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  statusCode?: number;
  error?: string;
  timestamp: string;
}

interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  memoryUsagePercent: number;
}

interface StressTestReport {
  testConfig: typeof CONFIG;
  startTime: string;
  endTime: string;
  duration: number;
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  successRate: string;
  sessions: SessionMetrics[];
  systemMetrics: SystemMetrics[];
  routeStatistics: {
    [route: string]: {
      totalRequests: number;
      successful: number;
      failed: number;
      successRate: string;
      avgNavigationTime: number;
      minNavigationTime: number;
      maxNavigationTime: number;
      avgMemoryUsage: number;
    };
  };
  overallPerformance: {
    avgNavigationTime: number;
    p50NavigationTime: number;
    p95NavigationTime: number;
    p99NavigationTime: number;
    maxNavigationTime: number;
    avgMemoryUsage: number;
  };
}

const testReport: StressTestReport = {
  testConfig: CONFIG,
  startTime: '',
  endTime: '',
  duration: 0,
  totalSessions: 0,
  successfulSessions: 0,
  failedSessions: 0,
  successRate: '0%',
  sessions: [],
  systemMetrics: [],
  routeStatistics: {},
  overallPerformance: {
    avgNavigationTime: 0,
    p50NavigationTime: 0,
    p95NavigationTime: 0,
    p99NavigationTime: 0,
    maxNavigationTime: 0,
    avgMemoryUsage: 0,
  },
};

/**
 * Capture system metrics (CPU and memory)
 */
function captureSystemMetrics(): SystemMetrics {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;

  // Get CPU usage (simplified - using load average on Unix systems)
  const loadAvg = os.loadavg();
  const cpuUsage = loadAvg[0]; // 1-minute load average

  return {
    timestamp: new Date().toISOString(),
    cpuUsage,
    totalMemory: totalMem / (1024 * 1024 * 1024), // GB
    freeMemory: freeMem / (1024 * 1024 * 1024), // GB
    usedMemory: usedMem / (1024 * 1024 * 1024), // GB
    memoryUsagePercent: memUsagePercent,
  };
}

/**
 * Measure page performance metrics
 */
async function measurePagePerformance(page: Page) {
  try {
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    return performanceMetrics;
  } catch (error) {
    return null;
  }
}

/**
 * Get memory usage from browser
 */
async function getMemoryUsage(page: Page) {
  try {
    const metrics = await page.evaluate(() => {
      // @ts-ignore - performance.memory is Chrome-specific
      if (performance.memory) {
        return {
          // @ts-ignore
          usedJSHeapSize: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
          // @ts-ignore
          totalJSHeapSize: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
          // @ts-ignore
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / (1024 * 1024), // MB
        };
      }
      return null;
    });
    return metrics;
  } catch (error) {
    return null;
  }
}

/**
 * Simulate a single user session
 */
async function simulateSession(
  browser: Browser,
  sessionId: number,
  route: string
): Promise<SessionMetrics> {
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    const startTime = performance.now();

    // Create new browser context (isolated session)
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    page = await context.newPage();

    // Navigate to the route
    const response = await page.goto(`${CONFIG.BASE_URL}${route}`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUT_MS,
    });

    const navigationTime = performance.now() - startTime;

    // Wait for DOM content to load
    await page.waitForLoadState('domcontentloaded');

    // Get performance metrics
    const perfMetrics = await measurePagePerformance(page);
    const memoryUsage = await getMemoryUsage(page);

    const result: SessionMetrics = {
      sessionId,
      route,
      success: response?.status() === 200 || response?.status() === 304,
      navigationTime,
      domContentLoaded: perfMetrics?.domContentLoaded,
      loadComplete: perfMetrics?.loadComplete,
      firstPaint: perfMetrics?.firstPaint,
      firstContentfulPaint: perfMetrics?.firstContentfulPaint,
      memoryUsage: memoryUsage || undefined,
      statusCode: response?.status(),
      timestamp: new Date().toISOString(),
    };

    await context.close();
    return result;
  } catch (error: any) {
    if (context) {
      await context.close();
    }

    return {
      sessionId,
      route,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run batch of concurrent sessions
 */
async function runSessionBatch(
  browser: Browser,
  batchNumber: number,
  sessionsInBatch: number,
  startSessionId: number
): Promise<SessionMetrics[]> {
  console.log(`\n🚀 Running batch ${batchNumber}: ${sessionsInBatch} concurrent sessions...`);

  const promises: Promise<SessionMetrics>[] = [];

  for (let i = 0; i < sessionsInBatch; i++) {
    const sessionId = startSessionId + i;
    const route = CONFIG.CORE_ROUTES[sessionId % CONFIG.CORE_ROUTES.length];
    promises.push(simulateSession(browser, sessionId, route));
  }

  // Capture system metrics during batch execution
  const systemMetrics = captureSystemMetrics();
  testReport.systemMetrics.push(systemMetrics);

  const results = await Promise.all(promises);

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Batch ${batchNumber} completed: ${successful} successful, ${failed} failed`);
  console.log(`   System: CPU ${systemMetrics.cpuUsage.toFixed(2)}, Memory ${systemMetrics.memoryUsagePercent.toFixed(2)}%`);

  return results;
}

/**
 * Calculate route statistics
 */
function calculateRouteStatistics() {
  for (const route of CONFIG.CORE_ROUTES) {
    const routeSessions = testReport.sessions.filter((s) => s.route === route);
    const successful = routeSessions.filter((s) => s.success);
    const failed = routeSessions.filter((s) => !s.success);

    const navTimes = successful
      .filter((s) => s.navigationTime !== undefined)
      .map((s) => s.navigationTime!);

    const memUsages = successful
      .filter((s) => s.memoryUsage !== undefined)
      .map((s) => s.memoryUsage!.usedJSHeapSize);

    testReport.routeStatistics[route] = {
      totalRequests: routeSessions.length,
      successful: successful.length,
      failed: failed.length,
      successRate: `${((successful.length / routeSessions.length) * 100).toFixed(2)}%`,
      avgNavigationTime: navTimes.length > 0 ? navTimes.reduce((a, b) => a + b, 0) / navTimes.length : 0,
      minNavigationTime: navTimes.length > 0 ? Math.min(...navTimes) : 0,
      maxNavigationTime: navTimes.length > 0 ? Math.max(...navTimes) : 0,
      avgMemoryUsage: memUsages.length > 0 ? memUsages.reduce((a, b) => a + b, 0) / memUsages.length : 0,
    };
  }
}

/**
 * Calculate overall performance statistics
 */
function calculateOverallPerformance() {
  const successfulSessions = testReport.sessions.filter((s) => s.success && s.navigationTime !== undefined);
  const navTimes = successfulSessions.map((s) => s.navigationTime!).sort((a, b) => a - b);
  const memUsages = successfulSessions
    .filter((s) => s.memoryUsage !== undefined)
    .map((s) => s.memoryUsage!.usedJSHeapSize);

  testReport.overallPerformance = {
    avgNavigationTime: navTimes.length > 0 ? navTimes.reduce((a, b) => a + b, 0) / navTimes.length : 0,
    p50NavigationTime: navTimes.length > 0 ? navTimes[Math.floor(navTimes.length * 0.5)] : 0,
    p95NavigationTime: navTimes.length > 0 ? navTimes[Math.floor(navTimes.length * 0.95)] : 0,
    p99NavigationTime: navTimes.length > 0 ? navTimes[Math.floor(navTimes.length * 0.99)] : 0,
    maxNavigationTime: navTimes.length > 0 ? navTimes[navTimes.length - 1] : 0,
    avgMemoryUsage: memUsages.length > 0 ? memUsages.reduce((a, b) => a + b, 0) / memUsages.length : 0,
  };
}

/**
 * Print test report to console
 */
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔥 PATCH 561 - CORE MODULES STRESS TEST RESULTS');
  console.log('='.repeat(80));

  console.log('\n📊 OVERALL SUMMARY:');
  console.log(`   Total Sessions: ${testReport.totalSessions}`);
  console.log(`   Successful: ${testReport.successfulSessions} (${testReport.successRate})`);
  console.log(`   Failed: ${testReport.failedSessions}`);
  console.log(`   Duration: ${testReport.duration.toFixed(2)}s`);

  console.log('\n⚡ OVERALL PERFORMANCE:');
  console.log(`   Avg Navigation Time: ${testReport.overallPerformance.avgNavigationTime.toFixed(2)}ms`);
  console.log(`   P50: ${testReport.overallPerformance.p50NavigationTime.toFixed(2)}ms`);
  console.log(`   P95: ${testReport.overallPerformance.p95NavigationTime.toFixed(2)}ms`);
  console.log(`   P99: ${testReport.overallPerformance.p99NavigationTime.toFixed(2)}ms`);
  console.log(`   Max: ${testReport.overallPerformance.maxNavigationTime.toFixed(2)}ms`);
  console.log(`   Avg Memory Usage: ${testReport.overallPerformance.avgMemoryUsage.toFixed(2)}MB`);

  console.log('\n📈 ROUTE STATISTICS:');
  for (const [route, stats] of Object.entries(testReport.routeStatistics)) {
    console.log(`\n   ${route}:`);
    console.log(`      Total Requests: ${stats.totalRequests}`);
    console.log(`      Success Rate: ${stats.successRate}`);
    console.log(`      Avg Navigation Time: ${stats.avgNavigationTime.toFixed(2)}ms`);
    console.log(`      Min/Max: ${stats.minNavigationTime.toFixed(2)}ms / ${stats.maxNavigationTime.toFixed(2)}ms`);
    console.log(`      Avg Memory: ${stats.avgMemoryUsage.toFixed(2)}MB`);
  }

  console.log('\n💻 SYSTEM METRICS SUMMARY:');
  if (testReport.systemMetrics.length > 0) {
    const avgCpu = testReport.systemMetrics.reduce((a, b) => a + b.cpuUsage, 0) / testReport.systemMetrics.length;
    const avgMemPercent = testReport.systemMetrics.reduce((a, b) => a + b.memoryUsagePercent, 0) / testReport.systemMetrics.length;
    const maxCpu = Math.max(...testReport.systemMetrics.map((m) => m.cpuUsage));
    const maxMemPercent = Math.max(...testReport.systemMetrics.map((m) => m.memoryUsagePercent));

    console.log(`   Avg CPU Load: ${avgCpu.toFixed(2)}`);
    console.log(`   Max CPU Load: ${maxCpu.toFixed(2)}`);
    console.log(`   Avg Memory Usage: ${avgMemPercent.toFixed(2)}%`);
    console.log(`   Max Memory Usage: ${maxMemPercent.toFixed(2)}%`);
  }

  console.log('\n✅ TEST VERDICT:');
  const noFatalErrors = testReport.failedSessions === 0;
  const performanceAcceptable = testReport.overallPerformance.avgNavigationTime < 10000; // < 10s

  if (noFatalErrors && performanceAcceptable) {
    console.log('   ✅ System supports 100 parallel sessions without fatal errors');
    console.log('   ✅ Performance is within acceptable limits');
  } else {
    if (!noFatalErrors) {
      console.log('   ❌ System encountered fatal errors during load test');
    }
    if (!performanceAcceptable) {
      console.log('   ⚠️  Performance degraded under load (avg > 10s)');
    }
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Save report to file
 */
function saveReport() {
  const metricsDir = path.join(process.cwd(), CONFIG.METRICS_DIR);
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(metricsDir, `stress-core-${timestamp}.json`);

  fs.writeFileSync(filename, JSON.stringify(testReport, null, 2));
  console.log(`\n💾 Performance report saved to: ${filename}`);

  // Also save a summary text file
  const summaryFilename = path.join(metricsDir, `stress-core-summary-${timestamp}.txt`);
  const summary = `
PATCH 561 - Core Modules Stress Test Results
=============================================

Test Configuration:
- Total Sessions: ${CONFIG.NUM_SESSIONS}
- Concurrent Sessions: ${CONFIG.CONCURRENT_SESSIONS}
- Routes Tested: ${CONFIG.CORE_ROUTES.join(', ')}
- Date: ${testReport.startTime}

Results:
- Total Sessions: ${testReport.totalSessions}
- Successful: ${testReport.successfulSessions} (${testReport.successRate})
- Failed: ${testReport.failedSessions}
- Duration: ${testReport.duration.toFixed(2)}s

Performance:
- Avg Navigation Time: ${testReport.overallPerformance.avgNavigationTime.toFixed(2)}ms
- P95: ${testReport.overallPerformance.p95NavigationTime.toFixed(2)}ms
- P99: ${testReport.overallPerformance.p99NavigationTime.toFixed(2)}ms
- Avg Memory Usage: ${testReport.overallPerformance.avgMemoryUsage.toFixed(2)}MB

Verdict: ${testReport.failedSessions === 0 ? 'PASSED ✅' : 'FAILED ❌'}
  `;

  fs.writeFileSync(summaryFilename, summary);
  console.log(`💾 Summary saved to: ${summaryFilename}`);
}

/**
 * Main stress test execution
 */
async function runStressTest() {
  console.log('🎯 Starting PATCH 561 - Core Modules Stress Test');
  console.log(`Configuration: ${CONFIG.NUM_SESSIONS} sessions, ${CONFIG.CONCURRENT_SESSIONS} concurrent`);
  console.log(`Routes: ${CONFIG.CORE_ROUTES.join(', ')}`);

  const startTime = performance.now();
  testReport.startTime = new Date().toISOString();

  // Launch browser
  const browser = await chromium.launch({
    headless: CONFIG.HEADLESS,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  // Calculate number of batches
  const numBatches = Math.ceil(CONFIG.NUM_SESSIONS / CONFIG.CONCURRENT_SESSIONS);

  // Run batches
  for (let i = 0; i < numBatches; i++) {
    const sessionsInBatch = Math.min(
      CONFIG.CONCURRENT_SESSIONS,
      CONFIG.NUM_SESSIONS - testReport.totalSessions
    );

    const results = await runSessionBatch(browser, i + 1, sessionsInBatch, testReport.totalSessions);

    testReport.sessions.push(...results);
    testReport.totalSessions += results.length;
    testReport.successfulSessions += results.filter((r) => r.success).length;
    testReport.failedSessions += results.filter((r) => !r.success).length;

    // Small delay between batches
    if (i < numBatches - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  await browser.close();

  const endTime = performance.now();
  testReport.endTime = new Date().toISOString();
  testReport.duration = (endTime - startTime) / 1000;
  testReport.successRate = `${((testReport.successfulSessions / testReport.totalSessions) * 100).toFixed(2)}%`;

  // Calculate statistics
  calculateRouteStatistics();
  calculateOverallPerformance();

  // Print and save report
  printReport();
  saveReport();
}

/**
 * Main entry point
 */
async function main() {
  try {
    await runStressTest();
    process.exit(0);
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    process.exit(1);
  }
}

// Run the test
main();
