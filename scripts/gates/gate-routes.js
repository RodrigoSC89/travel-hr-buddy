#!/usr/bin/env node
/**
 * GATE F — ORPHAN ROUTES DETECTION
 * Detects routes in App.tsx not in sidebar and vice versa
 * 
 * Usage: node scripts/gates/gate-routes.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APP_FILE = 'src/App.tsx';
const SIDEBAR_FILE = 'src/config/sidebar-routes.ts';

// Whitelist - routes that don't need to be in sidebar
const WHITELIST = [
  '/login',
  '/auth',
  '/auth-callback',
  '/logout',
  '/admin',
  '/admin/*',
  '/debug/*',
  '/e2e/*',
  '/dev-routes',
  '/404',
  '/onboarding',
  '/landing',
  '/',
  '/billing',
  '/billing-portal',
  '/settings/*',
  '/testing',
  '/feedback',
  '/qa/*',
  '/system/*',
];

// Colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function extractRoutesFromApp(content) {
  const routes = [];
  // Match <Route path="/xxx" or <Route path='/xxx'
  const routePattern = /<Route\s+path=["']([^"']+)["']/g;
  let match;
  
  while ((match = routePattern.exec(content)) !== null) {
    routes.push(match[1]);
  }
  
  return routes;
}

function extractRoutesFromSidebar(content) {
  const routes = [];
  // Match path: "/xxx" or path: '/xxx'
  const pathPattern = /path:\s*["']([^"']+)["']/g;
  let match;
  
  while ((match = pathPattern.exec(content)) !== null) {
    // Extract base path (without query params)
    const basePath = match[1].split('?')[0];
    routes.push(basePath);
  }
  
  return [...new Set(routes)]; // Remove duplicates
}

function isWhitelisted(route) {
  return WHITELIST.some(w => {
    if (w.endsWith('/*')) {
      const prefix = w.slice(0, -2);
      return route.startsWith(prefix);
    }
    return route === w;
  });
}

function normalizeRoute(route) {
  // Remove trailing slash and normalize
  return route.replace(/\/$/, '') || '/';
}

function main() {
  const baseDir = process.cwd();
  
  console.log(`\n${BOLD}${CYAN}🔍 GATE F — ORPHAN ROUTES DETECTION${RESET}\n`);
  
  // Read files
  const appPath = path.join(baseDir, APP_FILE);
  const sidebarPath = path.join(baseDir, SIDEBAR_FILE);
  
  if (!fs.existsSync(appPath)) {
    console.log(`${RED}❌ App.tsx not found at ${appPath}${RESET}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(sidebarPath)) {
    console.log(`${RED}❌ sidebar-routes.ts not found at ${sidebarPath}${RESET}`);
    process.exit(1);
  }
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  const appRoutes = extractRoutesFromApp(appContent).map(normalizeRoute);
  const sidebarRoutes = extractRoutesFromSidebar(sidebarContent).map(normalizeRoute);
  
  console.log(`📊 Found ${appRoutes.length} routes in App.tsx`);
  console.log(`📊 Found ${sidebarRoutes.length} routes in sidebar-routes.ts\n`);
  
  // Find orphan routes (in App but not in sidebar)
  const orphanRoutes = appRoutes.filter(r => 
    !sidebarRoutes.includes(r) && !isWhitelisted(r)
  );
  
  // Find dead sidebar links (in sidebar but not in App)
  const deadLinks = sidebarRoutes.filter(r => 
    !appRoutes.includes(r) && !isWhitelisted(r)
  );
  
  let hasErrors = false;
  
  if (orphanRoutes.length > 0) {
    console.log(`${YELLOW}⚠️ Routes in App.tsx but NOT in sidebar (${orphanRoutes.length}):${RESET}`);
    orphanRoutes.forEach(r => {
      console.log(`   ${YELLOW}• ${r}${RESET}`);
    });
    console.log('');
    console.log(`${CYAN}💡 Add these to sidebar-routes.ts or whitelist in gate-routes.js${RESET}\n`);
  }
  
  if (deadLinks.length > 0) {
    hasErrors = true;
    console.log(`${RED}❌ Routes in sidebar but NOT in App.tsx (${deadLinks.length}):${RESET}`);
    deadLinks.forEach(r => {
      console.log(`   ${RED}• ${r}${RESET}`);
    });
    console.log('');
    console.log(`${CYAN}💡 Add route to App.tsx or remove from sidebar-routes.ts${RESET}\n`);
  }
  
  // Summary
  if (!hasErrors && orphanRoutes.length === 0) {
    console.log(`${GREEN}✅ All routes are properly linked!${RESET}\n`);
    process.exit(0);
  } else if (hasErrors) {
    console.log(`${RED}${BOLD}Gate failed: Dead sidebar links detected${RESET}\n`);
    process.exit(1);
  } else {
    // Only warnings (orphan routes)
    console.log(`${YELLOW}⚠️ Gate passed with warnings (orphan routes detected)${RESET}\n`);
    process.exit(0);
  }
}

main();
