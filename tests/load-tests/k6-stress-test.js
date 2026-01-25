/**
 * k6 Load Testing Suite
 * NAUTI ONE v4.0 - Stress Testing for 500+ Concurrent Users
 * 
 * Run: k6 run tests/load-tests/k6-stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  stages: [
    // Ramp-up
    { duration: '2m', target: 50 },   // Warm-up
    { duration: '3m', target: 100 },  // Normal load
    { duration: '5m', target: 250 },  // Peak load
    { duration: '5m', target: 500 },  // Stress test
    { duration: '3m', target: 500 },  // Sustained stress
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
    errors: ['rate<0.05'],                           // Error rate < 5%
    http_req_failed: ['rate<0.01'],                  // Failed requests < 1%
  },
  // Maritime network simulation (high latency)
  ext: {
    loadimpact: {
      projectID: 'nauti-one-v4',
      name: 'Maritime HR Stress Test'
    }
  }
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL || 'https://travel-hr-buddy.lovable.app';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://vnbptmixvwropvanyhdb.supabase.co';

// Test user credentials (use test environment)
const TEST_USERS = [
  { email: 'test-user-1@nautione.com', password: 'TestPassword123!' },
  { email: 'test-user-2@nautione.com', password: 'TestPassword123!' },
  { email: 'test-user-3@nautione.com', password: 'TestPassword123!' },
];

/**
 * Setup function - runs once before tests
 */
export function setup() {
  console.log('🚀 Starting NAUTI ONE v4.0 Load Test');
  console.log(`📍 Target: ${BASE_URL}`);
  
  return {
    startTime: new Date().toISOString(),
    baseUrl: BASE_URL
  };
}

/**
 * Main test function - runs for each virtual user
 */
export default function (data) {
  // Simulate maritime network latency (satellite connection)
  const networkDelay = Math.random() * 0.5; // 0-500ms additional delay
  
  group('Homepage Load', () => {
    const res = http.get(`${BASE_URL}/`);
    
    check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage loads under 3s': (r) => r.timings.duration < 3000,
      'contains app content': (r) => r.body.includes('NAUTI') || r.body.includes('Maritime'),
    });
    
    apiLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    
    if (res.status === 200) {
      successfulRequests.add(1);
    }
  });
  
  sleep(1 + networkDelay);
  
  group('Dashboard Access', () => {
    const res = http.get(`${BASE_URL}/central-comando`);
    
    check(res, {
      'dashboard accessible': (r) => r.status === 200 || r.status === 302,
      'dashboard loads under 4s': (r) => r.timings.duration < 4000,
    });
    
    apiLatency.add(res.timings.duration);
    errorRate.add(res.status >= 400);
  });
  
  sleep(0.5 + networkDelay);
  
  group('Crew Management', () => {
    const res = http.get(`${BASE_URL}/crew-management`);
    
    check(res, {
      'crew page loads': (r) => r.status === 200 || r.status === 302,
      'response time acceptable': (r) => r.timings.duration < 3500,
    });
    
    apiLatency.add(res.timings.duration);
  });
  
  sleep(0.5 + networkDelay);
  
  group('Vessels Page', () => {
    const res = http.get(`${BASE_URL}/vessels`);
    
    check(res, {
      'vessels page loads': (r) => r.status === 200 || r.status === 302,
    });
    
    apiLatency.add(res.timings.duration);
  });
  
  sleep(0.5 + networkDelay);
  
  group('Documents Module', () => {
    const res = http.get(`${BASE_URL}/documents`);
    
    check(res, {
      'documents accessible': (r) => r.status === 200 || r.status === 302,
    });
    
    apiLatency.add(res.timings.duration);
  });
  
  sleep(0.5 + networkDelay);
  
  group('Compliance Dashboard', () => {
    const res = http.get(`${BASE_URL}/compliance`);
    
    check(res, {
      'compliance page loads': (r) => r.status === 200 || r.status === 302,
    });
    
    apiLatency.add(res.timings.duration);
  });
  
  sleep(1 + networkDelay);
  
  // API stress tests
  group('Supabase API Health', () => {
    const res = http.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTA2MTcsImV4cCI6MjA1MzA2NjYxN30.Kf5-16mQTqpVq6pJ-KJIejU28-WPZymLlQZhLaXGUvo',
      }
    });
    
    check(res, {
      'API responds': (r) => r.status < 500,
      'API under 1s': (r) => r.timings.duration < 1000,
    });
    
    apiLatency.add(res.timings.duration);
  });
  
  sleep(2 + networkDelay);
}

/**
 * Teardown function - runs once after all tests
 */
export function teardown(data) {
  console.log('✅ Load test completed');
  console.log(`Started: ${data.startTime}`);
  console.log(`Finished: ${new Date().toISOString()}`);
}

/**
 * Handle summary - generate custom report
 */
export function handleSummary(data) {
  const summary = {
    testName: 'NAUTI ONE v4.0 Stress Test',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: data.metrics.http_reqs?.values?.count || 0,
      failedRequests: data.metrics.http_req_failed?.values?.passes || 0,
      avgLatency: data.metrics.http_req_duration?.values?.avg || 0,
      p95Latency: data.metrics.http_req_duration?.values['p(95)'] || 0,
      p99Latency: data.metrics.http_req_duration?.values['p(99)'] || 0,
      errorRate: data.metrics.errors?.values?.rate || 0,
    },
    thresholds: {
      passed: Object.values(data.thresholds || {}).filter(t => t.ok).length,
      failed: Object.values(data.thresholds || {}).filter(t => !t.ok).length,
    }
  };
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load-tests/results/summary.json': JSON.stringify(summary, null, 2),
  };
}

// Text summary helper
function textSummary(data, opts) {
  return `
╔══════════════════════════════════════════════════════════════╗
║           NAUTI ONE v4.0 - Load Test Results                ║
╠══════════════════════════════════════════════════════════════╣
║ Total Requests:     ${(data.metrics.http_reqs?.values?.count || 0).toString().padStart(10)}                       ║
║ Failed Requests:    ${(data.metrics.http_req_failed?.values?.passes || 0).toString().padStart(10)}                       ║
║ Avg Latency:        ${((data.metrics.http_req_duration?.values?.avg || 0).toFixed(2) + 'ms').padStart(10)}                       ║
║ P95 Latency:        ${((data.metrics.http_req_duration?.values['p(95)'] || 0).toFixed(2) + 'ms').padStart(10)}                       ║
║ P99 Latency:        ${((data.metrics.http_req_duration?.values['p(99)'] || 0).toFixed(2) + 'ms').padStart(10)}                       ║
║ Error Rate:         ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2).padStart(9)}%                       ║
╚══════════════════════════════════════════════════════════════╝
`;
}
