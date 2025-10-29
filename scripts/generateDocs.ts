/**
 * PATCH 549 – Documentação Automática de Módulos (v1)
 * Script para gerar documentação técnica automatizada por módulo
 */

import * as fs from "fs";
import * as path from "path";

interface ModuleInfo {
  name: string;
  path: string;
  directories: string[];
  files: string[];
  tables: string[];
  apis: string[];
  patches: string[];
  description: string;
}

const SRC_DIR = path.join(process.cwd(), "src", "modules");
const DOCS_DIR = path.join(process.cwd(), "docs", "modules");
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

/**
 * Scan modules directory for all modules
 */
function scanModules(): string[] {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Modules directory not found: ${SRC_DIR}`);
    return [];
  }

  return fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Get all files in a directory recursively
 */
function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract database tables from module files
 */
function extractTables(modulePath: string): string[] {
  const tables = new Set<string>();
  const files = getFilesRecursively(modulePath);

  files.forEach((file) => {
    if (
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js")
    ) {
      try {
        const content = fs.readFileSync(file, "utf-8");

        // Look for Supabase table references
        const tableMatches = content.match(/\.from\(["']([^"']+)["']\)/g);
        if (tableMatches) {
          tableMatches.forEach((match) => {
            const tableName = match.match(/["']([^"']+)["']/)?.[1];
            if (tableName) {
              tables.add(tableName);
            }
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });

  return Array.from(tables).sort();
}

/**
 * Extract API routes from module files
 */
function extractAPIs(modulePath: string): string[] {
  const apis = new Set<string>();
  const files = getFilesRecursively(modulePath);

  files.forEach((file) => {
    if (
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js")
    ) {
      try {
        const content = fs.readFileSync(file, "utf-8");

        // Look for API routes
        const apiMatches = content.match(
          /\/api\/[a-zA-Z0-9\-_\/]+|functions\.invoke\(["']([^"']+)["']\)/g
        );
        if (apiMatches) {
          apiMatches.forEach((match) => {
            apis.add(match);
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });

  return Array.from(apis).sort();
}

/**
 * Find patches related to a module
 */
function findPatches(moduleName: string): string[] {
  const patches: string[] = [];

  if (!fs.existsSync(MIGRATIONS_DIR)) return patches;

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR);

  migrationFiles.forEach((file) => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");

      // Check if migration mentions the module
      const modulePattern = new RegExp(moduleName.replace(/-/g, "_"), "i");
      if (modulePattern.test(content) || modulePattern.test(file)) {
        patches.push(file);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });

  return patches.sort();
}

/**
 * Get module description from README or index file
 */
function getModuleDescription(modulePath: string): string {
  // Try to find README
  const readmePath = path.join(modulePath, "README.md");
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, "utf-8");
    const firstLine = content.split("\n")[0];
    return firstLine.replace(/^#*\s*/, "").trim();
  }

  // Try to extract from index file comments
  const indexFiles = ["index.tsx", "index.ts", "index.js"];
  for (const indexFile of indexFiles) {
    const indexPath = path.join(modulePath, indexFile);
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
      if (commentMatch) {
        return commentMatch[1].trim();
      }
    }
  }

  return "No description available";
}

/**
 * Gather information about a module
 */
function gatherModuleInfo(moduleName: string): ModuleInfo {
  const modulePath = path.join(SRC_DIR, moduleName);

  const directories = fs
    .readdirSync(modulePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const files = fs
    .readdirSync(modulePath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);

  return {
    name: moduleName,
    path: modulePath,
    directories,
    files,
    tables: extractTables(modulePath),
    apis: extractAPIs(modulePath),
    patches: findPatches(moduleName),
    description: getModuleDescription(modulePath),
  };
}

/**
 * Generate markdown documentation for a module
 */
function generateMarkdown(moduleInfo: ModuleInfo): string {
  let markdown = `# ${moduleInfo.name}\n\n`;
  markdown += `> ${moduleInfo.description}\n\n`;

  markdown += `## 📁 Estrutura\n\n`;
  markdown += `**Caminho:** \`${moduleInfo.path}\`\n\n`;

  if (moduleInfo.directories.length > 0) {
    markdown += `### Diretórios\n\n`;
    moduleInfo.directories.forEach((dir) => {
      markdown += `- \`${dir}/\`\n`;
    });
    markdown += `\n`;
  }

  if (moduleInfo.files.length > 0) {
    markdown += `### Arquivos Principais\n\n`;
    moduleInfo.files.slice(0, 10).forEach((file) => {
      markdown += `- \`${file}\`\n`;
    });
    markdown += `\n`;
  }

  if (moduleInfo.tables.length > 0) {
    markdown += `## 🗄️ Tabelas do Banco\n\n`;
    moduleInfo.tables.forEach((table) => {
      markdown += `- \`${table}\`\n`;
    });
    markdown += `\n`;
  }

  if (moduleInfo.apis.length > 0) {
    markdown += `## 🔌 APIs\n\n`;
    moduleInfo.apis.slice(0, 10).forEach((api) => {
      markdown += `- \`${api}\`\n`;
    });
    markdown += `\n`;
  }

  if (moduleInfo.patches.length > 0) {
    markdown += `## 🔧 PATCHES Aplicados\n\n`;
    moduleInfo.patches.slice(0, 10).forEach((patch) => {
      markdown += `- ${patch}\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n`;
  markdown += `*Documentação gerada automaticamente em ${new Date().toLocaleDateString("pt-BR")}*\n`;

  return markdown;
}

/**
 * Main function to generate documentation
 */
export function generateDocs(): void {
  console.log("🚀 Iniciando geração de documentação...\n");

  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Scan all modules
  const modules = scanModules();
  console.log(`📦 Encontrados ${modules.length} módulos\n`);

  let successCount = 0;

  // Generate documentation for each module
  modules.forEach((moduleName) => {
    try {
      console.log(`📝 Processando: ${moduleName}`);

      const moduleInfo = gatherModuleInfo(moduleName);
      const markdown = generateMarkdown(moduleInfo);

      const outputPath = path.join(DOCS_DIR, `${moduleName}.md`);
      fs.writeFileSync(outputPath, markdown, "utf-8");

      successCount++;
    } catch (error) {
      console.error(`❌ Erro ao processar ${moduleName}:`, error);
    }
  });

  // Generate index
  generateIndex(modules);

  console.log(
    `\n✅ Documentação gerada com sucesso para ${successCount}/${modules.length} módulos`
  );
  console.log(`📂 Arquivos salvos em: ${DOCS_DIR}`);
}

/**
 * Generate index file with all modules
 */
function generateIndex(modules: string[]): void {
  let markdown = `# Índice de Módulos\n\n`;
  markdown += `Total de módulos documentados: **${modules.length}**\n\n`;
  markdown += `## Módulos\n\n`;

  modules.sort().forEach((moduleName) => {
    markdown += `- [${moduleName}](./${moduleName}.md)\n`;
  });

  markdown += `\n---\n`;
  markdown += `*Documentação gerada automaticamente em ${new Date().toLocaleDateString("pt-BR")}*\n`;

  const indexPath = path.join(DOCS_DIR, "INDEX.md");
  fs.writeFileSync(indexPath, markdown, "utf-8");
}

// Run if called directly
generateDocs();
