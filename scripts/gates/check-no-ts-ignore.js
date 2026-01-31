#!/usr/bin/env node
/**
 * Gate: NO_TS_IGNORE
 * Falha se detectar @ts-ignore ou @ts-nocheck em src/ (produção)
 * Exceções: arquivos de teste
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
];

function isAllowedFile(filePath) {
  return ALLOWED_PATTERNS.some(pattern => filePath.includes(pattern));
}

try {
  const result = execSync(
    `grep -rn "@ts-ignore\\|@ts-nocheck" "${SRC_DIR}" --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
    { encoding: 'utf8' }
  );

  if (!result.trim()) {
    console.log('✅ Gate NO_TS_IGNORE: PASSED (0 @ts-ignore found)');
    process.exit(0);
  }

  const lines = result.trim().split('\n');
  const violations = lines.filter(line => {
    const filePath = line.split(':')[0];
    return !isAllowedFile(filePath);
  });

  if (violations.length === 0) {
    console.log(`✅ Gate NO_TS_IGNORE: PASSED (${lines.length} in tests only)`);
    process.exit(0);
  }

  console.error('❌ Gate NO_TS_IGNORE: FAILED');
  console.error(`Found ${violations.length} @ts-ignore in production code:\n`);
  violations.slice(0, 20).forEach(v => console.error(`  ${v}`));
  if (violations.length > 20) {
    console.error(`  ... and ${violations.length - 20} more`);
  }
  console.error('\n💡 Fix: Add proper types instead of @ts-ignore');
  process.exit(1);

} catch (error) {
  console.error('❌ Gate NO_TS_IGNORE: Error running check', error.message);
  process.exit(1);
}
