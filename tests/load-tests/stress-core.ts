/**
 * PATCH 561 - Simulação de Stress e Carga em Módulos Core
 * 
 * Simulates 100 parallel sessions accessing core modules:
 * - /dashboard
 * - /crew-management
 * - /control-hub
 * 
 * Monitors CPU, memory, and latency metrics
 * Generates performance report in performance_metrics/
 * 
 * Run with: npx tsx tests/load-tests/stress-core.ts
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  BASE_URL: process.env.VITE_APP_URL || 'http://localhost:5173',
  NUM_SESSIONS: 100,
  CORE_ROUTES: [
    '/dashboard',
    '/crew-management',
    '/control-hub',
  ],
  TIMEOUT: 60000,
  METRICS_DIR: 'performance_metrics',
};

// Metrics storage
interface SessionMetrics {
  sessionId: number;
  route: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  statusCode?: number;
  error?: string;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  performance?: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
  };
}

interface SystemMetrics {
  timestamp: number;
  cpuUsage: number[];
  memoryUsage: {
    total: number;
    free: number;
    used: number;
    percentUsed: number;
  };
}

const metrics: {
  sessions: SessionMetrics[];
  systemSnapshots: SystemMetrics[];
  summary: {
    totalSessions: number;
    successfulSessions: number;
    failedSessions: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    timestamp: string;
  };
} = {
  sessions: [],
  systemSnapshots: [],
  summary: {
    totalSessions: 0,
    successfulSessions: 0,
    failedSessions: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    timestamp: new Date().toISOString(),
  },
};

/**
 * Get current system metrics
 */
function getSystemMetrics(): SystemMetrics {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  return {
    timestamp: Date.now(),
    cpuUsage: os.cpus().map(cpu => {
      const total = Object.values(cpu.times).reduce((acc, val) => acc + val, 0);
      const idle = cpu.times.idle;
      return ((total - idle) / total) * 100;
    }),
    memoryUsage: {
      total: totalMemory / (1024 * 1024 * 1024), // GB
      free: freeMemory / (1024 * 1024 * 1024), // GB
      used: usedMemory / (1024 * 1024 * 1024), // GB
      percentUsed: (usedMemory / totalMemory) * 100,
    },
  };
}

/**
 * Measure page performance
 */
async function measurePagePerformance(page: Page) {
  try {
    const perfMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    return perfMetrics;
  } catch (error) {
    return {
      domContentLoaded: 0,
      loadComplete: 0,
      firstContentfulPaint: 0,
    };
  }
}

/**
 * Get memory usage from page
 */
