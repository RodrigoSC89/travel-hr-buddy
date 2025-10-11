#!/usr/bin/env node

/**
 * ✅ scripts/setup-daily-restore-report.js — Automated Setup for Daily Restore Report
 * 
 * This script automates the deployment and configuration of the daily restore report feature.
 * 
 * 🎯 What it does:
 * - Validates required environment variables
 * - Checks Supabase CLI installation
 * - Deploys the edge function
 * - Sets up the cron schedule
 * - Tests the deployment
 * - Provides detailed status and next steps
 * 
 * 📦 Prerequisites:
 * - Supabase CLI installed (npm install -g supabase)
 * - Supabase project initialized
 * - Environment variables configured
 * 
 * 🚀 Usage:
 * npm run setup:daily-report
 * 
 * Or directly:
 * node scripts/setup-daily-restore-report.js
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}➜${colors.reset} ${msg}`),
};

// Configuration
const CONFIG = {
  functionName: "daily-restore-report",
  functionPath: "supabase/functions/daily-restore-report",
  cronSchedule: "0 8 * * *", // Daily at 8 AM UTC
  requiredEnvVars: [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VITE_APP_URL",
    "ADMIN_EMAIL",
  ],
  optionalEnvVars: [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
  ],
};

/**
 * Check if Supabase CLI is installed
 */
async function checkSupabaseCLI() {
  log.step("Checking Supabase CLI installation...");
  try {
    const { stdout } = await execAsync("supabase --version");
    log.success(`Supabase CLI installed: ${stdout.trim()}`);
    return true;
  } catch (error) {
    log.error("Supabase CLI not found!");
    log.info("Install it with: npm install -g supabase");
    log.info("Or visit: https://supabase.com/docs/guides/cli");
    return false;
  }
}

/**
 * Check if function directory exists
 */
function checkFunctionExists() {
  log.step("Checking function directory...");
  const functionPath = path.join(process.cwd(), CONFIG.functionPath);
  
  if (!fs.existsSync(functionPath)) {
    log.error(`Function directory not found: ${functionPath}`);
    return false;
  }
  
  const indexPath = path.join(functionPath, "index.ts");
  if (!fs.existsSync(indexPath)) {
    log.error(`Function index.ts not found: ${indexPath}`);
    return false;
  }
  
  log.success("Function directory and files exist");
  return true;
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables() {
  log.step("Validating environment variables...");
  
  const missing = [];
  const present = [];
  
  for (const envVar of CONFIG.requiredEnvVars) {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      missing.push(envVar);
    }
  }
  
  if (present.length > 0) {
    log.success(`Found ${present.length} required variables: ${present.join(", ")}`);
  }
  
  if (missing.length > 0) {
    log.warning(`Missing ${missing.length} required variables: ${missing.join(", ")}`);
    log.info("These should be set in your Supabase project settings:");
    log.info("Settings > Edge Functions > Secrets");
  }
  
  // Check optional variables
  const optionalPresent = CONFIG.optionalEnvVars.filter(v => process.env[v]);
  if (optionalPresent.length > 0) {
    log.info(`Optional variables found: ${optionalPresent.join(", ")}`);
  }
  
  return missing.length === 0;
}

/**
 * Deploy the edge function
 */
