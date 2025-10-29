#!/usr/bin/env tsx
/**
 * Deploy Helper CLI - PATCH 505
 * Interactive deployment assistant for multiple platforms
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DeployConfig {
  platform: 'supabase' | 'netlify' | 'vercel';
  buildPath: string;
  environment: 'production' | 'staging' | 'development';
}

/**
 * Check if command is available
 */
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verify build exists
 */
function verifyBuild(): boolean {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build not found. Run `npm run build` first.');
    return false;
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Invalid build: index.html not found.');
    return false;
  }

  return true;
}

/**
 * Deploy to Supabase
 */
function deployToSupabase(config: DeployConfig): void {
  console.log('\n🚀 Deploying to Supabase...\n');

  // Check if supabase CLI is installed
  if (!commandExists('supabase')) {
    console.error('❌ Supabase CLI not installed.');
    console.log('Install it with: npm install -g supabase');
    return;
  }

  try {
    // Initialize Supabase if needed
    const supabaseConfigPath = path.join(process.cwd(), 'supabase', 'config.toml');
    if (!fs.existsSync(supabaseConfigPath)) {
      console.log('Initializing Supabase project...');
      execSync('supabase init', { stdio: 'inherit' });
    }

    // Link to project (user needs to be logged in)
    console.log('Linking to Supabase project...');
    console.log('Note: Make sure you are logged in with `supabase login`');

    // Deploy static files
    console.log('\nDeploying static files...');
    const deployCmd = `supabase storage cp --recursive ${config.buildPath}/* supabase://storage/web`;
    console.log(`Command: ${deployCmd}`);
    console.log('\n⚠️  Note: This command is for reference. Supabase deployment typically requires:');
    console.log('1. Manual upload to Supabase Storage');
    console.log('2. Or using a custom deployment script');
    console.log('3. Or integrating with Vercel/Netlify and connecting to Supabase');

    console.log('\n✅ Supabase deployment instructions displayed');
  } catch (error) {
    console.error('❌ Supabase deployment failed:', error);
  }
}

/**
 * Deploy to Netlify
 */
function deployToNetlify(config: DeployConfig): void {
  console.log('\n🚀 Deploying to Netlify...\n');

  // Check if netlify CLI is installed
  if (!commandExists('netlify')) {
    console.error('❌ Netlify CLI not installed.');
    console.log('Install it with: npm install -g netlify-cli');
    return;
  }

  try {
    // Check if logged in
    console.log('Checking Netlify authentication...');
    try {
      execSync('netlify status', { stdio: 'ignore' });
    } catch (e) {
      console.log('Please login to Netlify:');
      execSync('netlify login', { stdio: 'inherit' });
    }

    // Deploy
    const isProd = config.environment === 'production';
    const deployCmd = isProd 
      ? `netlify deploy --prod --dir=${config.buildPath}`
      : `netlify deploy --dir=${config.buildPath}`;

    console.log(`\nDeploying to Netlify (${config.environment})...`);
    execSync(deployCmd, { stdio: 'inherit' });

    console.log('\n✅ Netlify deployment completed');
  } catch (error) {
    console.error('❌ Netlify deployment failed:', error);
  }
}

/**
 * Deploy to Vercel
 */
function deployToVercel(config: DeployConfig): void {
  console.log('\n🚀 Deploying to Vercel...\n');

  // Check if vercel CLI is installed
  if (!commandExists('vercel')) {
    console.error('❌ Vercel CLI not installed.');
    console.log('Install it with: npm install -g vercel');
    return;
  }

  try {
    // Check if logged in
    console.log('Checking Vercel authentication...');
    try {
      execSync('vercel whoami', { stdio: 'ignore' });
    } catch (e) {
      console.log('Please login to Vercel:');
      execSync('vercel login', { stdio: 'inherit' });
    }

    // Deploy
    const isProd = config.environment === 'production';
    const deployCmd = isProd ? 'vercel --prod' : 'vercel';

    console.log(`\nDeploying to Vercel (${config.environment})...`);
    execSync(deployCmd, { stdio: 'inherit' });

    console.log('\n✅ Vercel deployment completed');
  } catch (error) {
    console.error('❌ Vercel deployment failed:', error);
  }
}

