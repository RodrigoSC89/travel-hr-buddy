#!/usr/bin/env node
/**
 * Route Audit Script for CI/CD
 * Scans the codebase for navigate() calls and paths, validates against VALID_ROUTES
 * 
 * Usage: npx ts-node scripts/audit-routes.ts
 * Exit codes: 0 = success, 1 = broken routes found
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// VALID ROUTES (copy from src/utils/route-audit.ts)
// ============================================
const VALID_ROUTES = new Set([
  "/auth",
  "/central-comando", "/central-comando/visao-geral", "/central-comando/operacoes",
  "/central-comando/executivo", "/central-comando/ia", "/central-comando/resiliencia",
  "/central-comando/alertas", "/central-comando/config",
  "/noc", "/noc-monitoring",
  "/maritime-command", "/fleet-command", "/voyage-command", "/route-optimizer",
  "/mission-command", "/bridge-link", "/drydock-management", "/vessel-contracts",
  "/charter-party", "/cargo-management", "/port-call", "/vessel-cts", "/vessel-history",
  "/maintenance-command", "/predictive-maintenance",
  "/ocean-sonar", "/underwater-drone", "/auto-sub", "/sonar-ai", "/deep-risk-ai",
  "/nautilus-command", "/revolutionary-ai", "/ai-command", "/ai-hub", "/ai-analytics",
  "/revolutionary-features", "/autonomous-command", "/ai-observability",
  "/workflow-command", "/ai-audit", "/voice-assistant", "/ai-operations",
  "/optimization",
  "/telemetria", "/telemetria-command", "/predictive-telemetry", "/satellite-optimizer",
  "/tracking", "/tracking/gnss-live", "/tracking/alerts", "/simulador",
  "/emergency-mode", "/operational-calendar",
  "/api-center", "/api-monitor", "/integrations", "/weather-maritime",
  "/ais-tracker", "/port-api", "/flight-tracker", "/noaa-weather",
  "/opensky-flights", "/earthquake-monitor", "/voice-transcriber",
  "/reports-command", "/documents", "/templates", "/maritime-checklists",
  "/document-workflow", "/export-center", "/advanced-search",
  "/communication-command", "/alerts-command",
  "/peo-dp", "/peotram", "/sgso", "/safety-imca", "/pre-ovid", "/mlc-inspection",
  "/psc-package", "/gmud", "/responsibility-matrix", "/safety-human-factors",
  "/isps-security", "/drill-simulator", "/compliance-one", "/regulations",
  "/risk-matrix", "/evidences", "/due-diligence", "/whistleblower",
  "/security-center", "/security-audit", "/security-scanner", "/compliance-hub",
  "/crew", "/crew-wellness", "/users",
  "/ai-training", "/mentor-dp", "/dp-intelligence",
  "/finance-command", "/voyage-accounting", "/analytics-command",
  "/operations-command", "/procurement-command", "/tasks",
  "/sustainability-score",
  "/travel-command", "/weather-command",
  "/settings", "/integrations-center", "/api-gateway", "/collaboration",
  "/iot", "/gamification", "/roadmap", "/production-deploy",
  "/admin", "/dashboard", "/executive-dashboard", "/system-overview",
  "/analytics", "/backup-audit", "/testing", "/feedback", "/saas-manager",
  "/dev-routes", // Dev dashboard
]);

// Known legacy routes that have redirects (not errors)
const LEGACY_ROUTES = new Set([
  "/fuel-manager", "/vessel-tracking", "/executive-kpis", "/iot-history",
  "/compliance", "/reports", "/channel-manager", "/price-alerts",
  "/analytics-core", "/crew-management", "/fleet", "/maintenance",
  "/missions", "/weather-dashboard",
]);

// Patterns to match navigate calls and paths
const PATTERNS = [
  /navigate\s*\(\s*["'`]([^"'`]+)["'`]/g,          // navigate("/path")
  /navigateTo\s*\(\s*["'`]([^"'`]+)["'`]/g,        // navigateTo("/path")
  /href\s*[=:]\s*["'`]([^"'`]+)["'`]/g,            // href="/path"
  /path\s*[=:]\s*["'`](\/[^"'`]+)["'`]/g,          // path: "/path"
  /to\s*[=:]\s*["'`](\/[^"'`]+)["'`]/g,            // to="/path" (Link component)
  /window\.location\.href\s*=\s*["'`]([^"'`]+)["'`]/g, // window.location.href = "/path"
];

// Directories to scan
const SCAN_DIRS = ['src'];

// Files to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.d\.ts$/,
  /route-audit\.ts$/,       // Ignore the audit file itself
  /legacy-redirects\.tsx$/, // Ignore redirect config
  /DevRoutesDashboard\.tsx$/, // Ignore dev dashboard
];

interface RouteIssue {
  file: string;
  line: number;
  route: string;
  isLegacy: boolean;
}

function isValidRoute(path: string): boolean {
  const basePath = path.split("?")[0].split("#")[0];
  
  if (VALID_ROUTES.has(basePath)) return true;
  
  // Check sub-routes
  for (const validRoute of VALID_ROUTES) {
    if (basePath.startsWith(validRoute + "/")) return true;
  }
  
  // Check dynamic patterns
  if (/^\/\w+\/[a-f0-9-]{36}$/.test(basePath)) return true; // UUID
  if (/^\/\w+\/\d+$/.test(basePath)) return true;            // Numeric ID
  if (/^\/admin\/patches/.test(basePath)) return true;       // Admin patches
  
  return false;
}

function shouldIgnoreFile(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanFile(filePath: string): RouteIssue[] {
  const issues: RouteIssue[] = [];
  
  if (shouldIgnoreFile(filePath)) return issues;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    PATTERNS.forEach(pattern => {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(line)) !== null) {
        const route = match[1];
        
        // Skip external URLs, anchors, and relative paths
        if (route.startsWith('http') || route.startsWith('#') || !route.startsWith('/')) {
          continue;
        }
        
        // Skip valid routes
        if (isValidRoute(route)) {
          continue;
        }
        
        const isLegacy = LEGACY_ROUTES.has(route);
        
        issues.push({
          file: filePath,
          line: lineIndex + 1,
          route,
          isLegacy,
        });
      }
    });
  });
  
  return issues;
}

function walkDir(dir: string, callback: (filePath: string) => void): void {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath, callback);
      }
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      callback(filePath);
    }
  });
}

function main(): void {
  console.log('🔍 Route Audit - Scanning codebase for broken routes...\n');
  
  const allIssues: RouteIssue[] = [];
  
  SCAN_DIRS.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      walkDir(fullPath, (filePath) => {
        const issues = scanFile(filePath);
        allIssues.push(...issues);
      });
    }
  });
  
  // Separate issues
  const brokenRoutes = allIssues.filter(i => !i.isLegacy);
  const legacyRoutes = allIssues.filter(i => i.isLegacy);
  
  // Report legacy routes (warnings)
  if (legacyRoutes.length > 0) {
    console.log('⚠️  LEGACY ROUTES (redirected, but should be updated):');
    console.log('─'.repeat(60));
    legacyRoutes.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    → ${issue.route}`);
    });
    console.log('');
  }
  
  // Report broken routes (errors)
  if (brokenRoutes.length > 0) {
    console.log('❌ BROKEN ROUTES (no redirect, will fail):');
    console.log('─'.repeat(60));
    brokenRoutes.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    → ${issue.route}`);
    });
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   ✅ Valid routes: ${VALID_ROUTES.size}`);
  console.log(`   ⚠️  Legacy routes: ${legacyRoutes.length}`);
  console.log(`   ❌ Broken routes: ${brokenRoutes.length}`);
  console.log('');
  
  if (brokenRoutes.length > 0) {
    console.log('❌ BUILD FAILED: Broken routes detected!');
    console.log('   Fix the routes above or add them to VALID_ROUTES in src/utils/route-audit.ts');
    process.exit(1);
  } else if (legacyRoutes.length > 0) {
    console.log('⚠️  BUILD PASSED with warnings: Consider updating legacy routes');
    process.exit(0);
  } else {
    console.log('✅ BUILD PASSED: All routes are valid!');
    process.exit(0);
  }
}

main();
