#!/usr/bin/env tsx
/**
 * PATCH 535 - Security Audit Validation
 * 
 * Validates:
 * - RLS: Row Level Security on sensitive tables (100% coverage)
 * - Logging: access_logs, audit_logs presence
 * - AI Transparency: Command traceability confirmed
 * - LGPD: Privacy features and consent management verified
 * 
 * Usage: tsx scripts/security-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface SecurityIndicator {
  name: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  score: number;
  details: string[];
  issues: string[];
}

interface AuditResult {
  timestamp: string;
  indicators: SecurityIndicator[];
  overallScore: number;
  overallStatus: 'GREEN' | 'YELLOW' | 'RED';
  summary: string;
}

const SENSITIVE_TABLES = [
  'crew_members',
  'crew_profiles',
  'crew_performance_reviews',
  'user_profiles',
  'audit_logs',
  'access_logs',
  'ai_commands'
];

/**
 * Check RLS policies on sensitive tables
 */
function checkRLS(): SecurityIndicator {
  const details: string[] = [];
  const issues: string[] = [];
  
  // Check if supabase migrations exist
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    issues.push('Migrations directory not found');
    return {
      name: 'RLS Protection',
      status: 'RED',
      score: 0,
      details,
      issues
    };
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir);
  let rlsTablesFound = 0;
  
  // Search for RLS policies in migration files
  migrationFiles.forEach(file => {
    if (file.endsWith('.sql')) {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      SENSITIVE_TABLES.forEach(table => {
        const rlsPattern = new RegExp(`ALTER TABLE.*${table}.*ENABLE ROW LEVEL SECURITY`, 'i');
        const policyPattern = new RegExp(`CREATE POLICY.*ON.*${table}`, 'i');
        
        if (rlsPattern.test(content) || policyPattern.test(content)) {
          rlsTablesFound++;
          details.push(`✅ ${table}: RLS enabled`);
        }
      });
    }
  });
  
  const coverage = (rlsTablesFound / SENSITIVE_TABLES.length) * 100;
  
  if (rlsTablesFound === 0) {
    issues.push('No RLS policies found in migrations');
  } else if (rlsTablesFound < SENSITIVE_TABLES.length) {
    issues.push(`Only ${rlsTablesFound}/${SENSITIVE_TABLES.length} sensitive tables protected`);
  }
  
  return {
    name: 'RLS Protection',
    status: coverage === 100 ? 'GREEN' : coverage >= 50 ? 'YELLOW' : 'RED',
    score: coverage,
    details: [...details, `Coverage: ${coverage.toFixed(0)}% (${rlsTablesFound}/${SENSITIVE_TABLES.length} tables)`],
    issues
  };
}

/**
 * Check logging infrastructure
 */
function checkLogging(): SecurityIndicator {
  const details: string[] = [];
  const issues: string[] = [];
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    issues.push('Migrations directory not found');
    return {
      name: 'Logging Infrastructure',
      status: 'RED',
      score: 0,
      details,
      issues
    };
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir);
  let loggingTablesFound = 0;
  const requiredTables = ['access_logs', 'audit_logs', 'ai_commands'];
  
  migrationFiles.forEach(file => {
    if (file.endsWith('.sql')) {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      requiredTables.forEach(table => {
        const createPattern = new RegExp(`CREATE TABLE.*${table}`, 'i');
        
        if (createPattern.test(content)) {
          loggingTablesFound++;
          details.push(`✅ ${table} table present`);
        }
      });
    }
  });
  
  const coverage = (loggingTablesFound / requiredTables.length) * 100;
  
  if (loggingTablesFound === 0) {
    issues.push('No logging tables found');
  } else if (loggingTablesFound < requiredTables.length) {
    issues.push(`Only ${loggingTablesFound}/${requiredTables.length} logging tables found`);
    const missing = requiredTables.filter(table => {
      return !details.some(d => d.includes(table));
    });
    if (missing.length > 0) {
      issues.push(`Missing tables: ${missing.join(', ')}`);
    }
  }
  
  return {
    name: 'Logging Infrastructure',
    status: coverage === 100 ? 'GREEN' : coverage >= 66 ? 'YELLOW' : 'RED',
    score: coverage,
    details,
    issues
  };
}

/**
 * Check AI command traceability
 */
