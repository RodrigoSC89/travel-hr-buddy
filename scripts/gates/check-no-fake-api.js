#!/usr/bin/env node
/**
 * Gate: NO_FAKE_API
 * 
 * Verifica se há simulação de API em código de produção
 * - Promise.resolve() retornando dados fake
 * - setTimeout() simulando latência de rede
 * 
 * Permitido apenas em:
 * - Arquivos de teste
 * - Fixtures
 * - Performance utils (delays legítimos)
 * 
 * Uso: node scripts/gates/check-no-fake-api.js
 */

const { execSync } = require('child_process');

const ALLOWED_PATTERNS = [
  '.test.',
  '.spec.',
  '__tests__',
  'e2e/',
  'tests/',
  'fixtures/',
  'services/mocks/',
  // Estes usam Promise.resolve legitimamente para caching/guards
  'smart-loader.ts',
  'critical-resource-loader.ts',
  'connection-aware.ts',
  'useLoopGuard.ts',
  'mqtt/publisher.ts',
];

function isAllowedFile(filePath) {
  return ALLOWED_PATTERNS.some(pattern => filePath.includes(pattern));
}

function checkNoFakeAPI() {
  console.log('🔍 Gate: NO_FAKE_API - Verificando simulação de API...\n');
  
  let hasViolations = false;
  const violations = [];
  
  // Padrões que indicam simulação de API
  const patterns = [
    { regex: 'return Promise\\.resolve\\(\\{', desc: 'Promise.resolve com objeto (possível mock)' },
    { regex: 'return Promise\\.resolve\\(\\[', desc: 'Promise.resolve com array (possível mock)' },
    { regex: 'setTimeout.*resolve.*\\d{3,}', desc: 'setTimeout simulando delay de rede' },
  ];
  
  for (const { regex, desc } of patterns) {
    try {
      const result = execSync(
        `grep -rn "${regex}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
      );
      
      if (result.trim()) {
        const lines = result.trim().split('\n');
        for (const line of lines) {
          const [filePath] = line.split(':');
          if (!isAllowedFile(filePath)) {
            violations.push({ desc, line });
            hasViolations = true;
          }
        }
      }
    } catch (error) {
      // grep retorna exit code 1 quando não encontra nada
    }
  }
  
  if (hasViolations) {
    console.log('❌ FALHA: Simulação de API encontrada em produção:\n');
    
    violations.slice(0, 15).forEach(v => {
      console.log(`  [${v.desc}]`);
      console.log(`    ${v.line}\n`);
    });
    
    if (violations.length > 15) {
      console.log(`  ... e mais ${violations.length - 15} ocorrências`);
    }
    
    console.log(`\n📊 Total de violações: ${violations.length}`);
    console.log('\n💡 Substitua por:');
    console.log('   - supabase.from().select() para queries');
    console.log('   - supabase.functions.invoke() para edge functions');
    console.log('   - fetch() real com error handling');
    process.exit(1);
  }
  
  console.log('✅ SUCESSO: Nenhuma simulação de API encontrada em produção\n');
  process.exit(0);
}

checkNoFakeAPI();
