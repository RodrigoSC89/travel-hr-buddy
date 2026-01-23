/**
 * k6 Load Test for Nauti One API
 * Stress testing critical endpoints
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successfulLogins = new Counter('successful_logins');
const apiLatency = new Trend('api_latency');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users
    { duration: '1m', target: 25 },    // Ramp-up to 25 users
    { duration: '2m', target: 50 },    // Stay at 50 users
    { duration: '1m', target: 100 },   // Spike to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '2m', target: 200 },   // Stay at 200 users
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'], // 95% under 2s, 99% under 5s
    'errors': ['rate<0.05'],                           // Error rate < 5%
    'http_req_failed': ['rate<0.05'],                  // Failed requests < 5%
  },
  // Use environment variables for sensitive data
  ext: {
    loadimpact: {
      projectID: __ENV.K6_PROJECT_ID,
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://nautione.com.br';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';

// Test users (use environment variables in production)
const testUsers = [
  { email: 'test1@nautione.com.br', password: __ENV.TEST_PASSWORD || 'Test123!@#' },
  { email: 'test2@nautione.com.br', password: __ENV.TEST_PASSWORD || 'Test123!@#' },
];

export function setup() {
  console.log(`Starting load test against ${BASE_URL}`);
  return { startTime: new Date().toISOString() };
}

export default function () {
  group('Homepage Load', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/`);
    apiLatency.add(Date.now() - startTime);
    
    const success = check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage has content': (r) => r.body.length > 1000,
      'homepage loads under 3s': (r) => r.timings.duration < 3000,
    });
    
    if (!success) errorRate.add(1);
    
    sleep(1);
  });
  
  group('Auth Page Load', () => {
    const res = http.get(`${BASE_URL}/auth`);
    
    check(res, {
      'auth page status 200': (r) => r.status === 200,
      'auth page has form': (r) => r.body.includes('form') || r.body.includes('input'),
    }) || errorRate.add(1);
    
    sleep(0.5);
  });
  
  group('Dashboard Load', () => {
    const res = http.get(`${BASE_URL}/dashboard`);
    
    check(res, {
      'dashboard accessible': (r) => r.status === 200 || r.status === 302,
    }) || errorRate.add(1);
    
    sleep(0.5);
  });
  
  group('API Health Check', () => {
    const res = http.get(`${SUPABASE_URL}/functions/v1/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    check(res, {
      'API health OK': (r) => r.status === 200 || r.status === 401, // 401 is OK for auth-protected endpoints
    }) || errorRate.add(1);
    
    sleep(0.5);
  });
  
  group('Static Assets', () => {
    // Test that static assets load quickly
    const assets = [
      `${BASE_URL}/manifest.json`,
    ];
    
    assets.forEach((url) => {
      const res = http.get(url);
      check(res, {
        'asset loads': (r) => r.status === 200 || r.status === 304,
      });
    });
    
    sleep(0.5);
  });
  
  // Random wait between iterations (1-3 seconds)
  sleep(Math.random() * 2 + 1);
}

export function teardown(data) {
  console.log(`Load test completed. Started at: ${data.startTime}`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}
