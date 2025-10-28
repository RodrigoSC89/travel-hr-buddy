/**
 * Dashboard Stress Test Script
 * PATCH 156.0 - Stress Testing & Load Simulation
 * 
 * Tests dashboard rendering and data loading under load
 * Measures rendering time, memory usage, and UI responsiveness
 * 
 * Run with: node tests/stress/dashboard-stress.js
 */

import { chromium } from "playwright";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Configuration
const CONFIG = {
  BASE_URL: process.env.VITE_APP_URL || "http://localhost:5173",
  NUM_ITERATIONS: 20,
  DASHBOARDS: [
    "/analytics",
    "/dashboard",
    "/bi-jobs",
    "/unified-dashboard",
    "/performance-monitor",
  ],
  HEADLESS: true,
};

// Metrics storage
const metrics = {
  dashboards: {},
  totalTests: 0,
  failedTests: 0,
  timestamp: new Date().toISOString(),
};

/**
 * Measure page performance metrics
 */
async function measurePagePerformance(page) {
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      firstPaint: paint.find(p => p.name === "first-paint")?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === "first-contentful-paint")?.startTime || 0,
      domInteractive: navigation?.domInteractive - navigation?.fetchStart || 0,
    };
  });
  
  return performanceMetrics;
}

/**
 * Get memory usage
 */
async function getMemoryUsage(page) {
  try {
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
          totalJSHeapSize: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
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
 * Test a single dashboard
 */
async function testDashboard(browser, dashboardPath, iteration) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const startTime = performance.now();
    
    // Navigate to dashboard
    const response = await page.goto(`${CONFIG.BASE_URL}${dashboardPath}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    
    const navigationTime = performance.now() - startTime;
    
    // Wait for content to load
    await page.waitForLoadState("domcontentloaded");
    
    // Get performance metrics
    const perfMetrics = await measurePagePerformance(page);
    const memoryUsage = await getMemoryUsage(page);
    
    // Check for console errors
    const consoleErrors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    
    // Take screenshot for verification
    const screenshotsDir = path.join(process.cwd(), "reports", "stress-screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const screenshotPath = path.join(
      screenshotsDir,
      `${dashboardPath.replace(/\//g, "-")}-${iteration}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    const result = {
      success: response?.status() === 200,
      statusCode: response?.status(),
      navigationTime: navigationTime,
      metrics: perfMetrics,
      memory: memoryUsage,
      consoleErrors: consoleErrors.length,
      timestamp: new Date().toISOString(),
    };
    
    await context.close();
    return result;
    
  } catch (error) {
    await context.close();
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run stress test for all dashboards
 */
async function runStressTest() {
  console.log("🎯 Starting Dashboard Stress Test...");
  console.log(`Testing ${CONFIG.DASHBOARDS.length} dashboards, ${CONFIG.NUM_ITERATIONS} iterations each`);
  
  const browser = await chromium.launch({ headless: CONFIG.HEADLESS });
  
  for (const dashboardPath of CONFIG.DASHBOARDS) {
    console.log(`\n📊 Testing dashboard: ${dashboardPath}`);
    
    const dashboardMetrics = {
      path: dashboardPath,
      iterations: [],
      stats: {},
    };
    
    for (let i = 0; i < CONFIG.NUM_ITERATIONS; i++) {
      process.stdout.write(`  Iteration ${i + 1}/${CONFIG.NUM_ITERATIONS}... `);
      
      const result = await testDashboard(browser, dashboardPath, i + 1);
      dashboardMetrics.iterations.push(result);
      metrics.totalTests++;
      
      if (!result.success) {
        metrics.failedTests++;
        console.log("❌ FAILED");
      } else {
        console.log("✅");
      }
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Calculate statistics
    const successfulTests = dashboardMetrics.iterations.filter(i => i.success);
    const navTimes = successfulTests.map(i => i.navigationTime);
    const fcpTimes = successfulTests.map(i => i.metrics?.firstContentfulPaint || 0);
    
    dashboardMetrics.stats = {
      totalIterations: CONFIG.NUM_ITERATIONS,
      successfulIterations: successfulTests.length,
      failedIterations: metrics.failedTests,
      successRate: `${((successfulTests.length / CONFIG.NUM_ITERATIONS) * 100).toFixed(2)}%`,
      navigationTime: {
        avg: navTimes.length > 0 ? navTimes.reduce((a, b) => a + b, 0) / navTimes.length : 0,
        min: navTimes.length > 0 ? Math.min(...navTimes) : 0,
        max: navTimes.length > 0 ? Math.max(...navTimes) : 0,
      },
      firstContentfulPaint: {
        avg: fcpTimes.length > 0 ? fcpTimes.reduce((a, b) => a + b, 0) / fcpTimes.length : 0,
        min: fcpTimes.length > 0 ? Math.min(...fcpTimes) : 0,
        max: fcpTimes.length > 0 ? Math.max(...fcpTimes) : 0,
      },
    };
    
    metrics.dashboards[dashboardPath] = dashboardMetrics;
  }
  
  await browser.close();
}

/**
 * Generate and print report
 */
function generateReport() {
  console.log("\n" + "=".repeat(70));
  console.log("🔥 DASHBOARD STRESS TEST RESULTS");
  console.log("=".repeat(70));
  
  console.log("\n📊 OVERALL SUMMARY:");
  console.log(`   Total Tests: ${metrics.totalTests}`);
  console.log(`   Failed Tests: ${metrics.failedTests}`);
  console.log(`   Success Rate: ${(((metrics.totalTests - metrics.failedTests) / metrics.totalTests) * 100).toFixed(2)}%`);
  
  console.log("\n📈 DASHBOARD PERFORMANCE:");
  for (const [path, data] of Object.entries(metrics.dashboards)) {
    console.log(`\n   ${path}:`);
    console.log(`      Success Rate: ${data.stats.successRate}`);
    console.log(`      Avg Navigation Time: ${data.stats.navigationTime.avg.toFixed(2)}ms`);
    console.log(`      Avg First Contentful Paint: ${data.stats.firstContentfulPaint.avg.toFixed(2)}ms`);
    console.log(`      Min/Max Nav Time: ${data.stats.navigationTime.min.toFixed(2)}ms / ${data.stats.navigationTime.max.toFixed(2)}ms`);
  }
  
  console.log("\n" + "=".repeat(70));
}

/**
 * Save report to file
 */
function saveReport() {
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = path.join(reportsDir, "stress-test-dashboard.json");
  fs.writeFileSync(filename, JSON.stringify(metrics, null, 2));
  console.log(`\n💾 Report saved to: ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    await runStressTest();
    generateReport();
    saveReport();
    process.exit(0);
  } catch (error) {
    console.error("❌ Stress test failed:", error);
    process.exit(1);
  }
}

main();