/**
 * Display pre-deploy checklist
 */
function displayPreDeployChecklist(): void {
  console.log('\n📋 Pre-Deployment Checklist:');
  console.log('-'.repeat(60));
  console.log('  ☐ Build completed successfully');
  console.log('  ☐ Environment variables configured');
  console.log('  ☐ Database migrations applied');
  console.log('  ☐ Tests passing');
  console.log('  ☐ Security audit completed');
  console.log('  ☐ Backup created');
  console.log('-'.repeat(60));
  console.log('');
}

/**
 * Display post-deploy tasks
 */
function displayPostDeployTasks(): void {
  console.log('\n✅ Post-Deployment Tasks:');
  console.log('-'.repeat(60));
  console.log('  1. Verify deployment is live');
  console.log('  2. Check monitoring dashboards');
  console.log('  3. Test critical user flows');
  console.log('  4. Monitor error rates');
  console.log('  5. Update deployment log');
  console.log('-'.repeat(60));
  console.log('');
}

/**
 * Parse command line arguments
 */
function parseArgs(): Partial<DeployConfig> {
  const args = process.argv.slice(2);
  const config: Partial<DeployConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--platform' || arg === '-p') {
      const platform = args[++i];
      if (['supabase', 'netlify', 'vercel'].includes(platform)) {
        config.platform = platform as DeployConfig['platform'];
      }
    }

    if (arg === '--env' || arg === '-e') {
      const env = args[++i];
      if (['production', 'staging', 'development'].includes(env)) {
        config.environment = env as DeployConfig['environment'];
      }
    }
  }

  return config;
}

/**
 * Display usage
 */
function displayUsage(): void {
  console.log('\n🚀 Deploy Helper - Usage\n');
  console.log('Deploy to a specific platform:');
  console.log('  npm run deploy:helper -- --platform netlify --env production');
  console.log('  npm run deploy:helper -- --platform vercel --env production');
  console.log('  npm run deploy:helper -- --platform supabase --env production\n');
  console.log('Options:');
  console.log('  --platform, -p    Platform: supabase | netlify | vercel');
  console.log('  --env, -e         Environment: production | staging | development\n');
  console.log('Without arguments, the script will run in interactive mode.\n');
}

/**
 * Main execution
 */
function main() {
  console.log('=' .repeat(60));
  console.log('  Deploy Helper CLI - PATCH 505');
  console.log('='.repeat(60));

  // Parse arguments
  const args = parseArgs();

  // Display usage if help requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    displayUsage();
    return;
  }

  // Verify build
  if (!verifyBuild()) {
    return;
  }

  // Display checklist
  displayPreDeployChecklist();

  // Setup config
  const config: DeployConfig = {
    platform: args.platform || 'vercel',
    buildPath: path.join(process.cwd(), 'dist'),
    environment: args.environment || 'production'
  };

  // If no platform specified, display options
  if (!args.platform) {
    console.log('Available platforms:');
    console.log('  1. Netlify');
    console.log('  2. Vercel');
    console.log('  3. Supabase\n');
    console.log('Run with --platform flag to deploy:');
    console.log('  npm run deploy:helper -- --platform netlify --env production\n');
    displayUsage();
    return;
  }

  console.log(`\n🎯 Target: ${config.platform} (${config.environment})\n`);

  // Deploy based on platform
  switch (config.platform) {
    case 'supabase':
      deployToSupabase(config);
      break;
    case 'netlify':
      deployToNetlify(config);
      break;
    case 'vercel':
      deployToVercel(config);
      break;
  }

  // Display post-deploy tasks
  displayPostDeployTasks();
}

// Run if executed directly
main();

export { deployToSupabase, deployToNetlify, deployToVercel };
