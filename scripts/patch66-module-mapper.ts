/**
 * PATCH 66.0 - Module Mapper
 * Maps current 74 folders to 15 logical groups
 */

import fs from 'fs';
import path from 'path';

export interface ModuleMapping {
  currentPath: string;
  targetGroup: string;
  targetPath: string;
  status: 'active' | 'deprecated' | 'empty';
  fileCount: number;
}

const MODULE_GROUPS = {
  'core': [
    'system-kernel',
    'auth',
    'copilot',
    'logger',
    'monitoring'
  ],
  'operations': [
    'crew',
    'fleet',
    'performance',
    'feedback',
    'crew-scheduler',
    'crew-wellbeing'
  ],
  'compliance': [
    'audit-center',
    'compliance-hub',
    'documents',
    'documentos-ia',
    'sgso'
  ],
  'intelligence': [
    'ai-insights',
    'dp-intelligence',
    'analytics-core',
    'analytics-avancado',
    'analytics-tempo-real'
  ],
  'emergency': [
    'emergency-response',
    'mission-logs',
    'risk-management',
    'incident-reports'
  ],
  'planning': [
    'maintenance-planner',
    'mmi',
    'project-timeline',
    'voyage-planner',
    'fmea'
  ],
  'logistics': [
    'logistics-hub',
    'fuel-optimizer',
    'reservas'
  ],
  'hr': [
    'portal-funcionario',
    'peo-dp',
    'training-academy',
    'training-hub'
  ],
  'connectivity': [
    'channel-manager',
    'notifications-center',
    'api-gateway',
    'hub-integracoes',
    'comunicacao'
  ],
  'control': [
    'control-hub',
    'control_hub',
    'controlhub',
    'bridgelink',
    'forecast-global'
  ],
  'workspace': [
    'real-time-workspace',
    'colaboracao',
    'smart-workflow'
  ],
  'assistants': [
    'voice-assistant',
    'assistente-ia',
    'assistente-voz'
  ],
  'monitoring': [
    'monitor-avancado',
    'monitor-sistema',
    'system-health'
  ],
  'ui': [
    'dashboard',
    'visao-geral',
    'centro-notificacoes'
  ],
  'legacy': [
    'peotram',
    'peodp_ai',
    'ia-inovacao',
    'automacao-ia',
    'business-intelligence',
    'templates',
    'vault_ai',
    'viagens',
    'weather-dashboard',
    'alertas-precos',
    'finance-hub',
    'forecast',
    'ai',
    'sistema-maritimo',
    'configuracoes',
    'centro-ajuda',
    'otimizacao',
    'otimizacao-mobile',
    'task-automation',
    'checklists-inteligentes',
    'risk-audit'
  ]
};

export function scanModulesDirectory(): ModuleMapping[] {
  const modulesPath = path.join(process.cwd(), 'src', 'modules');
  const mappings: ModuleMapping[] = [];

  if (!fs.existsSync(modulesPath)) {
    console.error('❌ Modules directory not found');
    return [];
  }

  const folders = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📊 Found ${folders.length} module folders`);

  for (const folder of folders) {
    const currentPath = path.join(modulesPath, folder);
    const files = countFiles(currentPath);
    
    // Find target group
    let targetGroup = 'legacy';
    for (const [group, modules] of Object.entries(MODULE_GROUPS)) {
      if (modules.includes(folder)) {
        targetGroup = group;
        break;
      }
    }

    const status = files === 0 ? 'empty' : 
                   targetGroup === 'legacy' ? 'deprecated' : 'active';

    mappings.push({
      currentPath: `src/modules/${folder}`,
      targetGroup,
      targetPath: `src/modules/${targetGroup}/${folder}`,
      status,
      fileCount: files
    });
  }

  return mappings;
}

function countFiles(dirPath: string): number {
  let count = 0;
  
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        count += countFiles(path.join(dirPath, item.name));
      } else if (item.isFile() && /\.(ts|tsx|js|jsx)$/.test(item.name)) {
        count++;
      }
    }
  } catch (error) {
    // Directory might be inaccessible
  }
  
  return count;
}

export function generateMappingReport(mappings: ModuleMapping[]): string {
  const report = [`# PATCH 66.0 - Module Mapping Report`, ''];
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Total Modules:** ${mappings.length}`);
  report.push('');

  // Statistics
  const stats = {
    active: mappings.filter(m => m.status === 'active').length,
    deprecated: mappings.filter(m => m.status === 'deprecated').length,
    empty: mappings.filter(m => m.status === 'empty').length
  };

  report.push('## 📊 Statistics');
  report.push(`- ✅ Active: ${stats.active}`);
  report.push(`- ⚠️ Deprecated: ${stats.deprecated}`);
  report.push(`- 📭 Empty: ${stats.empty}`);
  report.push('');

  // Group by target
  report.push('## 🎯 Target Groups');
  const byGroup: Record<string, ModuleMapping[]> = {};
  
  for (const mapping of mappings) {
    if (!byGroup[mapping.targetGroup]) {
      byGroup[mapping.targetGroup] = [];
    }
    byGroup[mapping.targetGroup].push(mapping);
  }

  for (const [group, modules] of Object.entries(byGroup)) {
    if (group === 'legacy') continue;
    report.push(`### ${group} (${modules.length} modules)`);
    for (const mod of modules) {
      const icon = mod.status === 'active' ? '✅' : mod.status === 'empty' ? '📭' : '⚠️';
      report.push(`- ${icon} \`${mod.currentPath}\` → \`${mod.targetPath}\` (${mod.fileCount} files)`);
    }
    report.push('');
  }

  // Legacy/deprecated modules
  const legacyModules = byGroup['legacy'] || [];
  if (legacyModules.length > 0) {
    report.push(`### 🗄️ Legacy/Deprecated (${legacyModules.length} modules)`);
    report.push('**Recommendation:** Archive or remove these modules');
    report.push('');
    for (const mod of legacyModules) {
      report.push(`- ⚠️ \`${mod.currentPath}\` (${mod.fileCount} files)`);
    }
  }

  return report.join('\n');
}

// CLI execution
if (require.main === module) {
  console.log('🔍 PATCH 66.0 - Module Mapping\n');
  
  const mappings = scanModulesDirectory();
  const report = generateMappingReport(mappings);
  
  // Save report
  const reportPath = path.join(process.cwd(), 'logs', 'patch66-module-mapping.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  
  console.log('✅ Report generated:', reportPath);
  console.log('\n' + report);
}
