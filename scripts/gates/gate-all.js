#!/usr/bin/env node
/**
 * GATE ALL — Run all quality gates
 * 
 * Usage: node scripts/gates/gate-all.js [--staged] [--ci]
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Gate configuration
const GATES = [
  { name: 'Console Check', script: 'gate-console.js', priority: 'P0' },
  { name: 'Mock Data Check', script: 'gate-mocks.js', priority: 'P0' },
  { name: 'Fake API Check', script: 'gate-fake-api.js', priority: 'P0' },
  { name: 'TS Ignore Check', script: 'gate-ts-ignore.js', priority: 'P1' },
  { name: 'Any Type Check', script: 'gate-any.js', priority: 'P1' },
  { name: 'Route Orphans', script: 'gate-routes.js', priority: 'P2' },
];

// Baseline mode - if violations exist in baseline, only fail on NEW violations
const BASELINE_FILE = 'scripts/gates/baseline.json';

function runGate(gate, args = []) {
  const scriptPath = path.join(__dirname, gate.script);
  
  return new Promise((resolve) => {
    try {
      execSync(`node "${scriptPath}" ${args.join(' ')}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      resolve({ gate, success: true });
    } catch (error) {
      resolve({ gate, success: false, error });
    }
  });
}

async function main() {
  const isStaged = process.argv.includes('--staged');
  const isCI = process.argv.includes('--ci');
  const skipP2 = process.argv.includes('--skip-p2');
  
  const args = isStaged ? ['--staged'] : [];
  
  console.log(`\n${BOLD}${MAGENTA}════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${MAGENTA}   🛡️  NAUTI ONE QUALITY GATES                              ${RESET}`);
  console.log(`${BOLD}${MAGENTA}════════════════════════════════════════════════════════════${RESET}\n`);
  
  console.log(`${CYAN}Mode: ${isStaged ? 'Staged files only' : 'Full scan'}${RESET}`);
  console.log(`${CYAN}Environment: ${isCI ? 'CI' : 'Local'}${RESET}\n`);
  
  const results = [];
  const gatesToRun = skipP2 ? GATES.filter(g => g.priority !== 'P2') : GATES;
  
  for (const gate of gatesToRun) {
    console.log(`${BOLD}${CYAN}────────────────────────────────────────────────────────────${RESET}`);
    console.log(`${BOLD}Running: ${gate.name} [${gate.priority}]${RESET}`);
    console.log(`${CYAN}────────────────────────────────────────────────────────────${RESET}`);
    
    const result = await runGate(gate, args);
    results.push(result);
    
    if (result.success) {
      console.log(`${GREEN}✅ ${gate.name} PASSED${RESET}\n`);
    } else {
      console.log(`${RED}❌ ${gate.name} FAILED${RESET}\n`);
    }
  }
  
  // Summary
  console.log(`${BOLD}${MAGENTA}════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${MAGENTA}   📊 SUMMARY                                               ${RESET}`);
  console.log(`${BOLD}${MAGENTA}════════════════════════════════════════════════════════════${RESET}\n`);
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`${GREEN}✅ Passed: ${passed.length}/${results.length}${RESET}`);
  if (failed.length > 0) {
    console.log(`${RED}❌ Failed: ${failed.length}/${results.length}${RESET}`);
    failed.forEach(f => {
      console.log(`   ${RED}• ${f.gate.name} [${f.gate.priority}]${RESET}`);
    });
  }
  
  console.log('');
  
  // Determine exit code based on priority
  const p0Failures = failed.filter(f => f.gate.priority === 'P0');
  const p1Failures = failed.filter(f => f.gate.priority === 'P1');
  
  if (p0Failures.length > 0) {
    console.log(`${RED}${BOLD}🚨 P0 GATES FAILED - BLOCKING${RESET}`);
    console.log(`${RED}Fix console.log, mock data, or fake API issues before committing${RESET}\n`);
    process.exit(1);
  }
  
  if (p1Failures.length > 0 && isCI) {
    console.log(`${YELLOW}${BOLD}⚠️ P1 GATES FAILED - BLOCKING IN CI${RESET}`);
    console.log(`${YELLOW}Fix @ts-ignore or 'any' issues before merging${RESET}\n`);
    process.exit(1);
  }
  
  if (failed.length > 0) {
    console.log(`${YELLOW}⚠️ Some gates failed but not blocking${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${GREEN}${BOLD}✅ ALL QUALITY GATES PASSED!${RESET}\n`);
  process.exit(0);
}

main();