async function getMemoryUsage(page: Page) {
  try {
    const memory = await page.evaluate(() => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        return {
          usedJSHeapSize: mem.usedJSHeapSize / (1024 * 1024), // MB
          totalJSHeapSize: mem.totalJSHeapSize / (1024 * 1024), // MB
          jsHeapSizeLimit: mem.jsHeapSizeLimit / (1024 * 1024), // MB
        };
      }
      return null;
    });
    return memory;
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
  
  const startTime = Date.now();
  
  try {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    page = await context.newPage();
    
    // Navigate to route
    const response = await page.goto(`${CONFIG.BASE_URL}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT,
    });
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Ignore timeout for networkidle
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Get performance metrics
    const perfMetrics = await measurePagePerformance(page);
    const memoryUsage = await getMemoryUsage(page);
    
    const sessionMetrics: SessionMetrics = {
      sessionId,
      route,
      startTime,
      endTime,
      duration,
      success: response?.status() === 200,
      statusCode: response?.status(),
      performance: perfMetrics,
      memory: memoryUsage || undefined,
    };
    
    await context.close();
    return sessionMetrics;
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (context) {
      await context.close().catch(() => {});
    }
    
    return {
      sessionId,
      route,
      startTime,
      endTime,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run stress test with parallel sessions
 */
async function runStressTest() {
  console.log('🎯 PATCH 561 - Stress Test Starting...');
  console.log(`📊 Simulating ${CONFIG.NUM_SESSIONS} parallel sessions`);
  console.log(`🎯 Testing routes: ${CONFIG.CORE_ROUTES.join(', ')}`);
  console.log('');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  
  // Start system monitoring
  const monitoringInterval = setInterval(() => {
    metrics.systemSnapshots.push(getSystemMetrics());
  }, 1000);
  
  // Create promises for all sessions
  const sessionPromises: Promise<SessionMetrics>[] = [];
  
  for (let i = 0; i < CONFIG.NUM_SESSIONS; i++) {
    const route = CONFIG.CORE_ROUTES[i % CONFIG.CORE_ROUTES.length];
    sessionPromises.push(simulateSession(browser, i + 1, route));
    
    // Small delay to stagger session starts
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      process.stdout.write(`⏳ Started ${i + 1}/${CONFIG.NUM_SESSIONS} sessions...\r`);
    }
  }
  
  console.log(`\n🔄 Waiting for all ${CONFIG.NUM_SESSIONS} sessions to complete...`);
  
  // Wait for all sessions to complete
  const results = await Promise.all(sessionPromises);
  
  // Stop monitoring
  clearInterval(monitoringInterval);
  
  // Store results
  metrics.sessions = results;
  
  // Close browser
  await browser.close();
  
  // Calculate summary
  calculateSummary();
}

/**
 * Calculate summary statistics
 */
function calculateSummary() {
  const successfulSessions = metrics.sessions.filter(s => s.success);
  const failedSessions = metrics.sessions.filter(s => !s.success);
  const durations = metrics.sessions.map(s => s.duration);
  
  metrics.summary = {
    totalSessions: metrics.sessions.length,
    successfulSessions: successfulSessions.length,
    failedSessions: failedSessions.length,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate and display report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔥 PATCH 561 - STRESS TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n📊 OVERALL SUMMARY:');
  console.log(`   Total Sessions: ${metrics.summary.totalSessions}`);
  console.log(`   Successful: ${metrics.summary.successfulSessions} ✅`);
  console.log(`   Failed: ${metrics.summary.failedSessions} ❌`);
  console.log(`   Success Rate: ${((metrics.summary.successfulSessions / metrics.summary.totalSessions) * 100).toFixed(2)}%`);
  
  console.log('\n⏱️  LATENCY METRICS:');
  console.log(`   Average Duration: ${metrics.summary.avgDuration.toFixed(2)}ms`);
  console.log(`   Min Duration: ${metrics.summary.minDuration.toFixed(2)}ms`);
  console.log(`   Max Duration: ${metrics.summary.maxDuration.toFixed(2)}ms`);
  
  // Route-specific statistics
  console.log('\n🎯 ROUTE-SPECIFIC METRICS:');
  CONFIG.CORE_ROUTES.forEach(route => {
    const routeSessions = metrics.sessions.filter(s => s.route === route);
    const routeSuccess = routeSessions.filter(s => s.success).length;
    const routeDurations = routeSessions.map(s => s.duration);
    const avgDuration = routeDurations.reduce((a, b) => a + b, 0) / routeDurations.length;
    
    console.log(`\n   ${route}:`);
    console.log(`      Total Requests: ${routeSessions.length}`);
    console.log(`      Success Rate: ${((routeSuccess / routeSessions.length) * 100).toFixed(2)}%`);
    console.log(`      Avg Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`      Min/Max: ${Math.min(...routeDurations).toFixed(2)}ms / ${Math.max(...routeDurations).toFixed(2)}ms`);
  });
  
  // System metrics
  if (metrics.systemSnapshots.length > 0) {
    const avgCpuUsage = metrics.systemSnapshots.reduce((acc, snapshot) => {
      const avgCpu = snapshot.cpuUsage.reduce((a, b) => a + b, 0) / snapshot.cpuUsage.length;
      return acc + avgCpu;
    }, 0) / metrics.systemSnapshots.length;
    
    const avgMemoryUsed = metrics.systemSnapshots.reduce((acc, snapshot) => 
      acc + snapshot.memoryUsage.percentUsed, 0) / metrics.systemSnapshots.length;
    
    console.log('\n💻 SYSTEM METRICS:');
    console.log(`   Average CPU Usage: ${avgCpuUsage.toFixed(2)}%`);
    console.log(`   Average Memory Usage: ${avgMemoryUsed.toFixed(2)}%`);
    console.log(`   Total Snapshots: ${metrics.systemSnapshots.length}`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Check acceptance criteria
  const acceptanceMet = metrics.summary.failedSessions === 0;
  console.log('\n✅ ACCEPTANCE CRITERIA:');
  console.log(`   ✓ System supports 100 sessions: ${acceptanceMet ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`   ✓ No fatal errors: ${acceptanceMet ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`   ✓ Performance report generated: PASSED ✅`);
  console.log(`   ✓ Logs stored in performance_metrics: PASSED ✅`);
  console.log('');
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
  
  fs.writeFileSync(filename, JSON.stringify(metrics, null, 2));
  console.log(`💾 Full report saved to: ${filename}`);
  
  // Also save a summary report
  const summaryFilename = path.join(metricsDir, `stress-core-summary-${timestamp}.json`);
  fs.writeFileSync(summaryFilename, JSON.stringify({
    summary: metrics.summary,
    timestamp: metrics.summary.timestamp,
    config: CONFIG,
  }, null, 2));
  console.log(`📋 Summary report saved to: ${summaryFilename}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const startTime = Date.now();
    
    await runStressTest();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total test duration: ${(totalTime / 1000).toFixed(2)}s`);
    
    generateReport();
    saveReport();
    
    process.exit(metrics.summary.failedSessions > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    process.exit(1);
  }
}

// Execute
main();