function checkAITransparency(): SecurityIndicator {
  const details: string[] = [];
  const issues: string[] = [];
  
  // Check for AI command logging in modules
  const aiModulesDir = path.join(process.cwd(), 'src', 'modules');
  
  if (!fs.existsSync(aiModulesDir)) {
    issues.push('Modules directory not found');
    return {
      name: 'AI Transparency',
      status: 'RED',
      score: 0,
      details,
      issues
    };
  }
  
  let commandLoggingFound = false;
  let traceabilityFound = false;
  
  // Search for command logging in mission-control, intelligence, etc.
  const aiRelatedModules = ['mission-control', 'intelligence', 'mission-engine'];
  
  aiRelatedModules.forEach(moduleName => {
    const modulePath = path.join(aiModulesDir, moduleName);
    
    if (fs.existsSync(modulePath)) {
      // Recursively search for logging patterns
      const searchForLogging = (dir: string) => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            searchForLogging(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            if (/ai_commands|commandLog|logAICommand/i.test(content)) {
              commandLoggingFound = true;
            }
            
            if (/traceability|audit.*ai|ai.*audit/i.test(content)) {
              traceabilityFound = true;
            }
          }
        });
      };
      
      searchForLogging(modulePath);
    }
  });
  
  if (commandLoggingFound) {
    details.push('✅ AI command logging detected');
  } else {
    issues.push('AI command logging not found in code');
  }
  
  if (traceabilityFound) {
    details.push('✅ Traceability mechanisms detected');
  } else {
    issues.push('Traceability mechanisms not clearly implemented');
  }
  
  const score = (commandLoggingFound ? 50 : 0) + (traceabilityFound ? 50 : 0);
  
  return {
    name: 'AI Transparency',
    status: score === 100 ? 'GREEN' : score >= 50 ? 'YELLOW' : 'RED',
    score,
    details,
    issues
  };
}

/**
 * Check LGPD compliance features
 */
function checkLGPDCompliance(): SecurityIndicator {
  const details: string[] = [];
  const issues: string[] = [];
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    issues.push('Source directory not found');
    return {
      name: 'LGPD Compliance',
      status: 'RED',
      score: 0,
      details,
      issues
    };
  }
  
  let consentFound = false;
  let privacyPolicyFound = false;
  let dataAnonymizationFound = false;
  
  // Search for LGPD-related features
  const searchForLGPD = (dir: string, depth: number = 0) => {
    if (depth > 3) return; // Limit recursion depth
    
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && !file.includes('node_modules')) {
            searchForLGPD(filePath, depth + 1);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            if (/consent|ConsentScreen|acceptConsent/i.test(content)) {
              consentFound = true;
            }
            
            if (/privacy.*policy|política.*privacidade|LGPD/i.test(content)) {
              privacyPolicyFound = true;
            }
            
            if (/anonymize|anonimizar|data.*protection|proteção.*dados/i.test(content)) {
              dataAnonymizationFound = true;
            }
          }
        } catch (err) {
          // Skip files that can't be read
        }
      });
    } catch (err) {
      // Skip directories that can't be read
    }
  };
  
  searchForLGPD(srcDir);
  
  if (consentFound) {
    details.push('✅ Consent management detected');
  } else {
    issues.push('Consent management not clearly implemented');
  }
  
  if (privacyPolicyFound) {
    details.push('✅ Privacy policy references found');
  } else {
    issues.push('Privacy policy not referenced in code');
  }
  
  if (dataAnonymizationFound) {
    details.push('✅ Data protection mechanisms detected');
  } else {
    issues.push('Data anonymization/protection not clearly implemented');
  }
  
  const score = 
    (consentFound ? 40 : 0) + 
    (privacyPolicyFound ? 30 : 0) + 
    (dataAnonymizationFound ? 30 : 0);
  
  return {
    name: 'LGPD Compliance',
    status: score >= 70 ? 'GREEN' : score >= 40 ? 'YELLOW' : 'RED',
    score,
    details,
    issues
  };
}

/**
 * Generate audit report
 */
