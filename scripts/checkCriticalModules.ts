/**
 * 🔍 Critical Modules Verification Script
 * Checks if all 8 critical modules exist in the project
 * 
 * Usage: npx ts-node scripts/checkCriticalModules.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface CriticalModule {
  name: string;
  route: string;
  pageFile: string;
  edgeFunction?: string;
}

const criticalModules: CriticalModule[] = [
  {
    name: 'Vessel Contracts + Downtime AI',
    route: '/vessel-contracts',
    pageFile: 'src/pages/VesselContractsUnified.tsx',
    edgeFunction: 'supabase/functions/vessel-downtime-ai'
  },
  {
    name: 'CTS + Crew Compliance',
    route: '/vessel-cts',
    pageFile: 'src/pages/VesselCTS.tsx'
  },
  {
    name: 'IMCA Incidents Study',
    route: '/safety-imca',
    pageFile: 'src/pages/SafetyIMCA.tsx',
    edgeFunction: 'supabase/functions/imca-incidents-ai'
  },
  {
    name: 'Vessel History',
    route: '/vessel-history',
    pageFile: 'src/pages/VesselHistory.tsx'
  },
  {
    name: 'Responsibility Matrix',
    route: '/responsibility-matrix',
    pageFile: 'src/pages/ResponsibilityMatrix.tsx',
    edgeFunction: 'supabase/functions/responsibility-matrix-dispatch'
  },
  {
    name: 'GMUD Management',
    route: '/gmud',
    pageFile: 'src/pages/GMUD.tsx',
    edgeFunction: 'supabase/functions/gmud-workflow'
  },
  {
    name: 'PEOTRAM AI + Voice',
    route: '/peotram',
    pageFile: 'src/pages/PEOTRAM.tsx',
    edgeFunction: 'supabase/functions/peotram-generate-evidence'
  },
  {
    name: 'Human Factors / Neuroscience',
    route: '/safety-human-factors',
    pageFile: 'src/pages/SafetyHumanFactors.tsx',
    edgeFunction: 'supabase/functions/human-factors-assessment'
  }
];

function checkFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(path.resolve(process.cwd(), filePath));
  } catch {
    return false;
  }
}

function checkDirectoryExists(dirPath: string): boolean {
  try {
    const fullPath = path.resolve(process.cwd(), dirPath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  } catch {
    return false;
  }
}

function runCheck(): void {
  console.log('🔍 Checking Critical Modules...\n');
  console.log('='.repeat(60));

  let passCount = 0;
  let failCount = 0;
  const results: string[] = [];

  for (const module of criticalModules) {
    const pageExists = checkFileExists(module.pageFile);
    const edgeFunctionExists = module.edgeFunction 
      ? checkDirectoryExists(module.edgeFunction) 
      : true;

    const status = pageExists && edgeFunctionExists ? '✅' : '❌';
    
    if (pageExists && edgeFunctionExists) {
      passCount++;
    } else {
      failCount++;
    }

    const details: string[] = [];
    details.push(`Page: ${pageExists ? '✅' : '❌'} ${module.pageFile}`);
    if (module.edgeFunction) {
      details.push(`Edge: ${edgeFunctionExists ? '✅' : '❌'} ${module.edgeFunction}`);
    }

    console.log(`\n${status} ${module.name}`);
    console.log(`   Route: ${module.route}`);
    details.forEach(d => console.log(`   ${d}`));

    results.push(`| ${module.name} | ${module.route} | ${status} |`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 SUMMARY: ${passCount}/${criticalModules.length} modules verified`);
  
  if (failCount === 0) {
    console.log('\n✅ All critical modules are present in the project!');
  } else {
    console.log(`\n⚠️  ${failCount} module(s) need attention.`);
  }

  // Output markdown table
  console.log('\n📋 Markdown Report:');
  console.log('| Module | Route | Status |');
  console.log('|--------|-------|--------|');
  results.forEach(r => console.log(r));
}

// Run the check
runCheck();
