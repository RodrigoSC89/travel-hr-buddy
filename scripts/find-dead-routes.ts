#!/usr/bin/env npx ts-node
/**
 * Dead Routes Analysis Script
 * Identifies routes defined but never used in navigation, links, or redirects
 * 
 * Usage: npx ts-node scripts/find-dead-routes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface RouteAnalysis {
  path: string;
  component: string;
  sourceFile: string;
  usedInNavigation: boolean;
  usedInLinks: boolean;
  usedInRedirects: boolean;
  usedInLegacyRedirects: boolean;
  isDeadRoute: boolean;
}

// Recursively get all files with specific extensions
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeRoutes(): RouteAnalysis[] {
  const routes: RouteAnalysis[] = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  // 1. Find route definitions in App.tsx and route files
  const routeFiles = [
    path.join(srcDir, 'App.tsx'),
    ...getAllFiles(path.join(srcDir, 'routes'), ['.ts', '.tsx']),
    ...getAllFiles(path.join(srcDir, 'config'), ['.ts', '.tsx']),
  ];
  
  // Regex patterns for route definitions
  const patterns = [
    /path\s*[=:]\s*["'`]([^"'`]+)["'`]/g,
    /<Route\s+[^>]*path\s*=\s*["'`]([^"'`]+)["'`]/g,
    /\["([^"]+)",\s*["'][^"']+["']\]/g, // Legacy redirects format
  ];
  
  for (const file of routeFiles) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const routePath = match[1];
        
        // Skip dynamic segments, wildcards, and empty paths
        if (!routePath || routePath === '*' || routePath.includes(':')) continue;
        
        // Normalize path
        const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
        
        // Avoid duplicates
        if (routes.some(r => r.path === normalizedPath)) continue;
        
        routes.push({
          path: normalizedPath,
          component: 'unknown',
          sourceFile: file.replace(process.cwd(), ''),
          usedInNavigation: false,
          usedInLinks: false,
          usedInRedirects: false,
          usedInLegacyRedirects: false,
          isDeadRoute: false,
        });
      }
    }
  }
  
  // 2. Search for usage across all source files
  const allFiles = getAllFiles(srcDir, ['.ts', '.tsx']);
  const allCode = allFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
  
  for (const route of routes) {
    const escapedPath = route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Check in navigation (to= prop)
    route.usedInNavigation = new RegExp(`to\\s*=\\s*["'\`]${escapedPath}["'\`]`, 'i').test(allCode) ||
                             new RegExp(`to\\s*=\\s*\\{["'\`]${escapedPath}["'\`]\\}`, 'i').test(allCode);
    
    // Check in href
    route.usedInLinks = new RegExp(`href\\s*=\\s*["'\`]${escapedPath}["'\`]`, 'i').test(allCode);
    
    // Check in navigate() calls
    route.usedInRedirects = new RegExp(`navigate\\s*\\(\\s*["'\`]${escapedPath}["'\`]`, 'i').test(allCode) ||
                            new RegExp(`Navigate\\s+to\\s*=\\s*["'\`]${escapedPath}["'\`]`, 'i').test(allCode);
    
    // Check in legacy redirects config
    route.usedInLegacyRedirects = new RegExp(`\\[["'\`][^"'\`]+["'\`],\\s*["'\`]${escapedPath}["'\`]\\]`, 'i').test(allCode);
    
    // Mark as dead if not used anywhere
    route.isDeadRoute = !route.usedInNavigation && 
                        !route.usedInLinks && 
                        !route.usedInRedirects &&
                        !route.usedInLegacyRedirects;
  }
  
  return routes;
}

function main() {
  console.log('🔍 Analyzing routes...\n');
  
  const routes = analyzeRoutes();
  const deadRoutes = routes.filter(r => r.isDeadRoute);
  const activeRoutes = routes.filter(r => !r.isDeadRoute);
  
  console.log(`
========================================
DEAD ROUTES ANALYSIS - Nauti One v4.0
========================================

Total Routes Defined: ${routes.length}
Active Routes: ${activeRoutes.length}
Dead Routes: ${deadRoutes.length}

========================================
`);
  
  if (deadRoutes.length > 0) {
    console.log('🗑️  DEAD ROUTES (not used anywhere):\n');
    deadRoutes.forEach(r => {
      console.log(`  - ${r.path}`);
      console.log(`    Source: ${r.sourceFile}\n`);
    });
  } else {
    console.log('✅ No dead routes found!\n');
  }
  
  // Show usage statistics
  console.log('📊 USAGE BREAKDOWN:\n');
  console.log(`  Routes used in navigation (to=): ${routes.filter(r => r.usedInNavigation).length}`);
  console.log(`  Routes used in links (href=): ${routes.filter(r => r.usedInLinks).length}`);
  console.log(`  Routes used in redirects: ${routes.filter(r => r.usedInRedirects).length}`);
  console.log(`  Routes in legacy redirects: ${routes.filter(r => r.usedInLegacyRedirects).length}`);
  
  // Save reports
  fs.writeFileSync('dead-routes.json', JSON.stringify({
    summary: {
      totalRoutes: routes.length,
      activeRoutes: activeRoutes.length,
      deadRoutes: deadRoutes.length,
    },
    deadRoutes,
    allRoutes: routes,
  }, null, 2));
  
  console.log('\n✅ Report saved to: dead-routes.json');
  
  // Exit with error if dead routes found (for CI)
  if (deadRoutes.length > 0 && process.env.CI) {
    process.exit(1);
  }
}

main();