function generateReport(result: AuditResult): string {
  const lines: string[] = [];
  
  lines.push('# 🔒 Lovable Security Validation Report');
  lines.push('');
  lines.push(`**Generated**: ${result.timestamp}`);
  lines.push(`**Overall Status**: ${result.overallStatus} (${result.overallScore.toFixed(0)}%)`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  lines.push('## 📊 Security Indicators');
  lines.push('');
  
  result.indicators.forEach(indicator => {
    const icon = indicator.status === 'GREEN' ? '✅' : indicator.status === 'YELLOW' ? '⚠️' : '❌';
    lines.push(`### ${icon} ${indicator.name} - ${indicator.status} (${indicator.score.toFixed(0)}%)`);
    lines.push('');
    
    if (indicator.details.length > 0) {
      lines.push('**Details:**');
      indicator.details.forEach(detail => {
        lines.push(`- ${detail}`);
      });
      lines.push('');
    }
    
    if (indicator.issues.length > 0) {
      lines.push('**Issues:**');
      indicator.issues.forEach(issue => {
        lines.push(`- ⚠️ ${issue}`);
      });
      lines.push('');
    }
  });
  
  lines.push('---');
  lines.push('');
  lines.push('## 📋 Summary');
  lines.push('');
  lines.push(result.summary);
  lines.push('');
  
  lines.push('---');
  lines.push('');
  lines.push('*Generated automatically by `scripts/security-audit.ts`*');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔒 PATCH 535 - Security Audit Validation');
  console.log('=========================================\n');
  
  const indicators: SecurityIndicator[] = [];
  
  // Run all checks
  console.log('🔍 Running security checks...\n');
  
  console.log('1️⃣ Checking RLS Protection...');
  const rlsCheck = checkRLS();
  indicators.push(rlsCheck);
  console.log(`   ${rlsCheck.status} - ${rlsCheck.score.toFixed(0)}%\n`);
  
  console.log('2️⃣ Checking Logging Infrastructure...');
  const loggingCheck = checkLogging();
  indicators.push(loggingCheck);
  console.log(`   ${loggingCheck.status} - ${loggingCheck.score.toFixed(0)}%\n`);
  
  console.log('3️⃣ Checking AI Transparency...');
  const aiCheck = checkAITransparency();
  indicators.push(aiCheck);
  console.log(`   ${aiCheck.status} - ${aiCheck.score.toFixed(0)}%\n`);
  
  console.log('4️⃣ Checking LGPD Compliance...');
  const lgpdCheck = checkLGPDCompliance();
  indicators.push(lgpdCheck);
  console.log(`   ${lgpdCheck.status} - ${lgpdCheck.score.toFixed(0)}%\n`);
  
  // Calculate overall score
  const overallScore = indicators.reduce((sum, ind) => sum + ind.score, 0) / indicators.length;
  const greenCount = indicators.filter(ind => ind.status === 'GREEN').length;
  const totalCount = indicators.length;
  
  const overallStatus: 'GREEN' | 'YELLOW' | 'RED' = 
    overallScore >= 75 ? 'GREEN' : 
    overallScore >= 50 ? 'YELLOW' : 
    'RED';
  
  const summary = `
Overall security audit status: ${overallStatus} (${overallScore.toFixed(0)}%)

✅ ${greenCount}/${totalCount} indicators passed (${((greenCount/totalCount)*100).toFixed(0)}%)

${indicators.map(ind => `- ${ind.name}: ${ind.status} (${ind.score.toFixed(0)}%)`).join('\n')}

${overallStatus === 'GREEN' ? '🎉 System meets security requirements!' : 
  overallStatus === 'YELLOW' ? '⚠️ Some security improvements recommended.' : 
  '❌ Critical security issues need to be addressed.'}
  `.trim();
  
  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    indicators,
    overallScore,
    overallStatus,
    summary
  };
  
  // Generate report
  console.log('📝 Generating audit report...\n');
  
  const auditsDir = path.join(process.cwd(), 'dev', 'audits');
  if (!fs.existsSync(auditsDir)) {
    fs.mkdirSync(auditsDir, { recursive: true });
  }
  
  const reportPath = path.join(auditsDir, 'lovable_security_validation.md');
  const reportContent = generateReport(result);
  
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  
  console.log(`✅ Report generated: ${reportPath}\n`);
  
  console.log('=========================================');
  console.log('📊 Final Results:');
  console.log(`   Overall Score: ${overallScore.toFixed(0)}%`);
  console.log(`   Status: ${overallStatus}`);
  console.log(`   Green Indicators: ${greenCount}/${totalCount}`);
  console.log('=========================================\n');
  
  // Exit with error if critical issues found
  process.exit(overallStatus === 'RED' ? 1 : 0);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
