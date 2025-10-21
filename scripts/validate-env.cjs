#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * Pre-flight checks that ensure all required environment variables are present
 * before builds. Warns about insecure configurations (e.g., unencrypted MQTT
 * connections in production).
 * 
 * @module ValidateEnv
 * @version 1.0.0 (Nautilus v3.5)
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Required environment variables
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'VITE_OPENAI_API_KEY',
  'VITE_MQTT_URL',
];

// Production-specific requirements
const PRODUCTION_VARS = [
  'VITE_MQTT_USER',
  'VITE_MQTT_PASS',
  'JWT_SECRET',
];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath)) {
    log('⚠️  Warning: .env file not found', 'yellow');
    if (fs.existsSync(envExamplePath)) {
      log('💡 Tip: Copy .env.example to .env and fill in your values', 'blue');
    }
    return false;
  }

  return true;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });

  return envVars;
}

function checkRequiredVars(envVars) {
  log('\n📋 Checking required environment variables...', 'bright');
  
  let allPresent = true;
  REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (!value || value === '' || value.includes('seu-projeto') || value.includes('your-')) {
      log(`  ❌ ${varName} - Missing or placeholder value`, 'red');
      allPresent = false;
    } else {
      log(`  ✅ ${varName}`, 'green');
    }
  });

  return allPresent;
}

function checkRecommendedVars(envVars) {
  log('\n💡 Checking recommended environment variables...', 'bright');
  
  RECOMMENDED_VARS.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (!value || value === '') {
      log(`  ⚠️  ${varName} - Not set (some features may be limited)`, 'yellow');
    } else {
      log(`  ✅ ${varName}`, 'green');
    }
  });
}

function checkProductionSecurity(envVars) {
  const nodeEnv = process.env.NODE_ENV || process.env.VITE_NODE_ENV || envVars.VITE_NODE_ENV;
  
  if (nodeEnv !== 'production') {
    log('\n🔧 Development environment detected - skipping production checks', 'blue');
    return true;
  }

  log('\n🔒 Checking production security configuration...', 'bright');
  
  let isSecure = true;

  // Check MQTT URL security
  const mqttUrl = process.env.VITE_MQTT_URL || envVars.VITE_MQTT_URL;
  if (mqttUrl) {
    if (!mqttUrl.startsWith('wss://') && !mqttUrl.startsWith('mqtts://')) {
      log(`  ⚠️  VITE_MQTT_URL uses unencrypted protocol (${mqttUrl.split(':')[0]})`, 'yellow');
      log('     Recommendation: Use wss:// or mqtts:// for production', 'yellow');
      isSecure = false;
    } else {
      log('  ✅ MQTT URL uses encrypted protocol', 'green');
    }
  }

  // Check for authentication credentials
  PRODUCTION_VARS.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    if (!value || value === '') {
      log(`  ⚠️  ${varName} - Not set (recommended for production)`, 'yellow');
      isSecure = false;
    } else {
      log(`  ✅ ${varName}`, 'green');
    }
  });

  return isSecure;
}

function checkForSecrets(envVars) {
  log('\n🔍 Checking for potential secrets in version control...', 'bright');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    log('  ⚠️  .gitignore not found', 'yellow');
    return;
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env')) {
    log('  ⚠️  .env files may not be properly ignored by git', 'yellow');
    log('     Make sure .env is listed in .gitignore', 'yellow');
  } else {
    log('  ✅ .env files are properly ignored', 'green');
  }
}

function main() {
  log('╔════════════════════════════════════════════════════════╗', 'bright');
  log('║     Environment Configuration Validator v1.0.0        ║', 'bright');
  log('║              Nautilus One v3.5                        ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');

  const hasEnvFile = checkEnvFile();
  const envVars = loadEnvFile();

  const requiredOk = checkRequiredVars(envVars);
  checkRecommendedVars(envVars);
  const productionSecure = checkProductionSecurity(envVars);
  checkForSecrets(envVars);

  log('\n' + '═'.repeat(60), 'bright');
  
  if (!requiredOk) {
    log('\n❌ Validation FAILED: Required environment variables are missing', 'red');
    log('   Please configure your .env file before building', 'red');
    process.exit(1);
  }

  if (!productionSecure) {
    log('\n⚠️  Validation WARNING: Security configuration needs attention', 'yellow');
    log('   Consider using encrypted protocols and authentication', 'yellow');
    log('   Continuing build with warnings...', 'yellow');
  }

  if (requiredOk && productionSecure) {
    log('\n✅ Validation PASSED: All checks successful', 'green');
  }

  log('\n' + '═'.repeat(60), 'bright');
}

main();
