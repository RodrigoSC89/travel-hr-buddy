/**
 * K6 Load Testing Script for Supabase
 * PATCH 156.0 - Stress Testing & Load Simulation
 * 
 * Tests Supabase endpoints under load to measure:
 * - Latency
 * - Failure rate
 * - Resource consumption
 * 
 * Run with: k6 run tests/stress/k6-supabase-stress.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// Custom metrics
const failureRate = new Rate("failed_requests");
const latency = new Trend("request_latency");
const requestCount = new Counter("total_requests");

// Test configuration
export const options = {
  stages: [
    { duration: "30s", target: 10 },  // Ramp up to 10 users
    { duration: "1m", target: 50 },   // Ramp up to 50 users
    { duration: "2m", target: 100 },  // Peak load
    { duration: "1m", target: 50 },   // Ramp down
    { duration: "30s", target: 0 },   // Cool down
  ],
  thresholds: {
    "http_req_duration": ["p(95)<2000"], // 95% of requests should be below 2s
    "failed_requests": ["rate<0.1"],      // Less than 10% errors
  },
};

// Environment configuration
const SUPABASE_URL = __ENV.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_KEY = __ENV.VITE_SUPABASE_KEY || "your-anon-key";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

export default function () {
  const testScenario = Math.random();
  
  // Test different endpoints with different probabilities
  if (testScenario < 0.3) {
    // 30% - Read operations (most common)
    testReadOperations();
  } else if (testScenario < 0.6) {
    // 30% - Dashboard queries
    testDashboardQueries();
  } else if (testScenario < 0.85) {
    // 25% - List operations
    testListOperations();
  } else {
    // 15% - Write operations
    testWriteOperations();
  }
  
  sleep(1); // Think time between requests
}

function testReadOperations() {
  const endpoints = [
    "/rest/v1/vessels?select=*&limit=10",
    "/rest/v1/crew_members?select=*&limit=20",
    "/rest/v1/jobs?select=*&limit=15",
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const startTime = Date.now();
  
  const response = http.get(`${SUPABASE_URL}${endpoint}`, { headers });
  
  const duration = Date.now() - startTime;
  latency.add(duration);
  requestCount.add(1);
  
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 2000ms": (r) => duration < 2000,
    "has data": (r) => r.json() !== null,
  });
  
  failureRate.add(!success);
}

function testDashboardQueries() {
  const queries = [
    "/rest/v1/rpc/get_vessel_stats",
    "/rest/v1/rpc/get_crew_summary",
    "/rest/v1/rpc/get_job_metrics",
  ];
  
  const query = queries[Math.floor(Math.random() * queries.length)];
  const startTime = Date.now();
  
  const response = http.post(`${SUPABASE_URL}${query}`, "{}", { headers });
  
  const duration = Date.now() - startTime;
  latency.add(duration);
  requestCount.add(1);
  
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 3000ms": (r) => duration < 3000,
  });
  
  failureRate.add(!success);
}

function testListOperations() {
  const startTime = Date.now();
  
  const response = http.get(
    `${SUPABASE_URL}/rest/v1/auditorias_imca?select=*&order=created_at.desc&limit=50`,
    { headers }
  );
  
  const duration = Date.now() - startTime;
  latency.add(duration);
  requestCount.add(1);
  
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 2500ms": (r) => duration < 2500,
  });
  
  failureRate.add(!success);
}

function testWriteOperations() {
  const payload = JSON.stringify({
    title: `Load Test ${Date.now()}`,
    status: "pending",
    created_at: new Date().toISOString(),
  });
  
  const startTime = Date.now();
  
  const response = http.post(
    `${SUPABASE_URL}/rest/v1/test_logs`,
    payload,
    { headers }
  );
  
  const duration = Date.now() - startTime;
  latency.add(duration);
  requestCount.add(1);
  
  const success = check(response, {
    "status is 201 or 409": (r) => r.status === 201 || r.status === 409,
    "response time < 3000ms": (r) => duration < 3000,
  });
  
  failureRate.add(!success);
}

export function handleSummary(data) {
  return {
    "stdout": textSummary(data, { indent: " ", enableColors: true }),
    "reports/stress-test-supabase.json": JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const indent = options.indent || "";
  const enableColors = options.enableColors || false;
  
  let summary = "\n" + indent + "================== STRESS TEST SUMMARY ==================\n";
  summary += indent + `Total Requests: ${data.metrics.total_requests.values.count}\n`;
  summary += indent + `Failed Requests: ${(data.metrics.failed_requests.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `Avg Latency: ${data.metrics.request_latency.values.avg.toFixed(2)}ms\n`;
  summary += indent + `P95 Latency: ${data.metrics.request_latency.values["p(95)"].toFixed(2)}ms\n`;
  summary += indent + `P99 Latency: ${data.metrics.request_latency.values["p(99)"].toFixed(2)}ms\n`;
  summary += indent + `Max Latency: ${data.metrics.request_latency.values.max.toFixed(2)}ms\n`;
  summary += indent + "=========================================================\n";
  
  return summary;
}
