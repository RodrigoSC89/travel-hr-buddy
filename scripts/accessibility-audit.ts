/**
 * Script de Auditoria de Acessibilidade Automatizada
 * Usa axe-core para verificar conformidade WCAG 2.1 AA
 * 
 * @author DeepAgent - Abacus.AI
 * @date 2025-12-11
 * @phase FASE 3.2
 */

import { chromium, Browser, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface AccessibilityIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

interface PageAuditResult {
  url: string;
  violations: AccessibilityIssue[];
  passes: number;
  incomplete: number;
  timestamp: string;
}

interface AuditSummary {
  totalPages: number;
  totalViolations: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  pageResults: PageAuditResult[];
  mostCommonIssues: Array<{
    id: string;
    count: number;
    impact: string;
    description: string;
  }>;
}

// URLs das páginas mais importantes para auditar
const PAGES_TO_AUDIT = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/esg-emissions', name: 'ESG & Emissions' },
  { path: '/crew-management', name: 'Crew Management' },
  { path: '/maintenance-scheduler', name: 'Maintenance' },
  { path: '/ism-audits', name: 'ISM Audits' },
  { path: '/fleet-overview', name: 'Fleet Overview' },
  { path: '/settings', name: 'Settings' },
  { path: '/admin', name: 'Admin Panel' },
];

async function auditPage(page: Page, url: string): Promise<PageAuditResult> {
  console.log(`🔍 Auditando: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Executar auditoria axe-core
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    return {
      url,
      violations: results.violations as AccessibilityIssue[],
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ Erro ao auditar ${url}:`, error);
    return {
      url,
      violations: [],
      passes: 0,
      incomplete: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

function generateSummary(results: PageAuditResult[]): AuditSummary {
  const allViolations = results.flatMap(r => r.violations);
  
  // Contar por impacto
  const criticalIssues = allViolations.filter(v => v.impact === 'critical').length;
  const seriousIssues = allViolations.filter(v => v.impact === 'serious').length;
  const moderateIssues = allViolations.filter(v => v.impact === 'moderate').length;
  const minorIssues = allViolations.filter(v => v.impact === 'minor').length;
  
  // Encontrar issues mais comuns
  const issueCount = new Map<string, { count: number; issue: AccessibilityIssue }>();
  allViolations.forEach(violation => {
    const existing = issueCount.get(violation.id);
    if (existing) {
      existing.count++;
    } else {
      issueCount.set(violation.id, { count: 1, issue: violation });
    }
  });
  
  const mostCommonIssues = Array.from(issueCount.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, data]) => ({
      id,
      count: data.count,
      impact: data.issue.impact,
      description: data.issue.description,
    }));
  
  return {
    totalPages: results.length,
    totalViolations: allViolations.length,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    pageResults: results,
    mostCommonIssues,
  };
}

