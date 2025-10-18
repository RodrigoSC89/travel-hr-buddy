#!/usr/bin/env node

/**
 * RLS POLICY VERIFICATION SCRIPT
 * 
 * Verifies that Row-Level Security (RLS) is enabled on all critical tables
 * and reports tables that need RLS policies.
 * 
 * Usage: node scripts/verify-rls-policies.cjs
 */

const fs = require("fs");
const path = require("path");

// Critical tables that MUST have RLS enabled
const CRITICAL_TABLES = [
  // User & Profile Data
  'profiles',
  'user_roles',
  'user_feature_permissions',
  'user_dashboard_configs',
  
  // Documents & Content
  'documents',
  'document_versions',
  'document_restore_logs',
  'document_comments',
  
  // Checklists
  'operational_checklists',
  'checklist_items',
  'checklist_evidence',
  
  // Maritime Operations
  'vessels',
  'crew_members',
  'crew_assignments',
  'crew_certifications',
  'crew_documents',
  
  // Audit & Compliance
  'assistant_logs',
  'assistant_report_logs',
  'audit_logs',
  'auditorias_imca',
  'auditoria_comentarios',
  'auditoria_alertas',
  'sgso_audits',
  'peotram_audits',
  
  // DP Incidents
  'dp_incidents',
  
  // Quiz & Performance
  'crew_performance_reviews',
  'crew_evaluations',
  
  // Communication
  'conversations',
  'messages',
  'communication_channels',
];

/**
 * Parse migration files to find RLS-enabled tables
 */
function parseRLSFromMigrations() {
  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  
  if (!fs.existsSync(migrationsDir)) {
    console.error("❌ Migrations directory not found:", migrationsDir);
    return { enabledTables: [], policies: {} };
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  const enabledTables = new Set();
  const policies = {};

  files.forEach(file => {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    // Find tables with RLS enabled
    const rlsMatches = content.matchAll(
      /ALTER TABLE (?:public\.)?(\w+) ENABLE ROW LEVEL SECURITY/gi
    );
    
    for (const match of rlsMatches) {
      const tableName = match[1];
      enabledTables.add(tableName);
    }

    // Find policies
    const policyMatches = content.matchAll(
      /CREATE POLICY "([^"]+)"\s+ON (?:public\.)?(\w+)/gi
    );
    
    for (const match of policyMatches) {
      const policyName = match[1];
      const tableName = match[2];
      
      if (!policies[tableName]) {
        policies[tableName] = [];
      }
      policies[tableName].push(policyName);
    }
  });

  return {
    enabledTables: Array.from(enabledTables),
    policies,
  };
}

/**
 * Verify RLS coverage
 */
function verifyRLS() {
  console.log("🔒 RLS POLICY VERIFICATION");
  console.log("=" .repeat(70));
  console.log();

  const { enabledTables, policies } = parseRLSFromMigrations();

  console.log(`📊 Statistics:`);
  console.log(`   - Tables with RLS enabled: ${enabledTables.length}`);
  console.log(`   - Total policies defined: ${Object.values(policies).flat().length}`);
  console.log();

  // Check critical tables
  console.log("🔍 Critical Tables Verification:");
  console.log();

  const missing = [];
  const covered = [];

  CRITICAL_TABLES.forEach(table => {
    const hasRLS = enabledTables.includes(table);
    const tablePolicies = policies[table] || [];
    
    if (hasRLS && tablePolicies.length > 0) {
      covered.push(table);
      console.log(`✅ ${table.padEnd(35)} - ${tablePolicies.length} policies`);
    } else if (hasRLS && tablePolicies.length === 0) {
      missing.push({ table, reason: 'No policies defined' });
      console.log(`⚠️  ${table.padEnd(35)} - RLS enabled but no policies`);
    } else {
      missing.push({ table, reason: 'RLS not enabled' });
      console.log(`❌ ${table.padEnd(35)} - RLS not enabled`);
    }
  });

  console.log();
  console.log("=" .repeat(70));
  console.log();

  if (missing.length === 0) {
    console.log("🎉 SUCCESS: All critical tables have RLS enabled with policies!");
    console.log();
    console.log(`Coverage: ${covered.length}/${CRITICAL_TABLES.length} (100%)`);
  } else {
    console.log(`⚠️  WARNING: ${missing.length} critical tables need attention:`);
    console.log();
    
    missing.forEach(({ table, reason }) => {
      console.log(`   - ${table}: ${reason}`);
    });
    
    console.log();
    console.log(`Coverage: ${covered.length}/${CRITICAL_TABLES.length} (${Math.round(covered.length / CRITICAL_TABLES.length * 100)}%)`);
  }

  console.log();
  console.log("=" .repeat(70));
  
  // Show sample of policies
  console.log();
  console.log("📋 Sample Policies:");
  console.log();
  
  const sampleTables = ['documents', 'operational_checklists', 'assistant_logs'].filter(t => 
    policies[t] && policies[t].length > 0
  );

  sampleTables.forEach(table => {
    console.log(`\n${table}:`);
    policies[table].slice(0, 3).forEach(policy => {
      console.log(`  - ${policy}`);
    });
    if (policies[table].length > 3) {
      console.log(`  ... and ${policies[table].length - 3} more`);
    }
  });

  console.log();
  console.log("=" .repeat(70));
  console.log();
  console.log("✅ Verification complete!");
  console.log();
  console.log("For detailed RLS documentation, see:");
  console.log("  - docs/internal/SECURITY.md");
  console.log("  - supabase/migrations/*.sql");
  console.log();

  return missing.length === 0;
}

/**
 * Generate RLS report
 */
function generateReport() {
  const { enabledTables, policies } = parseRLSFromMigrations();
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_tables_with_rls: enabledTables.length,
      total_policies: Object.values(policies).flat().length,
      critical_tables_checked: CRITICAL_TABLES.length,
      critical_tables_covered: CRITICAL_TABLES.filter(t => 
        enabledTables.includes(t) && policies[t]?.length > 0
      ).length,
    },
    tables: enabledTables.map(table => ({
      name: table,
      policies: policies[table] || [],
      is_critical: CRITICAL_TABLES.includes(table),
    })),
  };

  const reportPath = path.join(__dirname, "..", "docs", "RLS_COVERAGE_REPORT.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Report saved to: ${reportPath}`);
}

// Run verification
if (require.main === module) {
  const success = verifyRLS();
  
  // Optionally generate detailed report
  if (process.argv.includes('--report')) {
    console.log();
    generateReport();
  }
  
  process.exit(success ? 0 : 1);
}

module.exports = { verifyRLS, parseRLSFromMigrations };
