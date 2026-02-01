/**
 * GATE: No Mock in Production
 * 
 * PATCH OPS-V7 — Bloqueia qualquer mock data em código de produção
 * REGRA: Arquivos em src/ (exceto tests/) não podem ter mock data
 */

const fs = require('fs');
const path = require('path');

// Padrões que indicam mock data
const MOCK_PATTERNS = [
  /\bMOCK_[A-Z_]+\b/,                    // MOCK_DATA, MOCK_ITEMS, etc.
  /\bSAMPLE_[A-Z_]+\b/,                  // SAMPLE_DATA
  /\bFAKE_[A-Z_]+\b/,                    // FAKE_DATA
  /\bDUMMY_[A-Z_]+\b/,                   // DUMMY_DATA
  /\bmockData\b/,                        // mockData
  /\bsampleData\b/,                      // sampleData
  /\bfakeData\b/,                        // fakeData
  /\bgetMock[A-Z]\w*\(/,                 // getMockVessels(), getMockData()
  /\bgenerateMock[A-Z]\w*\(/,            // generateMockData()
  /\bcreateStub[A-Z]\w*\(/,              // createStubData()
];

// Arquivos/diretórios permitidos (testes, fixtures, mocks de serviços)
const ALLOWED_PATHS = [
  '/tests/',
  '/test/',
  '/__tests__/',
  '/__mocks__/',
  '/fixtures/',
  '/mocks/',
  '.test.',
  '.spec.',
  '.mock.',
  '.fixture.',
  'test-utils',
  'test-environment',
];

// Arquivos específicos permitidos
const ALLOWED_FILES = [
  'services/mocks/',        // Mock services para fallback de integrações
  'lib/AI/audit-logger.ts', // Usa MOCK_ para naming interno
];

function isAllowedPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Verificar diretórios/padrões permitidos
  for (const allowed of ALLOWED_PATHS) {
    if (normalizedPath.includes(allowed)) {
      return true;
    }
  }
  
  // Verificar arquivos específicos
  for (const allowed of ALLOWED_FILES) {
    if (normalizedPath.includes(allowed)) {
      return true;
    }
  }
  
  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];
  
  lines.forEach((line, index) => {
    // Ignorar comentários
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      return;
    }
    
    // Verificar cada padrão
    for (const pattern of MOCK_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          line: index + 1,
          content: line.trim().slice(0, 100),
          pattern: pattern.toString(),
        });
        break; // Uma violação por linha é suficiente
      }
    }
  });
  
  return violations;
}

function scanDirectory(dir, violations = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorar node_modules e diretórios de build
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }
      scanDirectory(fullPath, violations);
    } else if (entry.isFile()) {
      // Apenas arquivos TypeScript/JavaScript
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        continue;
      }
      
      // Verificar se é um arquivo permitido
      if (isAllowedPath(fullPath)) {
        continue;
      }
      
      const fileViolations = scanFile(fullPath);
      if (fileViolations.length > 0) {
        violations.push({
          file: fullPath,
          violations: fileViolations,
        });
      }
    }
  }
  
  return violations;
}

// Executar
const srcDir = path.join(process.cwd(), 'src');

if (!fs.existsSync(srcDir)) {
  console.error('❌ Diretório src/ não encontrado');
  process.exit(1);
}

console.log('🔍 Verificando mock data em produção...\n');

const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log('✅ GATE PASSED: Nenhum mock data encontrado em produção\n');
  process.exit(0);
} else {
  console.log(`❌ GATE FAILED: ${results.length} arquivo(s) com mock data em produção\n`);
  
  let totalViolations = 0;
  
  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.file);
    console.log(`\n📄 ${relativePath}`);
    
    for (const v of result.violations) {
      console.log(`   L${v.line}: ${v.content}`);
      totalViolations++;
    }
  }
  
  console.log(`\n📊 Total: ${totalViolations} violações em ${results.length} arquivos`);
  console.log('\n💡 Soluções:');
  console.log('   - Substituir mock data por hooks Supabase reais');
  console.log('   - Usar EmptyState + CTA quando não há dados');
  console.log('   - Mover para tests/ se for apenas para teste');
  console.log('   - Usar IntegrationStatus.NOT_CONFIGURED para integrações não configuradas\n');
  
  process.exit(1);
}
