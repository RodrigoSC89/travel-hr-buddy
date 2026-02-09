/**
 * NAUTI ONE — Navigation Consistency Audit Script
 * Validates sidebar-routes.ts against actual App.tsx routes
 * 
 * Usage: npx tsx src/scripts/auditNavConsistency.ts
 * Exit code 1 if critical issues found
 */

import { SIDEBAR_ROUTES, getAllRoutes } from '../config/sidebar-routes';

interface AuditResult {
  level: 'critical' | 'warning' | 'info';
  message: string;
  path?: string;
}

function auditNavConsistency(): AuditResult[] {
  const results: AuditResult[] = [];
  const allRoutes = getAllRoutes();

  // 1. Check for duplicate paths
  const pathMap = new Map<string, string[]>();
  for (const route of allRoutes) {
    const basePath = route.path.split('?')[0];
    if (!pathMap.has(basePath)) {
      pathMap.set(basePath, []);
    }
    pathMap.get(basePath)!.push(route.label);
  }

  for (const [path, labels] of pathMap) {
    if (labels.length > 1) {
      results.push({
        level: 'warning',
        message: `Duplicate base path "${path}" used by: ${labels.join(', ')}`,
        path,
      });
    }
  }

  // 2. Check all sidebar groups have items
  for (const group of SIDEBAR_ROUTES) {
    if (group.items.length === 0) {
      results.push({
        level: 'critical',
        message: `Group "${group.title}" has no items`,
      });
    }
  }

  // 3. Check for empty paths
  for (const route of allRoutes) {
    if (!route.path || route.path.trim() === '') {
      results.push({
        level: 'critical',
        message: `Route "${route.label}" has empty path`,
        path: route.path,
      });
    }
  }

  // 4. Check paths start with /
  for (const route of allRoutes) {
    const basePath = route.path.split('?')[0];
    if (!basePath.startsWith('/')) {
      results.push({
        level: 'critical',
        message: `Route "${route.label}" path "${route.path}" doesn't start with /`,
        path: route.path,
      });
    }
  }

  // 5. Count stats
  results.push({
    level: 'info',
    message: `Total groups: ${SIDEBAR_ROUTES.length}`,
  });
  results.push({
    level: 'info',
    message: `Total routes: ${allRoutes.length}`,
  });
  results.push({
    level: 'info',
    message: `Unique base paths: ${pathMap.size}`,
  });

  return results;
}

// Run audit
const results = auditNavConsistency();
const criticals = results.filter(r => r.level === 'critical');
const warnings = results.filter(r => r.level === 'warning');
const infos = results.filter(r => r.level === 'info');

console.log('\n═══════════════════════════════════════');
console.log('  NAUTI ONE — Navigation Audit Report');
console.log('═══════════════════════════════════════\n');

for (const info of infos) {
  console.log(`ℹ️  ${info.message}`);
}
console.log('');

if (warnings.length > 0) {
  console.log(`⚠️  WARNINGS (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`   - ${w.message}`);
  }
  console.log('');
}

if (criticals.length > 0) {
  console.log(`❌ CRITICAL (${criticals.length}):`);
  for (const c of criticals) {
    console.log(`   - ${c.message}`);
  }
  console.log('\n❌ AUDIT FAILED — Fix critical issues before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ AUDIT PASSED — No critical navigation issues found.\n');
  process.exit(0);
}
