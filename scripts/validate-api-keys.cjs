#!/usr/bin/env node
/**
 * API Keys & Environment Validation Script
 * Validates required environment variables before build/deploy
 * PATCH: Audit Plan 2025 - Security Gates
 */

const fs = require('fs');
const path = require('path');

// Required environment variables by category
const ENV_REQUIREMENTS = {
  // Critical - build will fail
  critical: [
    { name: 'VITE_SUPABASE_URL', pattern: /^https:\/\/.*\.supabase\.co$/ },
    { name: 'VITE_SUPABASE_PUBLISHABLE_KEY', pattern: /^eyJ/ },
  ],
  
  // Security - warn if missing
  security: [
    { name: 'VITE_SECURITY_ENABLED', expected: 'true' },
    { name: 'VITE_RATE_LIMIT_ENABLED', expected: 'true' },
  ],
  
  // Optional - info only
  optional: [
    { name: 'SENTRY_DSN' },
    { name: 'SENTRY_AUTH_TOKEN' },
    { name: 'VITE_POSTHOG_KEY' },
  ],
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  let envVars = {};
  
  // Load .env if exists
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
  
  // Load .env.local (overrides .env)
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
  
  return envVars;
}

function validateEnv() {
  console.log('🔐 Environment Validation');
  console.log('=========================\n');
  
  const envVars = loadEnvFile();
  const processEnv = { ...process.env, ...envVars };
  
  let criticalErrors = 0;
  let warnings = 0;
  
  // Check critical variables
  log.header('Critical Variables:');
  ENV_REQUIREMENTS.critical.forEach(({ name, pattern }) => {
    const value = processEnv[name];
    
    if (!value) {
      log.error(`${name} is missing`);
      criticalErrors++;
    } else if (pattern && !pattern.test(value)) {
      log.error(`${name} has invalid format`);
      criticalErrors++;
    } else {
      log.success(`${name} is configured`);
    }
  });
  
  // Check security variables
  log.header('Security Variables:');
  ENV_REQUIREMENTS.security.forEach(({ name, expected }) => {
    const value = processEnv[name];
    
    if (!value) {
      log.warn(`${name} is not set (recommended: ${expected})`);
      warnings++;
    } else if (expected && value !== expected) {
      log.warn(`${name} = "${value}" (recommended: ${expected})`);
      warnings++;
    } else {
      log.success(`${name} = "${value}"`);
    }
  });
  
  // Check optional variables
  log.header('Optional Variables:');
  ENV_REQUIREMENTS.optional.forEach(({ name }) => {
    const value = processEnv[name];
    
    if (!value) {
      log.info(`${name} is not set`);
    } else {
      log.success(`${name} is configured`);
    }
  });
  
  // Summary
  log.header('Summary:');
  console.log(`  Critical errors: ${criticalErrors}`);
  console.log(`  Warnings: ${warnings}`);
  
  if (criticalErrors > 0) {
    console.log(`\n${colors.red}❌ Validation FAILED - Fix critical errors before proceeding${colors.reset}`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\n${colors.yellow}⚠️  Validation PASSED with warnings${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ Validation PASSED${colors.reset}`);
    process.exit(0);
  }
}

// Check for secrets that shouldn't be in code
function scanForSecrets() {
  log.header('Scanning for hardcoded secrets...');
  
  const secretPatterns = [
    { name: 'AWS Key', pattern: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
    { name: 'Generic API Key', pattern: /api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/ },
    { name: 'Bearer Token', pattern: /Bearer\s+[a-zA-Z0-9\-_.]{20,}/ },
  ];
  
  const srcDir = path.join(process.cwd(), 'src');
  let foundSecrets = 0;
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        scanDir(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        secretPatterns.forEach(({ name, pattern }) => {
          if (pattern.test(content)) {
            log.error(`Potential ${name} found in ${fullPath}`);
            foundSecrets++;
          }
        });
      }
    });
  }
  
  scanDir(srcDir);
  
  if (foundSecrets === 0) {
    log.success('No hardcoded secrets found');
  } else {
    log.error(`Found ${foundSecrets} potential secrets in code`);
  }
  
  return foundSecrets;
}

// Run validation
validateEnv();
const secretsFound = scanForSecrets();

if (secretsFound > 0) {
  process.exit(1);
}
