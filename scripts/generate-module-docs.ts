#!/usr/bin/env tsx
/**
 * Script to generate automatic documentation for modules
 * PATCH 534 - Geração Automática de Documentação
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ModuleInfo {
  name: string;
  path: string;
  description: string;
  routes: string[];
  components: string[];
  hooks: string[];
  services: string[];
  database: string[];
  edgeFunctions: string[];
}

const MODULES_DIR = path.join(__dirname, '../src/modules');
const DOCS_DIR = path.join(__dirname, '../docs/modules');
const PAGES_DIR = path.join(__dirname, '../src/pages');
const SUPABASE_DIR = path.join(__dirname, '../supabase');

// Priority modules to document
const PRIORITY_MODULES = [
  'crew',
  'document-hub',
  'mission-control',
  'mission-engine',
  'analytics',
  'compliance',
  'intelligence',
  'operations',
  'hr',
  'emergency',
  'finance-hub',
  'incident-reports',
  'logs-center',
  'navigation-copilot',
  'performance',
  'planning',
  'route-planner',
  'templates',
  'vault_ai',
  'weather-dashboard'
];

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFilesRecursive(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  
  let results: string[] = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  }
  
  return results;
}

function extractRoutes(moduleName: string): string[] {
  const appTsxPath = path.join(__dirname, '../src/App.tsx');
  if (!fs.existsSync(appTsxPath)) return [];
  
  const content = fs.readFileSync(appTsxPath, 'utf-8');
  const routes: string[] = [];
  
  // Match routes that reference the module
  const routeRegex = /<Route\s+path="([^"]+)"[^>]*>/g;
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes(moduleName) || line.includes(moduleName.replace('-', ''))) {
      const match = routeRegex.exec(line);
      if (match) {
        routes.push(match[1]);
      }
    }
  }
  
  return routes;
}

function extractComponents(modulePath: string): string[] {
  const componentsDir = path.join(modulePath, 'components');
  if (!fs.existsSync(componentsDir)) return [];
  
  const files = getFilesRecursive(componentsDir, '.tsx');
  return files.map(f => path.basename(f, '.tsx'));
}

function extractHooks(modulePath: string): string[] {
  const hooksDir = path.join(modulePath, 'hooks');
  if (!fs.existsSync(hooksDir)) return [];
  
  const files = getFilesRecursive(hooksDir, '.ts');
  return files.map(f => path.basename(f, '.ts'));
}

function extractServices(modulePath: string): string[] {
  const servicesDir = path.join(modulePath, 'services');
  if (!fs.existsSync(servicesDir)) return [];
  
  const files = getFilesRecursive(servicesDir, '.ts');
  return files.map(f => path.basename(f, '.ts'));
}

function extractDatabaseTables(moduleName: string): string[] {
  const migrationsDir = path.join(SUPABASE_DIR, 'migrations');
  if (!fs.existsSync(migrationsDir)) return [];
  
  const migrations = fs.readdirSync(migrationsDir);
  const tables: Set<string> = new Set();
  
  for (const migration of migrations) {
    const migrationPath = path.join(migrationsDir, migration);
    const content = fs.readFileSync(migrationPath, 'utf-8');
    
    // Look for CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)/gi;
    let match;
    
    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      // Include if table name contains module keywords
      const moduleKeywords = moduleName.split('-');
      if (moduleKeywords.some(kw => tableName.includes(kw))) {
        tables.add(tableName);
      }
    }
  }
  
  return Array.from(tables);
}

function extractDescription(modulePath: string, moduleName: string): string {
  const readmePath = path.join(modulePath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    // Get first paragraph after title
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && !line.startsWith('---')) {
        return line;
      }
    }
  }
  
  const indexPath = path.join(modulePath, 'index.tsx');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    const match = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
    if (match) {
      return match[1].trim();
    }
  }
  
  return `Module for ${moduleName.replace(/-/g, ' ')} functionality`;
}

function generateModuleDoc(moduleName: string): string {
  const modulePath = path.join(MODULES_DIR, moduleName);
  
  if (!fs.existsSync(modulePath)) {
    console.warn(`Module ${moduleName} not found at ${modulePath}`);
    return '';
  }
  
  const info: ModuleInfo = {
    name: moduleName,
    path: modulePath,
    description: extractDescription(modulePath, moduleName),
    routes: extractRoutes(moduleName),
    components: extractComponents(modulePath),
    hooks: extractHooks(modulePath),
    services: extractServices(modulePath),
    database: extractDatabaseTables(moduleName),
    edgeFunctions: [] // TODO: Extract edge functions
  };
  
  let doc = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, ' ')}\n\n`;
  doc += `## Descrição\n\n${info.description}\n\n`;
  
  doc += `## Localização\n\n`;
  doc += `- **Caminho**: \`src/modules/${moduleName}\`\n`;
  doc += `- **Tipo**: ${info.components.length > 0 ? 'Módulo com UI' : 'Módulo de serviço'}\n\n`;
  
  if (info.routes.length > 0) {
    doc += `## Rotas\n\n`;
    info.routes.forEach(route => {
      doc += `- \`${route}\`\n`;
    });
    doc += `\n`;
  }
  
  if (info.components.length > 0) {
    doc += `## Componentes\n\n`;
    info.components.slice(0, 20).forEach(comp => {
      doc += `- **${comp}**\n`;
    });
    if (info.components.length > 20) {
      doc += `\n... e mais ${info.components.length - 20} componentes\n`;
    }
    doc += `\n`;
  }
  
  if (info.hooks.length > 0) {
    doc += `## Hooks\n\n`;
    info.hooks.forEach(hook => {
      doc += `- \`${hook}\`\n`;
    });
    doc += `\n`;
  }
  
  if (info.services.length > 0) {
    doc += `## Serviços\n\n`;
    info.services.forEach(service => {
      doc += `- \`${service}\`\n`;
    });
    doc += `\n`;
  }
  
  if (info.database.length > 0) {
    doc += `## Banco de Dados\n\n`;
    doc += `### Tabelas\n\n`;
    info.database.forEach(table => {
      doc += `- \`${table}\`\n`;
    });
    doc += `\n`;
  }
  
  doc += `## Integração\n\n`;
  doc += `Para usar este módulo:\n\n`;
  doc += `\`\`\`typescript\n`;
  doc += `import { /* componentes */ } from '@/modules/${moduleName}';\n`;
  doc += `\`\`\`\n\n`;
  
  doc += `## Referências Cruzadas\n\n`;
  doc += `- [Índice de Módulos](./README.md)\n`;
  doc += `- [Arquitetura do Sistema](../architecture.md)\n\n`;
  
  doc += `---\n`;
  doc += `*Documentação gerada automaticamente em ${new Date().toISOString()}*\n`;
  
  return doc;
}

