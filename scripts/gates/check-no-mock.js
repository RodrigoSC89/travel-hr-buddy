#!/usr/bin/env node
/**
 * Gate: NO_MOCK
 * Falha se detectar dados mockados em src/ (produção)
 * Exceções: arquivos de teste, pasta mocks/ com feature flag
 */

const { execSync } = require('child_process');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../../src');

// Padrões de mock a detectar
const MOCK_PATTERNS = [
  'MOCK_',
  'SAMPLE_',
  'FAKE_',
  'DUMMY_',
  'mockData',
  'sampleData',
  'fakeData',
];

// Arquivos/pastas permitidos
const ALLOWED_PATTERNS = [
  'tests/',
  '__tests__/',
  '.test.',
  '.spec.',
  'e2e/',
  'services/mocks/', // Mocks com feature flag
  'test-utils',
  'mock-factories',
  'fixtures/',
];

function isAllowedFile(filePath) {
  return ALLOWED_PATTERNS.some(pattern => filePath.includes(pattern));
}

try {
  const pattern = MOCK_PATTERNS.join('\\|');
  
  const result = execSync(
    `grep -rn "${pattern}" "${SRC_DIR}" --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
    { encoding: 'utf8' }
  );

  if (!result.trim()) {
    console.log('✅ Gate NO_MOCK: PASSED (0 mock patterns found)');
    process.exit(0);
  }

  const lines = result.trim().split('\n');
  const violations = lines.filter(line => {
    const filePath = line.split(':')[0];
    return !isAllowedFile(filePath);
  });

  if (violations.length === 0) {
    console.log(`✅ Gate NO_MOCK: PASSED (${lines.length} in tests/fixtures only)`);
    process.exit(0);
  }

  console.error('❌ Gate NO_MOCK: FAILED');
  console.error(`Found ${violations.length} mock patterns in production code:\n`);
  violations.slice(0, 20).forEach(v => console.error(`  ${v}`));
  if (violations.length > 20) {
    console.error(`  ... and ${violations.length - 20} more`);
  }
  console.error('\n💡 Fix: Replace mock data with real Supabase queries');
  process.exit(1);

} catch (error) {
  console.error('❌ Gate NO_MOCK: Error running check', error.message);
  process.exit(1);
}
