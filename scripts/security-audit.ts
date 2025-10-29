#!/usr/bin/env tsx
/**
 * Security Audit Script - PATCH 535
 * Auditoria Lovable: Acesso, Logs e Ética
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AuditResult {
  category: string;
  status: 'VERDE' | 'AMARELO' | 'VERMELHO';
  checks: Check[];
  summary: string;
}

interface Check {
  name: string;
  passed: boolean;
  details: string;
}

const SUPABASE_DIR = path.join(__dirname, '../supabase');
const SRC_DIR = path.join(__dirname, '../src');
const AUDIT_DIR = path.join(__dirname, '../dev/audits');

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function checkRLSPolicies(): AuditResult {
  const checks: Check[] = [];
  const migrationsDir = path.join(SUPABASE_DIR, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    return {
      category: '🔐 Segurança (RLS)',
      status: 'VERMELHO',
      checks: [{
        name: 'Diretório de migrações',
        passed: false,
        details: 'Diretório de migrações não encontrado'
      }],
      summary: 'Não foi possível verificar políticas RLS'
    };
  }
  
  const migrations = fs.readdirSync(migrationsDir);
  const rlsMigrations = migrations.filter(m => 
    m.includes('rls') || m.includes('policy') || m.includes('policies')
  );
  
  checks.push({
    name: 'Migrações RLS encontradas',
    passed: rlsMigrations.length > 0,
    details: `${rlsMigrations.length} arquivos de migração RLS encontrados`
  });
  
  // Check for sensitive tables
  const sensitiveTables = [
    'profiles',
    'crew_members',
    'crew_health_records',
    'audit_logs',
    'access_logs',
    'ai_commands',
    'mission_logs'
  ];
  
  let tablesWithRLS = 0;
  
  for (const migration of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf-8');
    
    for (const table of sensitiveTables) {
      if (content.includes(`ALTER TABLE ${table}`) && content.includes('ENABLE ROW LEVEL SECURITY')) {
        tablesWithRLS++;
      }
    }
  }
  
  checks.push({
    name: 'Tabelas sensíveis com RLS',
    passed: tablesWithRLS >= sensitiveTables.length / 2,
    details: `${tablesWithRLS} de ${sensitiveTables.length} tabelas sensíveis com RLS habilitada`
  });
  
  const allPassed = checks.every(c => c.passed);
  const somePassed = checks.some(c => c.passed);
  
  return {
    category: '🔐 Segurança (RLS)',
    status: allPassed ? 'VERDE' : somePassed ? 'AMARELO' : 'VERMELHO',
    checks,
    summary: allPassed 
      ? 'RLS configurada adequadamente'
      : somePassed 
        ? 'RLS parcialmente configurada - requer atenção'
        : 'RLS não configurada - ação urgente necessária'
  };
}

function checkLogging(): AuditResult {
  const checks: Check[] = [];
  const migrationsDir = path.join(SUPABASE_DIR, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    return {
      category: '📝 Logging',
      status: 'VERMELHO',
      checks: [{
        name: 'Verificação de logs',
        passed: false,
        details: 'Não foi possível verificar tabelas de log'
      }],
      summary: 'Sistema de logging não verificado'
    };
  }
  
  const migrations = fs.readdirSync(migrationsDir);
  let hasAccessLogs = false;
  let hasAuditLogs = false;
  let hasAILogs = false;
  
  for (const migration of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf-8').toLowerCase();
    
    if (content.includes('access_logs') || content.includes('access_log')) {
      hasAccessLogs = true;
    }
    if (content.includes('audit_logs') || content.includes('audit_log')) {
      hasAuditLogs = true;
    }
    if (content.includes('ai_commands') || content.includes('ai_command_log')) {
      hasAILogs = true;
    }
  }
  
  checks.push({
    name: 'Access logs',
    passed: hasAccessLogs,
    details: hasAccessLogs ? 'Tabela access_logs encontrada' : 'Tabela access_logs não encontrada'
  });
  
  checks.push({
    name: 'Audit logs',
    passed: hasAuditLogs,
    details: hasAuditLogs ? 'Tabela audit_logs encontrada' : 'Tabela audit_logs não encontrada'
  });
  
  checks.push({
    name: 'AI command logs',
    passed: hasAILogs,
    details: hasAILogs ? 'Sistema de log AI encontrado' : 'Sistema de log AI não encontrado'
  });
  
  const allPassed = checks.every(c => c.passed);
  const somePassed = checks.some(c => c.passed);
  
  return {
    category: '📝 Logging',
    status: allPassed ? 'VERDE' : somePassed ? 'AMARELO' : 'VERMELHO',
    checks,
    summary: allPassed 
      ? 'Sistema de logging completo'
      : somePassed 
        ? 'Sistema de logging parcial - recomenda-se completar'
        : 'Sistema de logging ausente - implementação necessária'
  };
}

function checkAITransparency(): AuditResult {
  const checks: Check[] = [];
  
  // Check for AI traceability in code
  const aiFiles = [
    'src/ai',
    'src/lib/ai',
    'src/services/ai'
  ];
  
  let hasAILogging = false;
  let hasAITracking = false;
  
  for (const dir of aiFiles) {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      const files = getAllFiles(fullPath);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        if (content.includes('log') || content.includes('track') || content.includes('audit')) {
          hasAILogging = true;
        }
        
        if (content.includes('trace') || content.includes('command_id') || content.includes('origin')) {
          hasAITracking = true;
        }
      }
    }
  }
  
  checks.push({
    name: 'AI logging implementado',
    passed: hasAILogging,
    details: hasAILogging 
      ? 'Código AI contém chamadas de logging'
      : 'Código AI não contém logging adequado'
  });
  
  checks.push({
    name: 'Rastreabilidade AI',
    passed: hasAITracking,
    details: hasAITracking 
      ? 'Comandos AI são rastreáveis'
      : 'Comandos AI não possuem rastreabilidade adequada'
  });
  
  const allPassed = checks.every(c => c.passed);
  
  return {
    category: '🧠 Transparência AI',
    status: allPassed ? 'VERDE' : 'AMARELO',
    checks,
    summary: allPassed 
      ? 'Sistema AI transparente e rastreável'
      : 'Sistema AI requer melhorias em transparência'
  };
}

function checkLGPDCompliance(): AuditResult {
  const checks: Check[] = [];
  
  // Check for privacy-related code
  const privacyKeywords = ['anonymize', 'gdpr', 'lgpd', 'consent', 'privacy', 'data protection'];
  let privacyFeatures = 0;
  
  const srcFiles = getAllFiles(SRC_DIR);
  
  for (const file of srcFiles.slice(0, 1000)) { // Limit to prevent timeout
    try {
      const content = fs.readFileSync(file, 'utf-8').toLowerCase();
      
      for (const keyword of privacyKeywords) {
        if (content.includes(keyword)) {
          privacyFeatures++;
          break;
        }
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }
  
  checks.push({
    name: 'Recursos de privacidade',
    passed: privacyFeatures > 5,
    details: `${privacyFeatures} arquivos com recursos de privacidade encontrados`
  });
  
  // Check for consent management
  const hasConsentManagement = srcFiles.some(f => 
    f.includes('consent') || f.includes('ConsentScreen')
  );
  
  checks.push({
    name: 'Gerenciamento de consentimento',
    passed: hasConsentManagement,
    details: hasConsentManagement 
      ? 'Sistema de consentimento encontrado'
      : 'Sistema de consentimento não encontrado'
  });
  
  const allPassed = checks.every(c => c.passed);
  const somePassed = checks.some(c => c.passed);
  
  return {
    category: '📜 Conformidade LGPD',
    status: allPassed ? 'VERDE' : somePassed ? 'AMARELO' : 'VERMELHO',
    checks,
    summary: allPassed 
      ? 'Conformidade LGPD adequada'
      : somePassed 
        ? 'Conformidade LGPD parcial - requer atenção'
        : 'Conformidade LGPD insuficiente - ação necessária'
  };
}

function getAllFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  
  let results: string[] = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(getAllFiles(filePath));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  }
  
  return results;
}

function generateReport(results: AuditResult[]): string {
  let report = `# Relatório de Auditoria de Segurança - Lovable\n\n`;
  report += `**Data**: ${new Date().toISOString()}\n`;
  report += `**Versão**: PATCH 535\n\n`;
  
  report += `## Resumo Executivo\n\n`;
  
  const statusCounts = {
    VERDE: results.filter(r => r.status === 'VERDE').length,
    AMARELO: results.filter(r => r.status === 'AMARELO').length,
    VERMELHO: results.filter(r => r.status === 'VERMELHO').length
  };
  
  report += `- ✅ **Verde**: ${statusCounts.VERDE} categorias\n`;
  report += `- ⚠️  **Amarelo**: ${statusCounts.AMARELO} categorias\n`;
  report += `- ❌ **Vermelho**: ${statusCounts.VERMELHO} categorias\n\n`;
  
  const overallStatus = statusCounts.VERMELHO > 0 
    ? '❌ AÇÃO NECESSÁRIA' 
    : statusCounts.AMARELO > 0 
      ? '⚠️  ATENÇÃO RECOMENDADA'
      : '✅ APROVADO';
  
  report += `### Status Geral: ${overallStatus}\n\n`;
  
  report += `---\n\n`;
  
  for (const result of results) {
    const statusIcon = result.status === 'VERDE' ? '✅' : result.status === 'AMARELO' ? '⚠️' : '❌';
    
    report += `## ${result.category} ${statusIcon}\n\n`;
    report += `**Status**: ${result.status}\n\n`;
    report += `**Resumo**: ${result.summary}\n\n`;
    
    report += `### Verificações\n\n`;
    
    for (const check of result.checks) {
      const checkIcon = check.passed ? '✓' : '✗';
      report += `- [${checkIcon}] **${check.name}**: ${check.details}\n`;
    }
    
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `## Recomendações\n\n`;
  
  if (statusCounts.VERMELHO > 0) {
    report += `### ⚠️ Ações Urgentes\n\n`;
    
    for (const result of results.filter(r => r.status === 'VERMELHO')) {
      report += `- **${result.category}**: ${result.summary}\n`;
      
      for (const check of result.checks.filter(c => !c.passed)) {
        report += `  - ${check.name}: ${check.details}\n`;
      }
    }
    
    report += `\n`;
  }
  
  if (statusCounts.AMARELO > 0) {
    report += `### 📋 Melhorias Recomendadas\n\n`;
    
    for (const result of results.filter(r => r.status === 'AMARELO')) {
      report += `- **${result.category}**: ${result.summary}\n`;
      
      for (const check of result.checks.filter(c => !c.passed)) {
        report += `  - ${check.name}: ${check.details}\n`;
      }
    }
    
    report += `\n`;
  }
  
  report += `## Próximos Passos\n\n`;
  report += `1. Revisar e implementar ações urgentes (status VERMELHO)\n`;
  report += `2. Planejar melhorias para itens em AMARELO\n`;
  report += `3. Manter monitoramento contínuo de segurança\n`;
  report += `4. Realizar nova auditoria em 30 dias\n\n`;
  
  report += `---\n`;
  report += `*Relatório gerado automaticamente pelo sistema de auditoria*\n`;
  
  return report;
}

function main() {
  console.log('🔍 Iniciando auditoria de segurança...\n');
  
  const results: AuditResult[] = [];
  
  console.log('Verificando RLS...');
  results.push(checkRLSPolicies());
  
  console.log('Verificando logging...');
  results.push(checkLogging());
  
  console.log('Verificando transparência AI...');
  results.push(checkAITransparency());
  
  console.log('Verificando conformidade LGPD...');
  results.push(checkLGPDCompliance());
  
  console.log('\n📊 Gerando relatório...');
  const report = generateReport(results);
  
  ensureDir(AUDIT_DIR);
  const reportPath = path.join(AUDIT_DIR, 'lovable_security_validation.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Relatório salvo em: ${reportPath}\n`);
  
  // Print summary
  console.log('=== RESUMO DA AUDITORIA ===\n');
  
  for (const result of results) {
    const icon = result.status === 'VERDE' ? '✅' : result.status === 'AMARELO' ? '⚠️' : '❌';
    console.log(`${icon} ${result.category}: ${result.status}`);
    console.log(`   ${result.summary}\n`);
  }
  
  const hasIssues = results.some(r => r.status !== 'VERDE');
  
  if (hasIssues) {
    console.log('⚠️  Auditoria identificou itens que requerem atenção.');
    console.log(`📄 Consulte o relatório completo em: ${reportPath}`);
  } else {
    console.log('✅ Todos os indicadores de segurança estão VERDES!');
  }
}

main();
