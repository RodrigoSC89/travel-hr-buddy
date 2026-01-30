#!/usr/bin/env npx ts-node
/**
 * Unused Components Analysis Script
 * Identifies React components that are exported but never imported/used
 * 
 * Usage: npx ts-node scripts/find-unused-components.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentInfo {
  name: string;
  file: string;
  exportType: 'named' | 'default';
  isUsed: boolean;
  usageCount: number;
  usedIn: string[];
}

// Recursively get all files
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', '__tests__', 'test'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function findComponents(): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  const srcDir = path.join(process.cwd(), 'src');
  const componentDirs = [
    path.join(srcDir, 'components'),
    path.join(srcDir, 'modules'),
    path.join(srcDir, 'pages'),
  ];
  
  const componentFiles: string[] = [];
  for (const dir of componentDirs) {
    componentFiles.push(...getAllFiles(dir, ['.tsx']));
  }
  
  // Patterns to find component exports
  const patterns = {
    namedExport: /export\s+(?:const|function)\s+([A-Z][A-Za-z0-9_]*)/g,
    defaultExport: /export\s+default\s+(?:function\s+)?([A-Z][A-Za-z0-9_]*)/g,
    forwardRef: /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:React\.)?forwardRef/g,
    memo: /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:React\.)?memo/g,
  };
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    
    // Find named exports
    let match;
    const namedRegex = new RegExp(patterns.namedExport.source, 'g');
    while ((match = namedRegex.exec(content)) !== null) {
      const name = match[1];
      // Skip non-component exports (hooks, utils, types)
      if (name.startsWith('use') || name.endsWith('Type') || name.endsWith('Props')) continue;
      
      components.push({
        name,
        file: relativePath,
        exportType: 'named',
        isUsed: false,
        usageCount: 0,
        usedIn: [],
      });
    }
    
    // Find default exports
    const defaultRegex = new RegExp(patterns.defaultExport.source, 'g');
    while ((match = defaultRegex.exec(content)) !== null) {
      const name = match[1];
      if (name.startsWith('use')) continue;
      
      // Check if already added as named
      if (!components.some(c => c.file === relativePath && c.name === name)) {
        components.push({
          name,
          file: relativePath,
          exportType: 'default',
          isUsed: false,
          usageCount: 0,
          usedIn: [],
        });
      }
    }
    
    // Find forwardRef components
    const forwardRefRegex = new RegExp(patterns.forwardRef.source, 'g');
    while ((match = forwardRefRegex.exec(content)) !== null) {
      const name = match[1];
      if (!components.some(c => c.file === relativePath && c.name === name)) {
        components.push({
          name,
          file: relativePath,
          exportType: 'named',
          isUsed: false,
          usageCount: 0,
          usedIn: [],
        });
      }
    }
  }
  
  return components;
}

function checkComponentUsage(components: ComponentInfo[]): void {
  const srcDir = path.join(process.cwd(), 'src');
  const allFiles = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  for (const component of components) {
    const componentDir = path.dirname(component.file);
    
    for (const file of allFiles) {
      // Skip the component's own file
      if (file.replace(process.cwd(), '') === component.file) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = file.replace(process.cwd(), '');
      
      // Check for imports
      const importPatterns = [
        new RegExp(`import\\s+${component.name}\\s+from`, 'g'),
        new RegExp(`import\\s+\\{[^}]*\\b${component.name}\\b[^}]*\\}\\s+from`, 'g'),
        new RegExp(`import.*\\*.*as.*from.*${path.dirname(component.file).replace(/\\/g, '/')}`, 'g'),
      ];
      
      // Check for JSX usage
      const jsxPattern = new RegExp(`<${component.name}[\\s/>]`, 'g');
      
      let isUsedInFile = false;
      
      for (const pattern of importPatterns) {
        if (pattern.test(content)) {
          isUsedInFile = true;
          break;
        }
      }
      
      if (!isUsedInFile && jsxPattern.test(content)) {
        isUsedInFile = true;
      }
      
      if (isUsedInFile) {
        component.isUsed = true;
        component.usageCount++;
        component.usedIn.push(relativePath);
      }
    }
  }
  
  // Also check barrel exports (index.ts files)
  for (const component of components) {
    if (component.isUsed) continue;
    
    const dirIndexPath = path.join(process.cwd(), path.dirname(component.file), 'index.ts');
    const dirIndexTsxPath = path.join(process.cwd(), path.dirname(component.file), 'index.tsx');
    
    for (const indexPath of [dirIndexPath, dirIndexTsxPath]) {
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        if (content.includes(component.name)) {
          // Check if the index file itself is used
          const indexRelative = indexPath.replace(process.cwd(), '');
          const indexDir = path.dirname(indexPath);
          
          // Look for imports of this directory
          const allFiles = getAllFiles(path.join(process.cwd(), 'src'), ['.ts', '.tsx']);
          for (const file of allFiles) {
            if (file.includes(indexDir)) continue;
            const fileContent = fs.readFileSync(file, 'utf-8');
            const importDir = indexDir.replace(process.cwd(), '').replace(/\\/g, '/');
            if (fileContent.includes(importDir) && fileContent.includes(component.name)) {
              component.isUsed = true;
              component.usageCount++;
              component.usedIn.push(file.replace(process.cwd(), ''));
            }
          }
        }
      }
    }
  }
}

function main() {
  console.log('🔍 Analyzing components...\n');
  
  const components = findComponents();
  checkComponentUsage(components);
  
  const unusedComponents = components.filter(c => !c.isUsed);
  const usedComponents = components.filter(c => c.isUsed);
  
  // Group unused by directory
  const unusedByDir: Record<string, ComponentInfo[]> = {};
  for (const comp of unusedComponents) {
    const dir = path.dirname(comp.file);
    if (!unusedByDir[dir]) unusedByDir[dir] = [];
    unusedByDir[dir].push(comp);
  }
  
  console.log(`
========================================
UNUSED COMPONENTS ANALYSIS - Nauti One v4.0
========================================

Total Components Found: ${components.length}
Used Components: ${usedComponents.length}
Unused Components: ${unusedComponents.length}

========================================
`);
  
  if (unusedComponents.length > 0) {
    console.log('🗑️  UNUSED COMPONENTS:\n');
    
    for (const [dir, comps] of Object.entries(unusedByDir)) {
      console.log(`📁 ${dir}`);
      for (const comp of comps) {
        console.log(`   - ${comp.name} (${comp.exportType})`);
      }
      console.log('');
    }
  } else {
    console.log('✅ No unused components found!\n');
  }
  
  // Top used components
  const topUsed = usedComponents
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
  
  console.log('📊 TOP 10 MOST USED COMPONENTS:\n');
  topUsed.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} - ${c.usageCount} usages`);
  });
  
  // Save reports
  fs.writeFileSync('unused-components.json', JSON.stringify({
    summary: {
      totalComponents: components.length,
      usedComponents: usedComponents.length,
      unusedComponents: unusedComponents.length,
    },
    unusedComponents,
    allComponents: components,
  }, null, 2));
  
  console.log('\n✅ Report saved to: unused-components.json');
  
  // Files that can be deleted
  const filesToDelete = [...new Set(unusedComponents.map(c => c.file))];
  if (filesToDelete.length > 0) {
    console.log(`\n⚠️  ${filesToDelete.length} files may be safe to delete`);
    fs.writeFileSync('files-to-delete.txt', filesToDelete.join('\n'));
    console.log('   See: files-to-delete.txt');
  }
}

main();