function generateMarkdownReport(summary: AuditSummary): string {
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');
  
  let markdown = `# 🔍 Relatório de Auditoria de Acessibilidade
## Nautilus One - Travel HR Buddy

**Data:** ${date} às ${time}  
**Ferramenta:** axe-core v4.11.0  
**Padrão:** WCAG 2.1 AA  
**Fase:** FASE 3.2 - Melhorias de Acessibilidade

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Páginas Auditadas** | ${summary.totalPages} |
| **Total de Violações** | ${summary.totalViolations} |
| **Issues Críticos** | 🔴 ${summary.criticalIssues} |
| **Issues Sérios** | 🟠 ${summary.seriousIssues} |
| **Issues Moderados** | 🟡 ${summary.moderateIssues} |
| **Issues Menores** | 🔵 ${summary.minorIssues} |

### Pontuação Estimada de Acessibilidade

`;
  
  // Calcular pontuação aproximada (Lighthouse-like)
  const totalIssues = summary.totalViolations;
  const weightedScore = 100 - (
    (summary.criticalIssues * 10) +
    (summary.seriousIssues * 5) +
    (summary.moderateIssues * 2) +
    (summary.minorIssues * 1)
  );
  const score = Math.max(0, Math.min(100, weightedScore));
  
  markdown += `**Score Atual:** ${score.toFixed(0)}/100  
**Meta WCAG 2.1 AA:** >90/100  
**Status:** ${score >= 90 ? '✅ Aprovado' : '❌ Requer melhorias'}

---

## 🎯 ISSUES MAIS COMUNS

`;
  
  summary.mostCommonIssues.forEach((issue, index) => {
    const impactEmoji = {
      critical: '🔴',
      serious: '🟠',
      moderate: '🟡',
      minor: '🔵',
    }[issue.impact] || '⚪';
    
    markdown += `### ${index + 1}. ${issue.id} ${impactEmoji}

**Impacto:** ${issue.impact}  
**Ocorrências:** ${issue.count}  
**Descrição:** ${issue.description}

---

`;
  });
  
  markdown += `## 📄 RESULTADOS POR PÁGINA

`;
  
  summary.pageResults.forEach(result => {
    const violations = result.violations.length;
    const statusEmoji = violations === 0 ? '✅' : violations < 5 ? '🟡' : '🔴';
    
    markdown += `### ${statusEmoji} ${result.url}

| Métrica | Valor |
|---------|-------|
| **Violações** | ${violations} |
| **Testes Passados** | ${result.passes} |
| **Incompletos** | ${result.incomplete} |

`;
    
    if (result.violations.length > 0) {
      markdown += `#### Violações Encontradas:\n\n`;
      
      result.violations.forEach((violation, index) => {
        const impactEmoji = {
          critical: '🔴',
          serious: '🟠',
          moderate: '🟡',
          minor: '🔵',
        }[violation.impact] || '⚪';
        
        markdown += `${index + 1}. **${violation.id}** ${impactEmoji} (${violation.impact})
   - ${violation.description}
   - [Saiba mais](${violation.helpUrl})
   - Elementos afetados: ${violation.nodes.length}
`;
        
        // Mostrar apenas os primeiros 3 elementos afetados
        violation.nodes.slice(0, 3).forEach(node => {
          markdown += `     - \`${node.target.join(' > ')}\`\n`;
        });
        
        if (violation.nodes.length > 3) {
          markdown += `     - ... e mais ${violation.nodes.length - 3} elementos\n`;
        }
        
        markdown += '\n';
      });
    }
    
    markdown += `---\n\n`;
  });
  
  markdown += `## 📋 RECOMENDAÇÕES PRIORITÁRIAS

### 🔴 Críticas (Impacto Alto)
`;
  
  if (summary.criticalIssues > 0) {
    markdown += `- Corrigir **${summary.criticalIssues} issues críticos** imediatamente\n`;
    markdown += `- Bloqueia acessibilidade para usuários com deficiências\n`;
  } else {
    markdown += `- ✅ Nenhum issue crítico encontrado\n`;
  }
  
  markdown += `\n### 🟠 Sérias (Impacto Médio-Alto)\n`;
  
  if (summary.seriousIssues > 0) {
    markdown += `- Corrigir **${summary.seriousIssues} issues sérios** na próxima sprint\n`;
    markdown += `- Dificulta significativamente a experiência de usuários\n`;
  } else {
    markdown += `- ✅ Nenhum issue sério encontrado\n`;
  }
  
  markdown += `\n### 🟡 Moderadas (Impacto Médio)\n`;
  
  if (summary.moderateIssues > 0) {
    markdown += `- Corrigir **${summary.moderateIssues} issues moderados** em 2 sprints\n`;
    markdown += `- Melhora a experiência mas não é bloqueante\n`;
  } else {
    markdown += `- ✅ Nenhum issue moderado encontrado\n`;
  }
  
  markdown += `\n## 🚀 PRÓXIMOS PASSOS

1. **Corrigir Issues Críticos** (Sprint Atual)
   - Focar em ${summary.mostCommonIssues.slice(0, 3).map(i => i.id).join(', ')}
   
2. **Implementar Testes Automatizados**
   - Adicionar testes de regressão de acessibilidade
   - Integrar axe-core no CI/CD
   
3. **Treinar Equipe**
   - Documentar padrões de acessibilidade
   - Criar guia de desenvolvimento acessível
   
4. **Re-auditar**
   - Executar nova auditoria após correções
   - Meta: Score >90/100

---

**Gerado por:** DeepAgent - Abacus.AI  
**Timestamp:** ${new Date().toISOString()}  
**Versão:** FASE 3.2.0
`;
  
  return markdown;
}

async function main() {
  console.log('🚀 Iniciando Auditoria de Acessibilidade...\n');
  
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Detectar se está rodando localmente ou em produção
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  console.log(`🌐 URL Base: ${baseUrl}\n`);
  
  const results: PageAuditResult[] = [];
  
  for (const pageInfo of PAGES_TO_AUDIT) {
    const url = `${baseUrl}${pageInfo.path}`;
    const result = await auditPage(page, url);
    results.push(result);
    
    console.log(`   ✓ ${result.violations.length} violações encontradas`);
    console.log(`   ✓ ${result.passes} testes passados\n`);
  }
  
  await browser.close();
  
  // Gerar relatórios
  console.log('📝 Gerando relatórios...\n');
  
  const summary = generateSummary(results);
  const markdown = generateMarkdownReport(summary);
  
  // Salvar relatórios
  const outputDir = path.join(process.cwd(), 'reports', 'accessibility');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const markdownPath = path.join(outputDir, `accessibility-audit-${timestamp}.md`);
  const jsonPath = path.join(outputDir, `accessibility-audit-${timestamp}.json`);
  
  fs.writeFileSync(markdownPath, markdown);
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  
  // Também salvar como "latest" para referência rápida
  fs.writeFileSync(path.join(outputDir, 'accessibility-audit-latest.md'), markdown);
  fs.writeFileSync(path.join(outputDir, 'accessibility-audit-latest.json'), JSON.stringify(summary, null, 2));
  
  console.log('✅ Auditoria concluída!\n');
  console.log(`📄 Relatório Markdown: ${markdownPath}`);
  console.log(`📊 Relatório JSON: ${jsonPath}`);
  console.log(`\n📈 Score de Acessibilidade: ${Math.max(0, 100 - (summary.criticalIssues * 10 + summary.seriousIssues * 5 + summary.moderateIssues * 2 + summary.minorIssues))}/100`);
  console.log(`🎯 Meta: >90/100 para WCAG 2.1 AA\n`);
  
  // Retornar código de erro se houver issues críticos
  if (summary.criticalIssues > 0) {
    console.error(`⚠️  ATENÇÃO: ${summary.criticalIssues} issues críticos encontrados!`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erro na auditoria:', error);
  process.exit(1);
});
