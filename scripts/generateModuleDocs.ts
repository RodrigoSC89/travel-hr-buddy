#!/usr/bin/env tsx
/**
 * PATCH 531 - Automatic Module Documentation Generator
 * 
 * Generates markdown documentation for core modules by extracting:
 * - React component props
 * - TypeScript types
 * - Routes
 * - Services used
 * - Dependencies
 * 
 * Usage: tsx scripts/generateModuleDocs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleInfo {
  name: string;
  path: string;
  category: string;
  description: string;
  components: ComponentInfo[];
  types: TypeInfo[];
  routes: RouteInfo[];
  services: ServiceInfo[];
  dependencies: string[];
  hooks: string[];
}

interface ComponentInfo {
  name: string;
  props: PropInfo[];
  description: string;
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface TypeInfo {
  name: string;
  definition: string;
}

interface RouteInfo {
  path: string;
  component: string;
}

interface ServiceInfo {
  name: string;
  endpoints: string[];
}

const MODULES_DIR = path.join(process.cwd(), 'src', 'modules');
const DOCS_DIR = path.join(process.cwd(), 'docs', 'modules');

// Core modules to document (20 main modules)
const CORE_MODULES = [
  'crew',
  'document-hub',
  'analytics',
  'compliance',
  'emergency',
  'finance-hub',
  'hr',
  'intelligence',
  'logistics',
  'maintenance-planner',
  'mission-control',
  'operations',
  'planning',
  'performance',
  'admin',
  'assistants',
  'connectivity',
  'control',
  'core',
  'features'
];

/**
 * Extract component props from TSX file
 */
function extractComponentProps(filePath: string): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract component name
    const componentMatch = content.match(/(?:export\s+(?:default\s+)?(?:const|function)\s+)(\w+)/);
    if (!componentMatch) return components;
    
    const componentName = componentMatch[1];
    
    // Extract props interface
    const propsMatch = content.match(/interface\s+(\w+Props)\s*{([^}]+)}/s);
    const props: PropInfo[] = [];
    
    if (propsMatch) {
      const propsContent = propsMatch[2];
      const propLines = propsContent.split('\n').filter(line => line.trim());
      
      propLines.forEach(line => {
        const propMatch = line.match(/(\w+)(\?)?:\s*([^;]+)/);
        if (propMatch) {
          props.push({
            name: propMatch[1],
            type: propMatch[3].trim(),
            required: !propMatch[2],
            description: extractJSDocDescription(content, propMatch[1])
          });
        }
      });
    }
    
    // Extract component description from JSDoc
    const description = extractJSDocDescription(content, componentName) || 
                       `${componentName} component`;
    
    components.push({
      name: componentName,
      props,
      description
    });
  } catch (error) {
    console.warn(`Failed to parse component ${filePath}:`, error);
  }
  
  return components;
}

/**
 * Extract JSDoc description
 */
function extractJSDocDescription(content: string, identifier: string): string {
  const jsdocPattern = new RegExp(`/\\*\\*([^*]|\\*(?!/))*\\*/\\s*(?:export\\s+)?(?:const|function|interface)\\s+${identifier}`, 's');
  const match = content.match(jsdocPattern);
  
  if (match) {
    const jsdoc = match[0];
    const descMatch = jsdoc.match(/\/\*\*\s*\n?\s*\*?\s*([^\n@]+)/);
    return descMatch ? descMatch[1].trim() : '';
  }
  
  return '';
}

/**
 * Extract TypeScript types from file
 */
function extractTypes(filePath: string): TypeInfo[] {
  const types: TypeInfo[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract interfaces
    const interfaceMatches = content.matchAll(/export\s+interface\s+(\w+)\s*{([^}]+)}/gs);
    for (const match of interfaceMatches) {
      types.push({
        name: match[1],
        definition: match[0]
      });
    }
    
    // Extract type aliases
    const typeMatches = content.matchAll(/export\s+type\s+(\w+)\s*=\s*([^;]+);/gs);
    for (const match of typeMatches) {
      types.push({
        name: match[1],
        definition: match[0]
      });
    }
  } catch (error) {
    console.warn(`Failed to extract types from ${filePath}:`, error);
  }
  
  return types;
}