function generateIndexDoc(modules: string[]): string {
  let doc = `# Índice de Módulos - Nautilus One\n\n`;
  doc += `Documentação automática dos módulos principais do sistema.\n\n`;
  doc += `## Módulos Documentados\n\n`;
  
  modules.forEach((moduleName, index) => {
    const moduleTitle = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, ' ');
    doc += `${index + 1}. [${moduleTitle}](./${moduleName}.md)\n`;
  });
  
  doc += `\n## Categorias\n\n`;
  doc += `### Operações Marítimas\n`;
  doc += `- [Crew Management](./crew.md)\n`;
  doc += `- [Mission Control](./mission-control.md)\n`;
  doc += `- [Mission Engine](./mission-engine.md)\n`;
  doc += `- [Navigation Copilot](./navigation-copilot.md)\n\n`;
  
  doc += `### Gerenciamento de Documentos\n`;
  doc += `- [Document Hub](./document-hub.md)\n`;
  doc += `- [Templates](./templates.md)\n\n`;
  
  doc += `### Inteligência e Análise\n`;
  doc += `- [Analytics](./analytics.md)\n`;
  doc += `- [Intelligence](./intelligence.md)\n`;
  doc += `- [Vault AI](./vault_ai.md)\n\n`;
  
  doc += `### Conformidade e Segurança\n`;
  doc += `- [Compliance](./compliance.md)\n`;
  doc += `- [Incident Reports](./incident-reports.md)\n`;
  doc += `- [Emergency](./emergency.md)\n\n`;
  
  doc += `### Recursos Humanos\n`;
  doc += `- [HR](./hr.md)\n`;
  doc += `- [Performance](./performance.md)\n\n`;
  
  doc += `### Planejamento e Logística\n`;
  doc += `- [Planning](./planning.md)\n`;
  doc += `- [Route Planner](./route-planner.md)\n`;
  doc += `- [Operations](./operations.md)\n\n`;
  
  doc += `### Finanças\n`;
  doc += `- [Finance Hub](./finance-hub.md)\n\n`;
  
  doc += `### Infraestrutura\n`;
  doc += `- [Logs Center](./logs-center.md)\n`;
  doc += `- [Weather Dashboard](./weather-dashboard.md)\n\n`;
  
  doc += `---\n`;
  doc += `*Índice gerado automaticamente em ${new Date().toISOString()}*\n`;
  
  return doc;
}

function main() {
  console.log('🚀 Gerando documentação automática de módulos...\n');
  
  ensureDir(DOCS_DIR);
  
  const documented: string[] = [];
  
  for (const moduleName of PRIORITY_MODULES) {
    console.log(`📝 Gerando documentação para: ${moduleName}`);
    const doc = generateModuleDoc(moduleName);
    
    if (doc) {
      const docPath = path.join(DOCS_DIR, `${moduleName}.md`);
      fs.writeFileSync(docPath, doc);
      documented.push(moduleName);
      console.log(`   ✅ Salvo em: ${docPath}`);
    }
  }
  
  console.log(`\n📚 Gerando índice de módulos...`);
  const indexDoc = generateIndexDoc(documented);
  const indexPath = path.join(DOCS_DIR, 'README.md');
  fs.writeFileSync(indexPath, indexDoc);
  console.log(`   ✅ Índice salvo em: ${indexPath}`);
  
  console.log(`\n✨ Documentação gerada com sucesso!`);
  console.log(`   📊 Total de módulos: ${documented.length}`);
  console.log(`   📁 Diretório: ${DOCS_DIR}`);
}

main();
