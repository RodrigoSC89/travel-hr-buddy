/**
 * AI API Stress Test Script
 * PATCH 156.0 - Stress Testing & Load Simulation
 * 
 * Tests OpenAI API calls with batching support
 * Measures latency, token usage, and failure rates
 * 
 * Run with: node tests/stress/ai-api-stress.js
 */

import fetch from "node-fetch";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Configuration
const CONFIG = {
  OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || "",
  CONCURRENT_REQUESTS: 10,
  TOTAL_REQUESTS: 50,
  BATCH_SIZE: 5,
  TIMEOUT_MS: 30000,
};

// Metrics storage
const metrics = {
  requests: [],
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalLatency: 0,
  totalTokens: 0,
  errors: [],
};

// Test scenarios
const TEST_PROMPTS = [
  "Analyze this crew member status and provide recommendations.",
  "Generate a safety report summary for the vessel.",
  "Provide incident response guidance for equipment failure.",
  "Create a maintenance schedule recommendation.",
  "Analyze weather conditions and suggest route adjustments.",
];

/**
 * Make a single AI API call
 */
async function makeAIRequest(promptIndex) {
  const startTime = performance.now();
  const prompt = TEST_PROMPTS[promptIndex % TEST_PROMPTS.length];
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a maritime operations assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
      timeout: CONFIG.TIMEOUT_MS,
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const result = {
      success: true,
      latency,
      tokens: data.usage?.total_tokens || 0,
      timestamp: new Date().toISOString(),
    };
    
    metrics.successfulRequests++;
    metrics.totalLatency += latency;
    metrics.totalTokens += result.tokens;
    metrics.requests.push(result);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    const result = {
      success: false,
      latency,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    
    metrics.failedRequests++;
    metrics.errors.push(result);
    metrics.requests.push(result);
    
    return result;
  }
}

/**
 * Run batch of concurrent requests
 */
async function runBatch(batchNumber, requestsInBatch) {
  console.log(`\n🚀 Running batch ${batchNumber} with ${requestsInBatch} requests...`);
  
  const promises = [];
  for (let i = 0; i < requestsInBatch; i++) {
    promises.push(makeAIRequest(metrics.totalRequests + i));
  }
  
  const results = await Promise.allSettled(promises);
  metrics.totalRequests += requestsInBatch;
  
  console.log(`✅ Batch ${batchNumber} completed`);
  return results;
}

/**
 * Generate stress test report
 */
function generateReport() {
  const avgLatency = metrics.totalRequests > 0 
    ? metrics.totalLatency / metrics.totalRequests 
    : 0;
  
  const failureRate = metrics.totalRequests > 0 
    ? (metrics.failedRequests / metrics.totalRequests) * 100 
    : 0;
  
  const successRate = 100 - failureRate;
  
  // Sort by latency to get percentiles
  const sortedLatencies = metrics.requests
    .filter(r => r.success)
    .map(r => r.latency)
    .sort((a, b) => a - b);
  
  const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
  const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0;
  const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0;
  const maxLatency = sortedLatencies[sortedLatencies.length - 1] || 0;
  
  const report = {
    summary: {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      successRate: `${successRate.toFixed(2)}%`,
      failureRate: `${failureRate.toFixed(2)}%`,
    },
    latency: {
      average: `${avgLatency.toFixed(2)}ms`,
      p50: `${p50.toFixed(2)}ms`,
      p95: `${p95.toFixed(2)}ms`,
      p99: `${p99.toFixed(2)}ms`,
      max: `${maxLatency.toFixed(2)}ms`,
    },
    tokens: {
      total: metrics.totalTokens,
      average: metrics.successfulRequests > 0 
        ? Math.round(metrics.totalTokens / metrics.successfulRequests)
        : 0,
    },
    errors: metrics.errors,
    timestamp: new Date().toISOString(),
  };
  
  return report;
}

/**
 * Print report to console
 */
function printReport(report) {
  console.log("\n" + "=".repeat(60));
  console.log("🔥 AI API STRESS TEST RESULTS");
  console.log("=".repeat(60));
  console.log("\n📊 SUMMARY:");
  console.log(`   Total Requests: ${report.summary.totalRequests}`);
  console.log(`   Successful: ${report.summary.successfulRequests} (${report.summary.successRate})`);
  console.log(`   Failed: ${report.summary.failedRequests} (${report.summary.failureRate})`);
  console.log("\n⚡ LATENCY:");
  console.log(`   Average: ${report.latency.average}`);
  console.log(`   P50: ${report.latency.p50}`);
  console.log(`   P95: ${report.latency.p95}`);
  console.log(`   P99: ${report.latency.p99}`);
  console.log(`   Max: ${report.latency.max}`);
  console.log("\n🎯 TOKEN USAGE:");
  console.log(`   Total: ${report.tokens.total}`);
  console.log(`   Average per request: ${report.tokens.average}`);
  
  if (report.errors.length > 0) {
    console.log("\n❌ ERRORS:");
    report.errors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.error} (${error.timestamp})`);
    });
    if (report.errors.length > 5) {
      console.log(`   ... and ${report.errors.length - 5} more errors`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
}

/**
 * Save report to file
 */
function saveReport(report) {
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = path.join(reportsDir, "stress-test-ai-api.json");
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${filename}`);
}

/**
 * Main test execution
 */
async function runStressTest() {
  console.log("🎯 Starting AI API Stress Test...");
  console.log(`Configuration: ${CONFIG.TOTAL_REQUESTS} total requests, ${CONFIG.BATCH_SIZE} per batch`);
  
  if (!CONFIG.OPENAI_API_KEY) {
    console.error("❌ Error: VITE_OPENAI_API_KEY environment variable not set");
    process.exit(1);
  }
  
  const startTime = performance.now();
  const numBatches = Math.ceil(CONFIG.TOTAL_REQUESTS / CONFIG.BATCH_SIZE);
  
  for (let i = 0; i < numBatches; i++) {
    const requestsInBatch = Math.min(
      CONFIG.BATCH_SIZE,
      CONFIG.TOTAL_REQUESTS - metrics.totalRequests
    );
    
    await runBatch(i + 1, requestsInBatch);
    
    // Small delay between batches to avoid rate limiting
    if (i < numBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const endTime = performance.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  console.log(`\n✅ Test completed in ${totalDuration.toFixed(2)}s`);
  
  const report = generateReport();
  printReport(report);
  saveReport(report);
}

// Run the stress test
runStressTest().catch(error => {
  console.error("❌ Stress test failed:", error);
  process.exit(1);
});
