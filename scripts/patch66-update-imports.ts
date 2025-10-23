/**
 * PATCH 66.0 - Import Path Updater
 * Updates all import paths to reflect new module structure
 */

import fs from 'fs';
import path from 'path';

interface ImportUpdate {
  file: string;
  oldImport: string;
  newImport: string;
}

const IMPORT_MAPPING: Record<string, string> = {
  // Core
  '@/modules/system-kernel': '@/modules/core/system-kernel',
  '@/modules/auth': '@/modules/core/auth',
  '@/modules/copilot': '@/modules/core/copilot',
  '@/modules/logger': '@/modules/core/logger',
  
  // Operations
  '@/modules/crew': '@/modules/operations/crew',
  '@/modules/fleet': '@/modules/operations/fleet',
  '@/modules/performance': '@/modules/operations/performance',
  '@/modules/feedback': '@/modules/operations/feedback',
  '@/modules/crew-scheduler': '@/modules/operations/crew-scheduler',
  '@/modules/crew-wellbeing': '@/modules/operations/crew-wellbeing',
  
  // Compliance
  '@/modules/audit-center': '@/modules/compliance/audit-center',
  '@/modules/compliance-hub': '@/modules/compliance/compliance-hub',
  '@/modules/documents': '@/modules/compliance/documents',
  '@/modules/sgso': '@/modules/compliance/sgso',
  
  // Intelligence
  '@/modules/ai-insights': '@/modules/intelligence/ai-insights',
  '@/modules/dp-intelligence': '@/modules/intelligence/dp-intelligence',
  '@/modules/analytics-core': '@/modules/intelligence/analytics-core',
  
  // Emergency
  '@/modules/emergency-response': '@/modules/emergency/emergency-response',
  '@/modules/mission-logs': '@/modules/emergency/mission-logs',
  '@/modules/risk-management': '@/modules/emergency/risk-management',
  
  // Planning
  '@/modules/mmi': '@/modules/planning/mmi',
  '@/modules/voyage-planner': '@/modules/planning/voyage-planner',
  '@/modules/fmea': '@/modules/planning/fmea',
  
  // Logistics
  '@/modules/logistics-hub': '@/modules/logistics/logistics-hub',
  '@/modules/fuel-optimizer': '@/modules/logistics/fuel-optimizer',
  
  // HR
  '@/modules/portal-funcionario': '@/modules/hr/portal-funcionario',
  '@/modules/peo-dp': '@/modules/hr/peo-dp',
  '@/modules/training-academy': '@/modules/hr/training-academy',
  
  // Connectivity
  '@/modules/channel-manager': '@/modules/connectivity/channel-manager',
  '@/modules/notifications-center': '@/modules/connectivity/notifications-center',
  '@/modules/api-gateway': '@/modules/connectivity/api-gateway',
  
  // Control
  '@/modules/control-hub': '@/modules/control/control-hub',
  '@/modules/bridgelink': '@/modules/control/bridgelink',
  '@/modules/forecast-global': '@/modules/control/forecast-global',
  
  // Workspace
  '@/modules/real-time-workspace': '@/modules/workspace/real-time-workspace',
  
  // Assistants
  '@/modules/voice-assistant': '@/modules/assistants/voice-assistant',
  
  // UI
  '@/modules/dashboard': '@/modules/ui/dashboard',
};

export function updateImportsInFile(filePath: string): ImportUpdate[] {
  const updates: ImportUpdate[] = [];
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPING)) {
      const importRegex = new RegExp(
        `(import\\s+.*?from\\s+['"])${oldPath.replace(/\//g, '\\/')}(['"])`,
        'g'
      );
      
      if (importRegex.test(content)) {
        const oldImport = oldPath;
        const newImport = newPath;
        
        content = content.replace(
          importRegex,
          `$1${newPath}$2`
        );
        
        updates.push({
          file: filePath,
          oldImport,
          newImport
        });
        
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
  
  return updates;
}

export function scanAndUpdateImports(directory: string): ImportUpdate[] {
  const allUpdates: ImportUpdate[] = [];
  
  function scanDirectory(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (!item.name.includes('node_modules') && !item.name.includes('.git')) {
          scanDirectory(fullPath);
        }
      } else if (item.isFile() && /\.(ts|tsx|js|jsx)$/.test(item.name)) {
        const updates = updateImportsInFile(fullPath);
        allUpdates.push(...updates);
      }
    }
  }
  
  scanDirectory(directory);
  return allUpdates;
}

// CLI execution
if (require.main === module) {
  console.log('🔄 PATCH 66.0 - Updating Import Paths\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const updates = scanAndUpdateImports(srcPath);
  
  console.log(`✅ Updated ${updates.length} imports\n`);
  
  // Group by file
  const byFile: Record<string, ImportUpdate[]> = {};
  for (const update of updates) {
    if (!byFile[update.file]) {
      byFile[update.file] = [];
    }
    byFile[update.file].push(update);
  }
  
  // Generate report
  const report = ['# PATCH 66.0 - Import Updates Report', ''];
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Total Updates:** ${updates.length}`);
  report.push(`**Files Modified:** ${Object.keys(byFile).length}`);
  report.push('');
  
  report.push('## 📝 Updated Files');
  for (const [file, fileUpdates] of Object.entries(byFile)) {
    report.push(`### ${file.replace(process.cwd(), '')}`);
    for (const update of fileUpdates) {
      report.push(`- \`${update.oldImport}\` → \`${update.newImport}\``);
    }
    report.push('');
  }
  
  const reportPath = path.join(process.cwd(), 'logs', 'patch66-import-updates.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report.join('\n'));
  
  console.log('📄 Report saved:', reportPath);
}
