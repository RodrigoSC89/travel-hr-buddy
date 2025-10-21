#!/usr/bin/env node

/**
 * Environment Validation Script
 * Pre-flight checks that ensure all required environment variables are present
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Required environment variables
const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

// Recommended environment variables
const RECOMMENDED_VARS = [
  "VITE_OPENAI_API_KEY",
  "VITE_MQTT_URL",
  "JWT_SECRET",
];

// Optional environment variables for production
const PRODUCTION_VARS = [
  "VITE_MQTT_USER",
  "VITE_MQTT_PASS",
  "VITE_SENTRY_DSN",
];

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  
  if (!fs.existsSync(envPath)) {
    log("⚠️  No .env file found", colors.yellow);
    return {};
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return env;
}

function validateEnvironment() {
  log("\n🔍 Environment Validation\n", colors.blue);

  const env = loadEnvFile();
  const issues = [];
  const warnings = [];

  // Check required variables
  log("Required Variables:", colors.blue);
  REQUIRED_VARS.forEach((varName) => {
    if (env[varName]) {
      log(`  ✅ ${varName}`, colors.green);
    } else {
      log(`  ❌ ${varName} - MISSING`, colors.red);
      issues.push(`Missing required variable: ${varName}`);
    }
  });

  // Check recommended variables
  log("\nRecommended Variables:", colors.blue);
  RECOMMENDED_VARS.forEach((varName) => {
    if (env[varName]) {
      log(`  ✅ ${varName}`, colors.green);
    } else {
      log(`  ⚠️  ${varName} - Not set (recommended)`, colors.yellow);
      warnings.push(`Recommended variable not set: ${varName}`);
    }
  });

  // Check production variables
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    log("\nProduction Variables:", colors.blue);
    PRODUCTION_VARS.forEach((varName) => {
      if (env[varName]) {
        log(`  ✅ ${varName}`, colors.green);
      } else {
        log(`  ⚠️  ${varName} - Not set (recommended for production)`, colors.yellow);
        warnings.push(`Production variable not set: ${varName}`);
      }
    });
  }

  // Security checks
  log("\nSecurity Checks:", colors.blue);
  
  // Check for unencrypted MQTT in production
  if (isProduction && env.VITE_MQTT_URL) {
    if (env.VITE_MQTT_URL.startsWith("ws://")) {
      log(`  ⚠️  Unencrypted MQTT connection (use wss:// in production)`, colors.yellow);
      warnings.push("Using unencrypted MQTT connection in production");
    } else {
      log(`  ✅ Using encrypted MQTT connection`, colors.green);
    }
  }

  // Check JWT_SECRET length
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    log(`  ⚠️  JWT_SECRET is too short (minimum 32 characters)`, colors.yellow);
    warnings.push("JWT_SECRET should be at least 32 characters long");
  } else if (env.JWT_SECRET) {
    log(`  ✅ JWT_SECRET length is sufficient`, colors.green);
  }

  // Check .gitignore
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    if (gitignoreContent.includes(".env")) {
      log(`  ✅ .env is in .gitignore`, colors.green);
    } else {
      log(`  ❌ .env is NOT in .gitignore`, colors.red);
      issues.push(".env file should be added to .gitignore");
    }
  }

  // Summary
  log("\n" + "=".repeat(50), colors.blue);
  if (issues.length === 0 && warnings.length === 0) {
    log("\n✅ Environment validation passed!", colors.green);
    return 0;
  } else if (issues.length > 0) {
    log(`\n❌ Found ${issues.length} critical issue(s):`, colors.red);
    issues.forEach((issue) => log(`  - ${issue}`, colors.red));
    
    if (warnings.length > 0) {
      log(`\n⚠️  Found ${warnings.length} warning(s):`, colors.yellow);
      warnings.forEach((warning) => log(`  - ${warning}`, colors.yellow));
    }
    return 1;
  } else {
    log(`\n⚠️  Environment validation passed with ${warnings.length} warning(s):`, colors.yellow);
    warnings.forEach((warning) => log(`  - ${warning}`, colors.yellow));
    return 0;
  }
}

// Run validation
const exitCode = validateEnvironment();
process.exit(exitCode);
