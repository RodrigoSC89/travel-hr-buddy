#!/usr/bin/env node
/**
 * Gate: NO_CONSOLE
 * Falha se detectar console.* em src/ (produção)
 * Exceções: arquivos de teste, logger permitido
 */

const { execSync } = require('child_process');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../../src');

// Arquivos/pastas permitidos
const ALLOWED_PATTERNS = [
  'tests/',
  '__tests__/',
  '.test.',
  '.spec.',
  'e2e/',
  'lib/logger.ts', // Logger central permitido
];

function isAllowedFile(filePath) {
  return ALLOWED_PATTERNS.some(pattern => filePath.includes(pattern));
}

try {
  // Busca console.* em src/
  const result = execSync(
    `grep -rn "console\\." "${SRC_DIR}" --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
    { encoding: 'utf8' }
  );

  if (!result.trim()) {
    console.log('✅ Gate NO_CONSOLE: PASSED (0 console.* found)');
    process.exit(0);
  }

  const lines = result.trim().split('\n');
  const violations = lines.filter(line => {
    const filePath = line.split(':')[0];
    return !isAllowedFile(filePath);
  });

  if (violations.length === 0) {
    console.log(`✅ Gate NO_CONSOLE: PASSED (${lines.length} in tests/logger only)`);
    process.exit(0);
  }

  console.error('❌ Gate NO_CONSOLE: FAILED');
  console.error(`Found ${violations.length} console.* in production code:\n`);
  violations.forEach(v => console.error(`  ${v}`));
  console.error('\n💡 Fix: Replace console.* with logger.* or toast');
  process.exit(1);

} catch (error) {
  console.error('❌ Gate NO_CONSOLE: Error running check', error.message);
  process.exit(1);
}
