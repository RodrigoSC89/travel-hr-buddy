/* global __ENV */

/**
 * K6 Enterprise Scale Stress Test
 * Simulates 10K+ vessels, 500+ concurrent users, 1M+ records
 * 
 * Run: k6 run tests/stress/k6-enterprise-scale.js
 * With cloud: k6 cloud tests/stress/k6-enterprise-scale.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

// Custom metrics
const failureRate = new Rate("failed_requests");
const latency = new Trend("request_latency");
const requestCount = new Counter("total_requests");
const activeVUs = new Gauge("active_vus");
const dbQueryTime = new Trend("db_query_time");

// ═══════════════════════════════════════════
// Test Profiles
// ═══════════════════════════════════════════

const PROFILES = {
  // Smoke test: quick validation
  smoke: {
    stages: [
      { duration: "30s", target: 5 },
      { duration: "1m", target: 5 },
      { duration: "30s", target: 0 },
    ],
    thresholds: {
      "http_req_duration": ["p(95)<3000"],
      "failed_requests": ["rate<0.05"],
    },
  },

  // Load test: normal operation (50 concurrent users ~ 200 vessels)
  load: {
    stages: [
      { duration: "2m", target: 50 },
      { duration: "5m", target: 50 },
      { duration: "2m", target: 0 },
    ],
    thresholds: {
      "http_req_duration": ["p(95)<2000", "p(99)<5000"],
      "failed_requests": ["rate<0.05"],
    },
  },

  // Stress test: push beyond limits (200 users ~ 1000 vessels)
  stress: {
    stages: [
      { duration: "2m", target: 50 },
      { duration: "3m", target: 100 },
      { duration: "3m", target: 200 },
      { duration: "5m", target: 200 },
      { duration: "3m", target: 300 },
      { duration: "5m", target: 300 },
      { duration: "2m", target: 0 },
    ],
    thresholds: {
      "http_req_duration": ["p(95)<5000"],
      "failed_requests": ["rate<0.10"],
    },
  },

  // Spike test: sudden traffic surge (morning shift change simulation)
  spike: {
    stages: [
      { duration: "1m", target: 10 },
      { duration: "30s", target: 500 },  // Spike!
      { duration: "2m", target: 500 },
      { duration: "30s", target: 10 },   // Drop
      { duration: "1m", target: 0 },
    ],
    thresholds: {
      "http_req_duration": ["p(95)<10000"],
      "failed_requests": ["rate<0.15"],
    },
  },

  // Soak test: prolonged load for memory leaks (30 min)
  soak: {
    stages: [
      { duration: "2m", target: 100 },
      { duration: "26m", target: 100 },
      { duration: "2m", target: 0 },
    ],
    thresholds: {
      "http_req_duration": ["p(95)<3000"],
      "failed_requests": ["rate<0.05"],
    },
  },
};

const profile = __ENV.PROFILE || "load";
export const options = PROFILES[profile] || PROFILES.load;

// ═══════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════

const SUPABASE_URL = __ENV.SUPABASE_URL || "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_KEY = __ENV.SUPABASE_KEY || __ENV.VITE_SUPABASE_KEY;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "count=exact",
};

// ═══════════════════════════════════════════
// Maritime-Realistic Scenarios
// ═══════════════════════════════════════════

export default function () {
  activeVUs.add(__VU);
  const scenario = Math.random();

  if (scenario < 0.25) {
    group("Dashboard KPIs", () => testDashboardKPIs());
  } else if (scenario < 0.45) {
    group("Fleet Operations", () => testFleetOperations());
  } else if (scenario < 0.60) {
    group("Crew Management", () => testCrewManagement());
  } else if (scenario < 0.75) {
    group("Maintenance Queries", () => testMaintenanceQueries());
  } else if (scenario < 0.85) {
    group("Compliance Checks", () => testComplianceChecks());
  } else if (scenario < 0.92) {
    group("Document Search", () => testDocumentSearch());
  } else {
    group("Write Operations", () => testWriteOperations());
  }

  sleep(Math.random() * 2 + 0.5);
}

// ═══════════════════════════════════════════
// Test Scenarios
// ═══════════════════════════════════════════

function testDashboardKPIs() {
  // Simulates loading the main command dashboard
  const startTime = Date.now();
  
  // RPC call - most expensive query
  const rpcRes = http.post(
    `${SUPABASE_URL}/rest/v1/rpc/get_dashboard_kpis`,
    "{}",
    { headers }
  );
  
  const duration = Date.now() - startTime;
  latency.add(duration);
  dbQueryTime.add(duration);
  requestCount.add(1);

  const success = check(rpcRes, {
    "KPI status 200": (r) => r.status === 200,
    "KPI latency <3s": () => duration < 3000,
    "KPI has data": (r) => {
      try { return r.json() !== null; } catch { return false; }
    },
  });
  failureRate.add(!success);
}

function testFleetOperations() {
  // Vessel list with pagination
  const res1 = http.get(
    `${SUPABASE_URL}/rest/v1/vessels?select=id,name,vessel_type,status,imo_number,flag_state&order=name.asc&limit=50`,
    { headers }
  );
  trackRequest(res1, "vessels_list");

  // Voyage plans
  const res2 = http.get(
    `${SUPABASE_URL}/rest/v1/voyage_plans?select=id,voyage_number,status,origin_port,destination_port&order=created_at.desc&limit=20`,
    { headers }
  );
  trackRequest(res2, "voyage_plans");
}

function testCrewManagement() {
  // Crew list with certifications count
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/crew_members?select=id,full_name,rank,status,nationality,vessel_id&order=full_name.asc&limit=50`,
    { headers }
  );
  trackRequest(res, "crew_list");

  // Certifications expiring
  const res2 = http.get(
    `${SUPABASE_URL}/rest/v1/crew_certifications?select=id,certification_name,expiry_date,status&expiry_date=lt.${getFutureDate(30)}&order=expiry_date.asc&limit=20`,
    { headers }
  );
  trackRequest(res2, "expiring_certs");
}

function testMaintenanceQueries() {
  // Pending maintenance tasks
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/maintenance_tasks?select=id,title,status,priority,due_date,component_name&status=eq.pending&order=due_date.asc&limit=50`,
    { headers }
  );
  trackRequest(res, "maintenance_pending");

  // Work orders
  const res2 = http.get(
    `${SUPABASE_URL}/rest/v1/pms_work_orders?select=id,work_order_number,status,priority&order=created_at.desc&limit=30`,
    { headers }
  );
  trackRequest(res2, "work_orders");
}

function testComplianceChecks() {
  // Audit trail
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/internal_audits?select=id,audit_number,status,audit_type&order=created_at.desc&limit=20`,
    { headers }
  );
  trackRequest(res, "audits");

  // Non-conformities
  const res2 = http.get(
    `${SUPABASE_URL}/rest/v1/non_conformities?select=id,title,status,severity&status=neq.closed&order=created_at.desc&limit=30`,
    { headers }
  );
  trackRequest(res2, "non_conformities");
}

function testDocumentSearch() {
  // Full text search simulation
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/ai_documents?select=id,file_name,file_type,category&order=created_at.desc&limit=20`,
    { headers }
  );
  trackRequest(res, "document_search");
}

function testWriteOperations() {
  // Simulate creating an AI audit log entry (safe write)
  const payload = JSON.stringify({
    user_input: `Stress test entry ${Date.now()}`,
    module_name: "stress_test",
    interaction_type: "automated_test",
    ai_response: "Test response for load validation",
  });

  const res = http.post(
    `${SUPABASE_URL}/rest/v1/ai_audit_logs`,
    payload,
    { headers: { ...headers, "Prefer": "return=minimal" } }
  );
  trackRequest(res, "write_audit_log", [201, 409]);
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function trackRequest(response, name, validStatuses) {
  const duration = response.timings.duration;
  latency.add(duration);
  requestCount.add(1);

  const statuses = validStatuses || [200, 206];
  const success = check(response, {
    [`${name} status OK`]: (r) => statuses.includes(r.status),
    [`${name} latency <5s`]: () => duration < 5000,
  });
  failureRate.add(!success);
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ═══════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════

export function handleSummary(data) {
  const summary = generateSummary(data);
  return {
    stdout: summary,
    [`reports/enterprise-scale-${profile}-${Date.now()}.json`]: JSON.stringify(data, null, 2),
  };
}

function generateSummary(data) {
  const m = data.metrics;
  let s = "\n══════════════════════════════════════════════════════\n";
  s += `  NAUTI ONE - ENTERPRISE SCALE TEST (${profile.toUpperCase()})\n`;
  s += "══════════════════════════════════════════════════════\n";
  s += `  Total Requests:    ${m.total_requests?.values?.count || "N/A"}\n`;
  s += `  Failure Rate:      ${((m.failed_requests?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  s += `  Avg Latency:       ${(m.request_latency?.values?.avg || 0).toFixed(0)}ms\n`;
  s += `  P95 Latency:       ${(m.request_latency?.values?.["p(95)"] || 0).toFixed(0)}ms\n`;
  s += `  P99 Latency:       ${(m.request_latency?.values?.["p(99)"] || 0).toFixed(0)}ms\n`;
  s += `  Max Latency:       ${(m.request_latency?.values?.max || 0).toFixed(0)}ms\n`;
  s += `  Max VUs:           ${m.active_vus?.values?.max || "N/A"}\n`;
  s += "══════════════════════════════════════════════════════\n";
  
  // Pass/fail assessment
  const p95 = m.request_latency?.values?.["p(95)"] || 0;
  const errRate = (m.failed_requests?.values?.rate || 0) * 100;
  
  if (p95 < 2000 && errRate < 5) {
    s += "  ✅ PASSED — Enterprise-ready performance\n";
  } else if (p95 < 5000 && errRate < 10) {
    s += "  ⚠️  WARNING — Acceptable but needs optimization\n";
  } else {
    s += "  ❌ FAILED — Does not meet enterprise SLA\n";
  }
  s += "══════════════════════════════════════════════════════\n";
  return s;
}