async function deployFunction() {
  log.step("Deploying edge function...");
  
  try {
    log.info(`Deploying ${CONFIG.functionName}...`);
    const { stdout, stderr } = await execAsync(
      `supabase functions deploy ${CONFIG.functionName}`,
      { cwd: process.cwd() }
    );
    
    if (stderr && stderr.toLowerCase().includes("error")) {
      log.error("Deployment failed:");
      console.log(stderr);
      return false;
    }
    
    log.success("Function deployed successfully!");
    if (stdout) {
      console.log(stdout);
    }
    return true;
  } catch (error) {
    log.error("Deployment failed:");
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Schedule the function with cron
 */
async function scheduleFunction() {
  log.step("Setting up cron schedule...");
  
  try {
    log.info(`Scheduling ${CONFIG.functionName} with cron: ${CONFIG.cronSchedule}`);
    
    // First, try to unschedule if it exists (ignore errors)
    try {
      await execAsync(`supabase functions unschedule ${CONFIG.functionName}`);
      log.info("Removed existing schedule");
    } catch (e) {
      // Schedule doesn't exist, that's fine
    }
    
    // Now schedule it
    const { stdout, stderr } = await execAsync(
      `supabase functions schedule ${CONFIG.functionName} --cron "${CONFIG.cronSchedule}"`
    );
    
    if (stderr && stderr.toLowerCase().includes("error")) {
      log.error("Scheduling failed:");
      console.log(stderr);
      return false;
    }
    
    log.success(`Function scheduled successfully: ${CONFIG.cronSchedule} (Daily at 8 AM UTC)`);
    if (stdout) {
      console.log(stdout);
    }
    return true;
  } catch (error) {
    log.error("Scheduling failed:");
    console.error(error.message);
    
    if (error.message.includes("not found") || error.message.includes("command")) {
      log.warning("Cron scheduling via CLI may not be available in your Supabase version");
      log.info("You can schedule it manually in the Supabase Dashboard:");
      log.info("Dashboard > Edge Functions > Your Function > Cron Jobs");
      log.info(`Use cron expression: ${CONFIG.cronSchedule}`);
    }
    
    return false;
  }
}

/**
 * Test the function
 */
async function testFunction() {
  log.step("Testing the function...");
  
  try {
    log.info("Invoking function for test...");
    const { stdout, stderr } = await execAsync(
      `supabase functions invoke ${CONFIG.functionName} --no-verify-jwt`,
      { cwd: process.cwd(), timeout: 30000 }
    );
    
    if (stderr && stderr.toLowerCase().includes("error")) {
      log.warning("Test invocation had warnings:");
      console.log(stderr);
    }
    
    log.success("Function test completed");
    if (stdout) {
      console.log(stdout);
    }
    return true;
  } catch (error) {
    log.warning("Function test failed (this may be expected if email credentials are not configured):");
    console.error(error.message);
    
    log.info("You can test it manually with:");
    log.info(`  supabase functions invoke ${CONFIG.functionName} --no-verify-jwt`);
    
    return false;
  }
}

/**
 * Display setup summary and next steps
 */
function displaySummary(results) {
  log.step("Setup Summary");
  
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bright}Daily Restore Report Setup Results${colors.reset}`);
  console.log("=".repeat(60) + "\n");
  
  const status = (success) => success 
    ? `${colors.green}✅ SUCCESS${colors.reset}` 
    : `${colors.red}❌ FAILED${colors.reset}`;
  
  console.log(`Supabase CLI Check:        ${status(results.cliInstalled)}`);
  console.log(`Function Files Check:      ${status(results.functionExists)}`);
  console.log(`Environment Variables:     ${status(results.envVarsValid)}`);
  console.log(`Function Deployment:       ${status(results.deployed)}`);
  console.log(`Cron Schedule Setup:       ${status(results.scheduled)}`);
  console.log(`Function Test:             ${status(results.tested)}`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  if (results.deployed && results.scheduled) {
    log.success("Setup completed successfully! 🎉");
    
    console.log("\n" + `${colors.bright}Next Steps:${colors.reset}\n`);
    console.log("1. Configure email settings in your application:");
    console.log("   - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS");
    console.log("   - These are required for sending email reports\n");
    
    console.log("2. Verify the cron schedule:");
    console.log(`   - supabase functions list-schedules\n`);
    
    console.log("3. Monitor function logs:");
    console.log(`   - supabase functions logs ${CONFIG.functionName} --follow\n`);
    
    console.log("4. Test email delivery:");
    console.log("   - Ensure SMTP credentials are correct");
    console.log("   - Check spam folder for test emails\n");
    
    console.log(`${colors.cyan}📚 Documentation:${colors.reset}`);
    console.log("   - DAILY_RESTORE_REPORT_QUICKREF.md");
    console.log("   - supabase/functions/daily-restore-report/README.md\n");
  } else {
    log.error("Setup incomplete. Please review the errors above.");
    
    console.log("\n" + `${colors.bright}Troubleshooting:${colors.reset}\n`);
    
    if (!results.cliInstalled) {
      console.log("• Install Supabase CLI: npm install -g supabase");
    }
    
    if (!results.functionExists) {
      console.log("• Ensure you're in the project root directory");
      console.log("• Check that supabase/functions/daily-restore-report/ exists");
    }
    
    if (!results.envVarsValid) {
      console.log("• Set required environment variables in Supabase Dashboard");
      console.log("• Go to: Settings > Edge Functions > Secrets");
    }
    
    if (!results.deployed) {
      console.log("• Check Supabase project connection: supabase link");
      console.log("• Verify your Supabase credentials");
    }
    
    if (!results.scheduled) {
      console.log("• Try scheduling manually in the Supabase Dashboard");
      console.log("• Or use pg_cron if available");
    }
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
}

/**
 * Main setup function
 */
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bright}${colors.cyan}Daily Restore Report - Automated Setup${colors.reset}`);
  console.log("=".repeat(60) + "\n");
  
  const results = {
    cliInstalled: false,
    functionExists: false,
    envVarsValid: false,
    deployed: false,
    scheduled: false,
    tested: false,
  };
  
  // Step 1: Check Supabase CLI
  results.cliInstalled = await checkSupabaseCLI();
  if (!results.cliInstalled) {
    displaySummary(results);
    process.exit(1);
  }
  
  // Step 2: Check function exists
  results.functionExists = checkFunctionExists();
  if (!results.functionExists) {
    displaySummary(results);
    process.exit(1);
  }
  
  // Step 3: Validate environment variables
  results.envVarsValid = validateEnvironmentVariables();
  // Note: We continue even if env vars are missing, as they might be set in Supabase
  
  // Step 4: Deploy function
  results.deployed = await deployFunction();
  if (!results.deployed) {
    log.warning("Continuing despite deployment issues...");
  }
  
  // Step 5: Schedule function
  if (results.deployed) {
    results.scheduled = await scheduleFunction();
  }
  
  // Step 6: Test function
  if (results.deployed) {
    results.tested = await testFunction();
  }
  
  // Display summary
  displaySummary(results);
  
  // Exit with appropriate code
  if (results.deployed && results.scheduled) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run the setup
main().catch((error) => {
  log.error("Unexpected error during setup:");
  console.error(error);
  process.exit(1);
});
