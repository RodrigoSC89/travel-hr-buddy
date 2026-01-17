/**
 * k6 Load Testing Scripts for Nauti One
 * 
 * Run with: k6 run load-tests/scenarios.js
 * 
 * Scenarios:
 * 1. smoke - Quick sanity check (10 users, 1 min)
 * 2. load - Normal load (100 users, 5 min)
 * 3. stress - Find breaking point (500 users, 10 min)
 * 4. spike - Sudden traffic surge (1000 users spike)
 * 5. soak - Extended duration (100 users, 1 hour)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');
const pageLoadDuration = new Trend('page_load_duration');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://travel-hr-buddy.lovable.app';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://vnbptmixvwropvanyhdb.supabase.co';

// Thresholds (SLOs)
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'], // 95% < 3s, 99% < 5s
    http_req_failed: ['rate<0.01'], // < 1% failures
    error_rate: ['rate<0.05'], // < 5% errors
    login_duration: ['p(95)<5000'], // Login < 5s at p95
    api_duration: ['p(95)<2000'], // API calls < 2s at p95
  },

  scenarios: {
    // Smoke test - quick sanity check
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { scenario: 'smoke' },
    },

    // Load test - normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // Ramp up
        { duration: '3m', target: 100 },  // Stay at 100
        { duration: '1m', target: 0 },    // Ramp down
      ],
      tags: { scenario: 'load' },
    },

    // Stress test - find limits
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'stress' },
    },

    // Spike test - sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '10s', target: 1000 }, // Spike!
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'spike' },
    },

    // Soak test - extended duration
    soak: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1h',
      tags: { scenario: 'soak' },
    },
  },
};

// Test data
const testUsers = [
  { email: 'load-test-1@test.com', password: 'LoadTest123!' },
  { email: 'load-test-2@test.com', password: 'LoadTest123!' },
  { email: 'load-test-3@test.com', password: 'LoadTest123!' },
];

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Main test function
export default function () {
  const user = getRandomUser();

  group('Landing Page', () => {
    const startTime = Date.now();
    const res = http.get(BASE_URL);
    pageLoadDuration.add(Date.now() - startTime);
    
    check(res, {
      'landing page loads': (r) => r.status === 200,
      'landing page has content': (r) => r.body.length > 1000,
    });
    
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Authentication Flow', () => {
    // Login attempt
    const startTime = Date.now();
    const loginRes = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': __ENV.SUPABASE_ANON_KEY,
        },
      }
    );
    loginDuration.add(Date.now() - startTime);

    const loginSuccess = check(loginRes, {
      'login succeeds or expected error': (r) => r.status === 200 || r.status === 400,
    });

    errorRate.add(!loginSuccess);
  });

  sleep(1);

  group('API Health Check', () => {
    const startTime = Date.now();
    const healthRes = http.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': __ENV.SUPABASE_ANON_KEY,
      },
    });
    apiDuration.add(Date.now() - startTime);

    check(healthRes, {
      'API responds': (r) => r.status === 200,
    });
    
    errorRate.add(healthRes.status !== 200);
  });

  sleep(1);

  group('Dashboard Simulation', () => {
    // Simulate authenticated user fetching dashboard data
    const endpoints = [
      '/rest/v1/vessels?select=id,name&limit=10',
      '/rest/v1/crew_members?select=id,full_name&limit=10',
      '/rest/v1/compliance_items?select=id,status&limit=10',
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const res = http.get(`${SUPABASE_URL}${endpoint}`, {
        headers: {
          'apikey': __ENV.SUPABASE_ANON_KEY,
          'Accept': 'application/json',
        },
      });
      apiDuration.add(Date.now() - startTime);

      check(res, {
        [`${endpoint} responds`]: (r) => r.status === 200 || r.status === 401,
      });
    }
  });

  sleep(2);
}

// Teardown - runs once after all VUs finish
export function teardown(data) {
  console.log('Load test completed');
}
