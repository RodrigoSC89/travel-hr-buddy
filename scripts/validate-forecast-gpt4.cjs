#!/usr/bin/env node
/**
 * Validation script for MMI Forecast GPT-4 implementation
 * Checks if all required components are in place before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MMI Forecast GPT-4 Implementation Validation\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check 1: Migration files exist
console.log('📦 Checking migration files...');
const migrations = [
  'supabase/migrations/20251019230000_create_mmi_logs.sql',
  'supabase/migrations/20251019230001_seed_mmi_logs.sql'
];

migrations.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✅ Found: ${file}`);
  } else {
    checks.failed.push(`❌ Missing: ${file}`);
  }
});

// Check 2: Function file exists and has correct structure
console.log('\n🔧 Checking Supabase function...');
const functionFile = 'supabase/functions/send-forecast-report/index.ts';
const functionPath = path.join(__dirname, '..', functionFile);

if (fs.existsSync(functionPath)) {
  const content = fs.readFileSync(functionPath, 'utf8');
  
  checks.passed.push(`✅ Found: ${functionFile}`);
  
  // Check for key implementations
  const requiredPatterns = [
    { pattern: /mmi_logs/, name: 'mmi_logs query' },
    { pattern: /generateForecastForJob/, name: 'generateForecastForJob function' },
    { pattern: /gpt-4/, name: 'GPT-4 model reference' },
    { pattern: /executado_em/, name: 'executado_em field' },
    { pattern: /temperature:\s*0\.3/, name: 'Temperature 0.3' },
    { pattern: /engenheiro especialista em manutenção offshore/, name: 'System prompt' },
    { pattern: /dataRegex/, name: 'Date extraction regex' },
    { pattern: /riscoRegex/, name: 'Risk extraction regex' },
    { pattern: /mmi_forecasts/, name: 'mmi_forecasts save' }
  ];
  
  requiredPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      checks.passed.push(`✅ Implemented: ${name}`);
    } else {
      checks.failed.push(`❌ Missing: ${name}`);
    }
  });
} else {
  checks.failed.push(`❌ Missing: ${functionFile}`);
}

// Check 3: Test file exists and has sufficient coverage
console.log('\n🧪 Checking test coverage...');
const testFile = 'src/tests/send-forecast-report.test.ts';
const testPath = path.join(__dirname, '..', testFile);

if (fs.existsSync(testPath)) {
  const content = fs.readFileSync(testPath, 'utf8');
  checks.passed.push(`✅ Found: ${testFile}`);
  
  // Count test cases
  const testMatches = content.match(/it\(/g);
  const testCount = testMatches ? testMatches.length : 0;
  
  if (testCount >= 20) {
    checks.passed.push(`✅ Test coverage: ${testCount} tests`);
  } else {
    checks.warnings.push(`⚠️  Limited test coverage: ${testCount} tests (expected 20+)`);
  }
} else {
  checks.failed.push(`❌ Missing: ${testFile}`);
}

// Check 4: Documentation exists
console.log('\n📚 Checking documentation...');
const docs = [
  'MMI_FORECAST_GPT4_IMPLEMENTATION.md',
  'MMI_FORECAST_GPT4_QUICKREF.md',
  'MMI_FORECAST_GPT4_VISUAL_SUMMARY.md'
];

docs.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✅ Found: ${file}`);
  } else {
    checks.warnings.push(`⚠️  Missing: ${file}`);
  }
});

// Check 5: Environment variables documented
console.log('\n🔐 Checking environment variables documentation...');
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'FORECAST_REPORT_EMAILS',
  'EMAIL_FROM'
];

const docPath = path.join(__dirname, '..', 'MMI_FORECAST_GPT4_IMPLEMENTATION.md');
if (fs.existsSync(docPath)) {
  const docContent = fs.readFileSync(docPath, 'utf8');
  
  requiredEnvVars.forEach(envVar => {
    if (docContent.includes(envVar)) {
      checks.passed.push(`✅ Documented: ${envVar}`);
    } else {
      checks.warnings.push(`⚠️  Not documented: ${envVar}`);
    }
  });
}

// Print results
console.log('\n' + '═'.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('═'.repeat(60));

if (checks.passed.length > 0) {
  console.log('\n✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
}

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📈 SUMMARY');
console.log('═'.repeat(60));
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);

// Final verdict
console.log('\n' + '═'.repeat(60));
if (checks.failed.length === 0) {
  console.log('✅ VALIDATION PASSED - Ready for deployment!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Deploy migrations to Supabase');
  console.log('   2. Configure environment variables in Supabase dashboard');
  console.log('   3. Test function manually via Supabase UI');
  console.log('   4. Enable cron schedule: "0 6 * * 1"');
  console.log('   5. Monitor cron_execution_logs table');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED - Fix issues before deployment!');
  console.log('\n🔧 Required Actions:');
  checks.failed.forEach(fail => console.log(`   • ${fail}`));
  process.exit(1);
}
