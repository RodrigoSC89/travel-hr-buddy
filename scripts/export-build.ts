#!/usr/bin/env tsx
/**
 * Build Export Script - PATCH 504
 * Creates production-ready build package with metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

interface BuildMetadata {
  hash: string;
  date: string;
  author: string;
  patches: string[];
  version: string;
  nodeVersion: string;
  buildDuration: number;
}

/**
 * Generate hash for build
 */
function generateBuildHash(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  return crypto.createHash('sha256').update(timestamp + random).digest('hex').substring(0, 16);
}

/**
 * Get git author
 */
function getGitAuthor(): string {
  try {
    return execSync('git config user.name').toString().trim();
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Get applied patches
 */
function getAppliedPatches(): string[] {
  const patches: string[] = [];
  const rootDir = process.cwd();
  
  // Scan for patch documentation files
  const files = fs.readdirSync(rootDir);
  const patchFiles = files.filter(f => 
    f.match(/PATCH.*\d+.*\.md$/i) || 
    f.match(/PATCHES.*\d+.*\.md$/i)
  );

  patchFiles.forEach(file => {
    const match = file.match(/(\d+)/g);
    if (match) {
      patches.push(...match);
    }
  });

  // Get unique patches and sort
  const uniquePatches = Array.from(new Set(patches)).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Return recent patches (last 20)
  return uniquePatches.slice(-20).map(p => `PATCH-${p}`);
}

/**
 * Create build metadata
 */
function createBuildMetadata(buildStartTime: number): BuildMetadata {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  return {
    hash: generateBuildHash(),
    date: new Date().toISOString(),
    author: getGitAuthor(),
    patches: getAppliedPatches(),
    version: packageJson.version || '0.0.0',
    nodeVersion: process.version,
    buildDuration: Date.now() - buildStartTime
  };
}

/**
 * Run production build
 */
function runBuild(): void {
  console.log('📦 Starting production build...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

/**
 * Create export package
 */
function createExportPackage(metadata: BuildMetadata): void {
  const exportDir = path.join(process.cwd(), 'exports');
  const distDir = path.join(process.cwd(), 'dist');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const packageName = `build-${timestamp}-${metadata.hash}`;
  const packageDir = path.join(exportDir, packageName);

  // Create package directory
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  console.log('📁 Creating export package...');

  // Copy dist folder
  if (fs.existsSync(distDir)) {
    console.log('  Copying dist folder...');
    execSync(`cp -r ${distDir} ${packageDir}/dist`);
  }

  // Create metadata file
  const metadataPath = path.join(packageDir, 'build-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('  Created build-metadata.json');

  // Copy important files
  const filesToCopy = [
    'package.json',
    'README.md',
    'vercel.json',
    '.env.example'
  ];

  filesToCopy.forEach(file => {
    const sourcePath = path.join(process.cwd(), file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(packageDir, file));
      console.log(`  Copied ${file}`);
    }
  });

  // Create deployment instructions
  const instructions = `
# Deployment Instructions

## Build Information
- **Hash:** ${metadata.hash}
- **Date:** ${metadata.date}
- **Author:** ${metadata.author}
- **Version:** ${metadata.version}
- **Node Version:** ${metadata.nodeVersion}
- **Build Duration:** ${(metadata.buildDuration / 1000).toFixed(2)}s

## Applied Patches
${metadata.patches.join(', ')}

## Deployment Steps

### Supabase
1. Upload the \`dist\` folder to Supabase Storage
2. Configure your Supabase project settings
3. Update environment variables

### Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
\`\`\`

### Vercel
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

## Environment Variables Required
See \`.env.example\` for required environment variables.

## Support
For issues, contact ${metadata.author}
`;

  fs.writeFileSync(path.join(packageDir, 'DEPLOY.md'), instructions);
  console.log('  Created DEPLOY.md');

  // Create ZIP package
  console.log('🗜️  Creating ZIP archive...');
  const zipPath = path.join(exportDir, `${packageName}.zip`);
  
  try {
    execSync(`cd ${exportDir} && zip -r ${packageName}.zip ${packageName}`, { stdio: 'inherit' });
    console.log(`✅ Package created: ${zipPath}`);
  } catch (error) {
    console.warn('⚠️  ZIP creation failed (zip not installed), package available in:', packageDir);
  }

  console.log(`\n📦 Export package ready: ${packageName}`);
  console.log(`📊 Build metadata:`);
  console.log(JSON.stringify(metadata, null, 2));
}

/**
 * Main execution
 */
function main() {
  const buildStartTime = Date.now();

  console.log('🚀 Build Export Tool - PATCH 504\n');

  // Run build
  runBuild();

  // Create metadata
  const metadata = createBuildMetadata(buildStartTime);

  // Create export package
  createExportPackage(metadata);

  console.log('\n✨ Build export completed successfully!');
}

// Run if executed directly
main();

export { createBuildMetadata, createExportPackage };