/**
 * Extract routes from module
 */
function extractRoutes(modulePath: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  try {
    const indexPath = path.join(modulePath, 'index.tsx');
    if (!fs.existsSync(indexPath)) {
      return routes;
    }
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    
    // Look for route definitions
    const routeMatches = content.matchAll(/path:\s*['"]([^'"]+)['"]/g);
    for (const match of routeMatches) {
      routes.push({
        path: match[1],
        component: 'Component'
      });
    }
  } catch (error) {
    console.warn(`Failed to extract routes from ${modulePath}:`, error);
  }
  
  return routes;
}

/**
 * Extract service endpoints
 */
function extractServices(modulePath: string): ServiceInfo[] {
  const services: ServiceInfo[] = [];
  const servicesPath = path.join(modulePath, 'services');
  
  if (!fs.existsSync(servicesPath)) {
    return services;
  }
  
  try {
    const files = fs.readdirSync(servicesPath);
    
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const filePath = path.join(servicesPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract API endpoints
        const endpoints: string[] = [];
        const endpointMatches = content.matchAll(/['"`]\/api\/([^'"`]+)['"`]/g);
        
        for (const match of endpointMatches) {
          endpoints.push(`/api/${match[1]}`);
        }
        
        if (endpoints.length > 0) {
          services.push({
            name: file.replace(/\.(ts|tsx)$/, ''),
            endpoints
          });
        }
      }
    });
  } catch (error) {
    console.warn(`Failed to extract services from ${servicesPath}:`, error);
  }
  
  return services;
}

/**
 * Extract dependencies from imports
 */
function extractDependencies(modulePath: string): string[] {
  const dependencies = new Set<string>();
  
  try {
    const indexPath = path.join(modulePath, 'index.tsx');
    if (!fs.existsSync(indexPath)) {
      return Array.from(dependencies);
    }
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    
    // Extract imports
    const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const importPath = match[1];
      
      // Only include external dependencies and other modules
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        dependencies.add(importPath.split('/')[0]);
      } else if (importPath.startsWith('@/modules/')) {
        dependencies.add(importPath);
      }
    }
  } catch (error) {
    console.warn(`Failed to extract dependencies from ${modulePath}:`, error);
  }
  
  return Array.from(dependencies);
}

/**
 * Extract custom hooks
 */
function extractHooks(modulePath: string): string[] {
  const hooks: string[] = [];
  const hooksPath = path.join(modulePath, 'hooks');
  
  if (!fs.existsSync(hooksPath)) {
    return hooks;
  }
  
  try {
    const files = fs.readdirSync(hooksPath);
    
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        hooks.push(file.replace(/\.(ts|tsx)$/, ''));
      }
    });
  } catch (error) {
    console.warn(`Failed to extract hooks from ${hooksPath}:`, error);
  }
  
  return hooks;
}

/**
 * Analyze module and extract information
 */
function analyzeModule(moduleName: string): ModuleInfo | null {
  const modulePath = path.join(MODULES_DIR, moduleName);
  
  if (!fs.existsSync(modulePath)) {
    console.warn(`Module not found: ${moduleName}`);
    return null;
  }
  
  const components: ComponentInfo[] = [];
  const types: TypeInfo[] = [];
  
  // Analyze components
  const componentsPath = path.join(modulePath, 'components');
  if (fs.existsSync(componentsPath)) {
    const files = fs.readdirSync(componentsPath);
    files.forEach(file => {
      if (file.endsWith('.tsx')) {
        const filePath = path.join(componentsPath, file);
        components.push(...extractComponentProps(filePath));
      }
    });
  }
  
  // Analyze types
  const typesPath = path.join(modulePath, 'types');
  if (fs.existsSync(typesPath)) {
    const files = fs.readdirSync(typesPath);
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(typesPath, file);
        types.push(...extractTypes(filePath));
      }
    });
  }
  
  // Extract index.tsx types as well
  const indexPath = path.join(modulePath, 'index.tsx');
  if (fs.existsSync(indexPath)) {
    types.push(...extractTypes(indexPath));
  }
  
  const routes = extractRoutes(modulePath);
  const services = extractServices(modulePath);
  const dependencies = extractDependencies(modulePath);
  const hooks = extractHooks(modulePath);
  
  // Read module description from README if exists
  let description = `${moduleName} module`;
  const readmePath = path.join(modulePath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf-8');
    const descMatch = readme.match(/^#\s+.+\n\n(.+)/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
  }
  
  return {
    name: moduleName,
    path: modulePath,
    category: determineCategoryFromPath(modulePath),
    description,
    components,
    types,
    routes,
    services,
    dependencies,
    hooks
  };
}

/**
 * Determine module category
 */
function determineCategoryFromPath(modulePath: string): string {
  const parts = modulePath.split(path.sep);
  const moduleIndex = parts.indexOf('modules');
  
  if (moduleIndex !== -1 && moduleIndex < parts.length - 1) {
    return parts[moduleIndex + 1];
  }
  
  return 'uncategorized';
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(moduleInfo: ModuleInfo): string {
  const lines: string[] = [];
  
  lines.push(`# ${moduleInfo.name}`);
  lines.push('');
  lines.push(`**Category**: ${moduleInfo.category}`);
  lines.push(`**Last Updated**: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Description
  lines.push('## 📝 Descrição');
  lines.push('');
  lines.push(moduleInfo.description);
  lines.push('');
  
  // Components
  if (moduleInfo.components.length > 0) {
    lines.push('## 🧩 Componentes');
    lines.push('');
    
    moduleInfo.components.forEach(component => {
      lines.push(`### ${component.name}`);
      lines.push('');
      lines.push(component.description);
      lines.push('');
      
      if (component.props.length > 0) {
        lines.push('**Props:**');
        lines.push('');
        lines.push('| Nome | Tipo | Obrigatório | Descrição |');
        lines.push('|------|------|-------------|-----------|');
        
        component.props.forEach(prop => {
          lines.push(`| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | ${prop.description || '-'} |`);
        });
        
        lines.push('');
      }
    });
  }
  
  // Types
  if (moduleInfo.types.length > 0) {
    lines.push('## 📐 Tipos TypeScript');
    lines.push('');
    
    moduleInfo.types.forEach(type => {
      lines.push(`### ${type.name}`);
      lines.push('');
      lines.push('```typescript');
      lines.push(type.definition);
      lines.push('```');
      lines.push('');
    });
  }
  
  // Routes
  if (moduleInfo.routes.length > 0) {
    lines.push('## 🛣️ Rotas');
    lines.push('');
    lines.push('| Rota | Componente |');
    lines.push('|------|------------|');
    
    moduleInfo.routes.forEach(route => {
      lines.push(`| ${route.path} | ${route.component} |`);
    });
    
    lines.push('');
  }
  
  // Services
  if (moduleInfo.services.length > 0) {
    lines.push('## 🔌 Serviços e Endpoints');
    lines.push('');
    
    moduleInfo.services.forEach(service => {
      lines.push(`### ${service.name}`);
      lines.push('');
      
      if (service.endpoints.length > 0) {
        lines.push('**Endpoints:**');
        lines.push('');
        service.endpoints.forEach(endpoint => {
          lines.push(`- \`${endpoint}\``);
        });
        lines.push('');
      }
    });
  }
  
  // Hooks
  if (moduleInfo.hooks.length > 0) {
    lines.push('## 🪝 Custom Hooks');
    lines.push('');
    
    moduleInfo.hooks.forEach(hook => {
      lines.push(`- \`${hook}\``);
    });
    
    lines.push('');
  }
  
  // Dependencies
  if (moduleInfo.dependencies.length > 0) {
    lines.push('## 📦 Dependências');
    lines.push('');
    
    const externalDeps = moduleInfo.dependencies.filter(dep => !dep.startsWith('@/'));
    const internalDeps = moduleInfo.dependencies.filter(dep => dep.startsWith('@/'));
    
    if (externalDeps.length > 0) {
      lines.push('**Externas:**');
      lines.push('');
      externalDeps.forEach(dep => {
        lines.push(`- \`${dep}\``);
      });
      lines.push('');
    }
    
    if (internalDeps.length > 0) {
      lines.push('**Internas:**');
      lines.push('');
      internalDeps.forEach(dep => {
        lines.push(`- \`${dep}\``);
      });
      lines.push('');
    }
  }
  
  // Structure
  lines.push('## 📁 Estrutura de Dados');
  lines.push('');
  lines.push('```');
  lines.push(`${moduleInfo.name}/`);
  lines.push('├── components/       # Componentes React');
  lines.push('├── hooks/            # Custom hooks');
  lines.push('├── services/         # Lógica de negócio e API');
  lines.push('├── types/            # Definições TypeScript');
  lines.push('├── validation/       # Validações');
  lines.push('└── index.tsx         # Exportação principal');
  lines.push('```');
  lines.push('');
  
  // Footer
  lines.push('---');
  lines.push('');
  lines.push('**Gerado automaticamente por**: `scripts/generateModuleDocs.ts`  ');
  lines.push(`**Data**: ${new Date().toLocaleString()}`);
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 PATCH 531 - Module Documentation Generator');
  console.log('============================================\n');
  
  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    console.log(`✅ Created docs directory: ${DOCS_DIR}\n`);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  // Generate documentation for each core module
  for (const moduleName of CORE_MODULES) {
    try {
      console.log(`📝 Analyzing module: ${moduleName}...`);
      
      const moduleInfo = analyzeModule(moduleName);
      
      if (!moduleInfo) {
        console.log(`   ⚠️  Module not found or could not be analyzed\n`);
        failCount++;
        continue;
      }
      
      const markdown = generateMarkdown(moduleInfo);
      const outputPath = path.join(DOCS_DIR, `${moduleName}.md`);
      
      fs.writeFileSync(outputPath, markdown, 'utf-8');
      
      console.log(`   ✅ Generated: ${outputPath}`);
      console.log(`   📊 Components: ${moduleInfo.components.length}, Types: ${moduleInfo.types.length}, Services: ${moduleInfo.services.length}\n`);
      
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error generating docs for ${moduleName}:`, error);
      failCount++;
    }
  }
  
  // Generate index file
  console.log('📚 Generating documentation index...');
  const indexLines: string[] = [];
  indexLines.push('# Module Documentation Index');
  indexLines.push('');
  indexLines.push(`**Last Updated**: ${new Date().toISOString().split('T')[0]}`);
  indexLines.push(`**Total Modules**: ${CORE_MODULES.length}`);
  indexLines.push('');
  indexLines.push('---');
  indexLines.push('');
  indexLines.push('## 📚 Core Modules');
  indexLines.push('');
  
  CORE_MODULES.forEach(moduleName => {
    const docPath = `${moduleName}.md`;
    if (fs.existsSync(path.join(DOCS_DIR, docPath))) {
      indexLines.push(`- [${moduleName}](./${docPath})`);
    }
  });
  
  indexLines.push('');
  indexLines.push('---');
  indexLines.push('');
  indexLines.push('*Generated automatically by `scripts/generateModuleDocs.ts`*');
  
  const indexPath = path.join(DOCS_DIR, 'INDEX.md');
  fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf-8');
  
  console.log(`✅ Generated index: ${indexPath}\n`);
  
  // Summary
  console.log('============================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Output: ${DOCS_DIR}`);
  console.log('============================================\n');
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { analyzeModule, generateMarkdown };
