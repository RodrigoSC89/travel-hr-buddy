#!/usr/bin/env ts-node
/**
 * CI Validation Script: Sidebar Structure Validator
 * Ensures all 16 mandatory groups are present in sidebar-routes.ts
 * 
 * Usage: npx ts-node scripts/validate-sidebar.ts
 * Exit code: 0 = success, 1 = failure
 * 
 * ⚠️ This script is part of the CI/CD pipeline
 * Do NOT modify the MANDATORY_GROUPS without approval
 */

import * as fs from 'fs';
import * as path from 'path';

// 16 mandatory groups that MUST be present - OFFICIAL v3.2.0
const MANDATORY_GROUPS = [
  { id: 1, emoji: "🧠", label: "Centro de Comando" },
  { id: 2, emoji: "⚓", label: "Operações Marítimas" },
  { id: 3, emoji: "🔧", label: "Manutenção" },
  { id: 4, emoji: "🌊", label: "Operações Submarinas" },
  { id: 5, emoji: "🤖", label: "IA & Automação" },
  { id: 6, emoji: "📡", label: "Telemetria & Monitoramento" },
  { id: 7, emoji: "🌐", label: "APIs & Integrações" },
  { id: 8, emoji: "📁", label: "Relatórios & Documentos" },
  { id: 9, emoji: "📢", label: "Comunicação & Alertas" },
  { id: 10, emoji: "🔍", label: "Auditorias" },
  { id: 11, emoji: "👥", label: "RH & Pessoas" },
  { id: 12, emoji: "🎓", label: "Treinamentos" },
  { id: 13, emoji: "💰", label: "Finanças & Procurement" },
  { id: 14, emoji: "🌱", label: "ESG & Sustentabilidade" },
  { id: 15, emoji: "✈️", label: "Viagens & Logística" },
  { id: 16, emoji: "⚙️", label: "Sistema & Configurações" },
];

interface ValidationResult {
  success: boolean;
  groupsFound: number;
  groupsMissing: string[];
  warnings: string[];
  details: string[];
}

function validateSidebar(): ValidationResult {
  const result: ValidationResult = {
    success: true,
    groupsFound: 0,
    groupsMissing: [],
    warnings: [],
    details: [],
  };

  // Read sidebar-routes.ts file
  const sidebarPath = path.join(__dirname, '../src/config/sidebar-routes.ts');
  
  if (!fs.existsSync(sidebarPath)) {
    result.success = false;
    result.warnings.push(`❌ sidebar-routes.ts not found at ${sidebarPath}`);
    return result;
  }

  const content = fs.readFileSync(sidebarPath, 'utf-8');
  
  // Check for protective comment
  if (!content.includes('⚠️ ATENÇÃO DEVS') && !content.includes('ATENÇÃO DEVS')) {
    result.warnings.push('⚠️ Protective comment not found in sidebar-routes.ts');
  }

  // Validate each mandatory group
  MANDATORY_GROUPS.forEach((group) => {
    const labelPattern = new RegExp(group.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const emojiPattern = new RegExp(group.emoji, 'u');
    
    const hasLabel = labelPattern.test(content);
    const hasEmoji = emojiPattern.test(content);
    
    if (hasLabel || hasEmoji) {
      result.groupsFound++;
      result.details.push(`✅ [${group.id}] ${group.emoji} ${group.label} - FOUND`);
    } else {
      result.success = false;
      result.groupsMissing.push(`${group.emoji} ${group.label}`);
      result.details.push(`❌ [${group.id}] ${group.emoji} ${group.label} - MISSING`);
    }
  });

  // Additional validations
  const exportPattern = /export\s+const\s+SIDEBAR_ROUTES/;
  if (!exportPattern.test(content)) {
    result.warnings.push('⚠️ SIDEBAR_ROUTES export not found');
  }

  // Count total items (approximate)
  const itemMatches = content.match(/path:\s*['"]/g);
  const itemCount = itemMatches ? itemMatches.length : 0;
  result.details.push(`📊 Total routes found: ${itemCount}`);

  if (itemCount < 50) {
    result.warnings.push(`⚠️ Low route count (${itemCount}). Expected 100+ modules.`);
  }

  return result;
}

function main(): void {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔍 NAUTILUS ONE - SIDEBAR VALIDATION SCRIPT');
  console.log('  Version: v3.2.0 | Required Groups: 16');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const result = validateSidebar();

  // Print details
  console.log('📋 VALIDATION DETAILS:');
  console.log('───────────────────────────────────────────────────────────────');
  result.details.forEach((detail) => console.log(`  ${detail}`));
  console.log('');

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    console.log('───────────────────────────────────────────────────────────────');
    result.warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log('');
  }

  // Print summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Groups Found:   ${result.groupsFound}/16`);
  console.log(`  Groups Missing: ${result.groupsMissing.length}`);
  console.log(`  Warnings:       ${result.warnings.length}`);
  console.log('');

  if (result.groupsMissing.length > 0) {
    console.log('  ❌ MISSING GROUPS:');
    result.groupsMissing.forEach((group) => console.log(`     - ${group}`));
    console.log('');
  }

  // Final result
  if (result.success) {
    console.log('  ✅ RESULT: PASSED - All 16 mandatory groups are present');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    process.exit(0);
  } else {
    console.log('  ❌ RESULT: FAILED - Some mandatory groups are missing');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  🛑 CI/CD BLOCKED: Please restore missing sidebar groups');
    console.log('  📖 Reference: dev/SIDEBAR-COMPLETE.md');
    console.log('');
    process.exit(1);
  }
}

main();
