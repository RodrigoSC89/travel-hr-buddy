#!/usr/bin/env tsx
/**
 * Documentation Generation Script
 * Automatically generates technical documentation for modules
 * including routes, database schemas, and API endpoints
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleInfo {
  name: string;
  path: string;
  routes: string[];
  components: string[];
  services: string[];
}

interface RouteInfo {
  path: string;
  component: string;
  module: string;
}

interface DatabaseTable {
  name: string;
  module: string;
  fields: string[];
}

/**
 * Scan modules directory to find all modules
 */
function scanModules(baseDir: string): ModuleInfo[] {
  const modulesDir = path.join(baseDir, 'src', 'modules');
  const modules: ModuleInfo[] = [];

  if (!fs.existsSync(modulesDir)) {
    console.error('Modules directory not found:', modulesDir);
    return modules;
  }

  const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const moduleName of moduleDirs) {
    const modulePath = path.join(modulesDir, moduleName);
    const components: string[] = [];
    const services: string[] = [];
    const routes: string[] = [];

    // Recursively scan module directory
    const scanDir = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (['.tsx', '.ts'].includes(ext)) {
              const relativePath = path.relative(modulePath, fullPath);
              
              // Categorize files
              if (entry.name.includes('service') || relativePath.includes('services/')) {
                services.push(relativePath);
              } else if (ext === '.tsx' || relativePath.includes('components/')) {
                components.push(relativePath);
              }
              
              // Extract route patterns from files
              const content = fs.readFileSync(fullPath, 'utf-8');
              const routeMatches = content.match(/path:\s*['"](\/[^'"]+)['"]/g);
              if (routeMatches) {
                routeMatches.forEach(match => {
                  const routePath = match.match(/['"](\/[^'"]+)['"]/)?.[1];
                  if (routePath && !routes.includes(routePath)) {
                    routes.push(routePath);
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };

    scanDir(modulePath);

    modules.push({
      name: moduleName,
      path: modulePath,
      routes,
      components,
      services
    });
  }

  return modules;
}

/**
 * Extract routes from router configuration
 */
function extractRoutes(baseDir: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const routerFile = path.join(baseDir, 'src', 'AppRouter.tsx');

  if (fs.existsSync(routerFile)) {
    const content = fs.readFileSync(routerFile, 'utf-8');
    
    // Simple pattern matching for routes (can be enhanced)
    const routePattern = /<Route\s+path=["']([^"']+)["']\s+element={<([^/>]+)/g;
    let match;
    
    while ((match = routePattern.exec(content)) !== null) {
      routes.push({
        path: match[1],
        component: match[2],
        module: 'unknown'
      });
    }
  }

  return routes;
}

/**
 * Extract database tables from Supabase migrations
 */
function extractDatabaseTables(baseDir: string): DatabaseTable[] {
  const tables: DatabaseTable[] = [];
  const migrationsDir = path.join(baseDir, 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    return tables;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'));

  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    // Extract CREATE TABLE statements
    const tablePattern = /CREATE TABLE (?:IF NOT EXISTS )?([a-z_]+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = tablePattern.exec(content)) !== null) {
      const tableName = match[1];
      const fieldsText = match[2];
      const fields = fieldsText
        .split(',')
        .map(line => line.trim().split(/\s+/)[0])
        .filter(f => f && !f.startsWith('--'));

      tables.push({
        name: tableName,
        module: 'unknown', // Would need more logic to map tables to modules
        fields
      });
    }
  }

  return tables;
}

/**
 * Generate markdown documentation for a module
 */
function generateModuleDoc(module: ModuleInfo, routes: RouteInfo[], tables: DatabaseTable[]): string {
  const doc: string[] = [];

  doc.push(`# ${module.name} Module Documentation\n`);
  doc.push(`**Module Path:** \`${module.path}\`\n`);
  doc.push(`**Last Updated:** ${new Date().toISOString()}\n`);
  doc.push(`---\n`);

  // Overview
  doc.push(`## 📋 Overview\n`);
  doc.push(`The ${module.name} module provides [functionality description here].\n`);

  // Setup
  doc.push(`## 🚀 Setup\n`);
  doc.push(`### Installation\n`);
  doc.push('```bash\n');
  doc.push('npm install\n');
  doc.push('```\n');
  doc.push(`### Configuration\n`);
  doc.push(`No specific configuration required for this module.\n`);

  // Components
  if (module.components.length > 0) {
    doc.push(`## 🧩 Components\n`);
    doc.push(`This module contains ${module.components.length} component(s):\n`);
    module.components.slice(0, 10).forEach(comp => {
      doc.push(`- \`${comp}\`\n`);
    });
    if (module.components.length > 10) {
      doc.push(`- ... and ${module.components.length - 10} more\n`);
    }
    doc.push('\n');
  }

  // Services
  if (module.services.length > 0) {
    doc.push(`## 🔧 Services\n`);
    doc.push(`This module contains ${module.services.length} service(s):\n`);
    module.services.slice(0, 10).forEach(svc => {
      doc.push(`- \`${svc}\`\n`);
    });
    if (module.services.length > 10) {
      doc.push(`- ... and ${module.services.length - 10} more\n`);
    }
    doc.push('\n');
  }

  // Routes
  if (module.routes.length > 0) {
    doc.push(`## 🛣️ Routes\n`);
    doc.push(`| Route | Description |\n`);
    doc.push(`|-------|-------------|\n`);
    module.routes.forEach(route => {
      doc.push(`| \`${route}\` | Route description |\n`);
    });
    doc.push('\n');
  }

  // API Endpoints
  doc.push(`## 🔌 API Endpoints\n`);
  doc.push(`### GET /api/${module.name}\n`);
  doc.push(`Retrieves ${module.name} data.\n`);
  doc.push(`\n**Response:**\n`);
  doc.push('```json\n');
  doc.push('{\n');
  doc.push('  "status": "success",\n');
  doc.push('  "data": {}\n');
  doc.push('}\n');
  doc.push('```\n');

  // Database Schema
  const moduleTables = tables.filter(t => 
    t.name.includes(module.name.replace(/-/g, '_')) || 
    module.name.includes(t.name.replace(/_/g, '-'))
  );
  
  if (moduleTables.length > 0) {
    doc.push(`## 🗄️ Database Schema\n`);
    moduleTables.forEach(table => {
      doc.push(`### \`${table.name}\` Table\n`);
      doc.push(`| Field | Type | Description |\n`);
      doc.push(`|-------|------|-------------|\n`);
      table.fields.slice(0, 5).forEach(field => {
        doc.push(`| \`${field}\` | varchar | Field description |\n`);
      });
      doc.push('\n');
    });
  }

  // Events
  doc.push(`## 📡 Events\n`);
  doc.push(`### Emitted Events\n`);
  doc.push(`- \`${module.name}:created\` - Fired when a new item is created\n`);
  doc.push(`- \`${module.name}:updated\` - Fired when an item is updated\n`);
  doc.push(`- \`${module.name}:deleted\` - Fired when an item is deleted\n`);
  doc.push(`\n### Consumed Events\n`);
  doc.push(`- \`system:ready\` - Module initializes when system is ready\n`);

  // Usage Examples
  doc.push(`## 💡 Usage Examples\n`);
  doc.push('```typescript\n');
  doc.push(`import { ${module.name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')} } from '@/modules/${module.name}';\n`);
  doc.push('\n');
  doc.push(`// Example usage\n`);
  doc.push(`const component = new ${module.name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}();\n`);
  doc.push('```\n');

  // Testing
  doc.push(`## 🧪 Testing\n`);
  doc.push('```bash\n');
  doc.push(`npm test -- ${module.name}\n`);
  doc.push('```\n');

  return doc.join('');
}

/**
 * Generate index file for all modules
 */
function generateIndexDoc(modules: ModuleInfo[]): string {
  const doc: string[] = [];

  doc.push(`# Module Documentation Index\n`);
  doc.push(`**Generated:** ${new Date().toISOString()}\n`);
  doc.push(`**Total Modules:** ${modules.length}\n`);
  doc.push(`---\n`);

  doc.push(`## 📚 Available Modules\n`);
  
  // Sort modules alphabetically
  const sortedModules = [...modules].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedModules.forEach(module => {
    doc.push(`### [${module.name}](./${module.name}.md)\n`);
    doc.push(`- Components: ${module.components.length}\n`);
    doc.push(`- Services: ${module.services.length}\n`);
    doc.push(`- Routes: ${module.routes.length}\n`);
    doc.push('\n');
  });

  return doc.join('');
}

/**
 * Main execution
 */
function main() {
  const baseDir = process.cwd();
  const docsDir = path.join(baseDir, 'dev', 'docs');

  console.log('🔍 Scanning modules...');
  const modules = scanModules(baseDir);
  console.log(`✅ Found ${modules.length} modules`);

  console.log('🔍 Extracting routes...');
  const routes = extractRoutes(baseDir);
  console.log(`✅ Found ${routes.length} routes`);

  console.log('🔍 Extracting database tables...');
  const tables = extractDatabaseTables(baseDir);
  console.log(`✅ Found ${tables.length} tables`);

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.log('📝 Generating documentation...');
  
  // Generate index
  const indexDoc = generateIndexDoc(modules);
  fs.writeFileSync(path.join(docsDir, 'INDEX.md'), indexDoc);
  console.log('✅ Generated INDEX.md');

  // Generate documentation for top 20 modules
  const topModules = modules
    .sort((a, b) => {
      const scoreA = a.components.length + a.services.length + a.routes.length;
      const scoreB = b.components.length + b.services.length + b.routes.length;
      return scoreB - scoreA;
    })
    .slice(0, 20);

  topModules.forEach(module => {
    const doc = generateModuleDoc(module, routes, tables);
    fs.writeFileSync(path.join(docsDir, `${module.name}.md`), doc);
    console.log(`✅ Generated ${module.name}.md`);
  });

  console.log(`\n🎉 Documentation generated successfully in ${docsDir}`);
  console.log(`📊 Generated ${topModules.length} module documentation files`);
}

// Run main function
main();

export { scanModules, generateModuleDoc, generateIndexDoc };
