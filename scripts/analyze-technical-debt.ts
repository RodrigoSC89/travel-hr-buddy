#!/usr/bin/env npx ts-node
/**
 * Technical Debt Analysis Script
 * Comprehensive analysis of code quality issues
 * 
 * Usage: npx ts-node scripts/analyze-technical-debt.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

enum DebtCategory {
  COMPLEXITY = 'complexity',
  DUPLICATION = 'duplication',
  TYPE_SAFETY = 'type_safety',
  CODE_SMELLS = 'code_smells',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  ACCESSIBILITY = 'accessibility',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  ARCHITECTURE = 'architecture',
  OUTDATED_PATTERNS = 'outdated_patterns',
}

interface TechnicalDebt {
  id: string;
  category: DebtCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  location: {
    file: string;
    line?: number;
    function?: string;
  };
  impact: {
    maintainability: number;
    performance: number;
    security: number;
    scalability: number;
    testability: number;
  };
  effort: {
    estimatedHours: number;
    complexity: 'TRIVIAL' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'VERY_COMPLEX';
    requiresDesign: boolean;
    breakingChange: boolean;
  };
  solution: {
    description: string;
    codeExample?: { before: string; after: string };
    references: string[];
  };
  priorityScore: number;
  mustFixBefore: Date;
}

interface DebtStats {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  totalEffort: number;
}

// ============================================
// UTILITIES
// ============================================

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function calculatePriority(debt: TechnicalDebt): number {
  const impactScore = (
    debt.impact.maintainability * 2 +
    debt.impact.performance * 2 +
    debt.impact.security * 4 +
    debt.impact.scalability * 1 +
    debt.impact.testability * 1
  ) / 10;
  
  const effortMultiplier: Record<string, number> = {
    TRIVIAL: 1.5,
    SIMPLE: 1.2,
    MODERATE: 1.0,
    COMPLEX: 0.7,
    VERY_COMPLEX: 0.5,
  };
  
  const severityMultiplier: Record<string, number> = {
    CRITICAL: 3.0,
    HIGH: 2.0,
    MEDIUM: 1.0,
    LOW: 0.5,
  };
  
  const breakingPenalty = debt.effort.breakingChange ? 0.7 : 1.0;
  
  return impactScore * 
         effortMultiplier[debt.effort.complexity] * 
         severityMultiplier[debt.severity] * 
         breakingPenalty;
}

// ============================================
// ANALYZERS
// ============================================

function analyzeTypeSafety(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  const patterns = [
    { regex: /@ts-ignore/g, name: '@ts-ignore', severity: 'HIGH' as const },
    { regex: /@ts-nocheck/g, name: '@ts-nocheck', severity: 'CRITICAL' as const },
    { regex: /:\s*any\b/g, name: 'explicit any', severity: 'MEDIUM' as const },
    { regex: /as\s+any\b/g, name: 'any cast', severity: 'MEDIUM' as const },
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    const lines = content.split('\n');
    
    for (const pattern of patterns) {
      lines.forEach((line, idx) => {
        if (pattern.regex.test(line)) {
          debts.push({
            id: `DEBT-TS-${String(debtId++).padStart(3, '0')}`,
            category: DebtCategory.TYPE_SAFETY,
            severity: pattern.severity,
            title: `TypeScript violation: ${pattern.name}`,
            description: `Found ${pattern.name} at line ${idx + 1}`,
            location: { file: relativePath, line: idx + 1 },
            impact: {
              maintainability: 7,
              performance: 1,
              security: pattern.severity === 'CRITICAL' ? 8 : 4,
              scalability: 5,
              testability: 6,
            },
            effort: {
              estimatedHours: pattern.severity === 'CRITICAL' ? 2 : 0.5,
              complexity: pattern.severity === 'CRITICAL' ? 'COMPLEX' : 'SIMPLE',
              requiresDesign: false,
              breakingChange: false,
            },
            solution: {
              description: `Replace ${pattern.name} with proper types`,
              references: ['https://www.typescriptlang.org/tsconfig#strict'],
            },
            priorityScore: 0,
            mustFixBefore: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          });
          pattern.regex.lastIndex = 0; // Reset regex
        }
      });
    }
  }
  
  return debts;
}

function analyzeLargeFiles(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  const threshold = 400;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lineCount = content.split('\n').length;
    
    if (lineCount > threshold) {
      const relativePath = file.replace(process.cwd(), '');
      debts.push({
        id: `DEBT-SIZE-${String(debtId++).padStart(3, '0')}`,
        category: DebtCategory.ARCHITECTURE,
        severity: lineCount > 800 ? 'HIGH' : 'MEDIUM',
        title: `Large file: ${lineCount} lines`,
        description: `File exceeds ${threshold} line threshold`,
        location: { file: relativePath },
        impact: {
          maintainability: 8,
          performance: 2,
          security: 1,
          scalability: 6,
          testability: 7,
        },
        effort: {
          estimatedHours: Math.ceil(lineCount / 100),
          complexity: lineCount > 800 ? 'COMPLEX' : 'MODERATE',
          requiresDesign: true,
          breakingChange: false,
        },
        solution: {
          description: 'Split into smaller, focused modules',
          references: ['https://refactoring.guru/smells/large-class'],
        },
        priorityScore: 0,
        mustFixBefore: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }
  
  return debts;
}

function analyzeConsoleLogs(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  for (const file of files) {
    // Skip logger files
    if (file.includes('logger')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const relativePath = file.replace(process.cwd(), '');
    
    lines.forEach((line, idx) => {
      if (/console\.(log|debug|info)\(/.test(line)) {
        debts.push({
          id: `DEBT-LOG-${String(debtId++).padStart(3, '0')}`,
          category: DebtCategory.CODE_SMELLS,
          severity: 'LOW',
          title: 'Console log in production code',
          description: `Found console statement at line ${idx + 1}`,
          location: { file: relativePath, line: idx + 1 },
          impact: {
            maintainability: 3,
            performance: 2,
            security: 2,
            scalability: 1,
            testability: 1,
          },
          effort: {
            estimatedHours: 0.1,
            complexity: 'TRIVIAL',
            requiresDesign: false,
            breakingChange: false,
          },
          solution: {
            description: 'Remove console.log or replace with logger',
            codeExample: {
              before: 'console.log("Debug:", data);',
              after: 'logger.debug("Debug:", data);',
            },
            references: [],
          },
          priorityScore: 0,
          mustFixBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    });
  }
  
  return debts;
}

function analyzeSecurityIssues(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  const securityPatterns = [
    { 
      regex: /dangerouslySetInnerHTML/g, 
      name: 'dangerouslySetInnerHTML', 
      desc: 'XSS vulnerability risk',
      severity: 'CRITICAL' as const,
    },
    { 
      regex: /innerHTML\s*=/g, 
      name: 'innerHTML assignment', 
      desc: 'XSS vulnerability risk',
      severity: 'CRITICAL' as const,
    },
    { 
      regex: /eval\s*\(/g, 
      name: 'eval()', 
      desc: 'Code injection risk',
      severity: 'CRITICAL' as const,
    },
    { 
      regex: /`SELECT.*\$\{|`INSERT.*\$\{|`UPDATE.*\$\{|`DELETE.*\$\{/g, 
      name: 'SQL template literal', 
      desc: 'SQL injection risk',
      severity: 'CRITICAL' as const,
    },
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    const lines = content.split('\n');
    
    for (const pattern of securityPatterns) {
      lines.forEach((line, idx) => {
        if (pattern.regex.test(line)) {
          debts.push({
            id: `DEBT-SEC-${String(debtId++).padStart(3, '0')}`,
            category: DebtCategory.SECURITY,
            severity: pattern.severity,
            title: `Security: ${pattern.name}`,
            description: pattern.desc,
            location: { file: relativePath, line: idx + 1 },
            impact: {
              maintainability: 4,
              performance: 1,
              security: 10,
              scalability: 2,
              testability: 3,
            },
            effort: {
              estimatedHours: 2,
              complexity: 'MODERATE',
              requiresDesign: false,
              breakingChange: false,
            },
            solution: {
              description: `Replace ${pattern.name} with safe alternative`,
              references: ['https://owasp.org/www-community/xss-filter-evasion-cheatsheet'],
            },
            priorityScore: 0,
            mustFixBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          pattern.regex.lastIndex = 0;
        }
      });
    }
  }
  
  return debts;
}

function analyzePerformanceIssues(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    
    // Check for N+1 queries (supabase inside map/forEach)
    if (/\.map\s*\([^)]*\n[^}]*supabase|\.forEach\s*\([^)]*\n[^}]*supabase/.test(content)) {
      debts.push({
        id: `DEBT-PERF-${String(debtId++).padStart(3, '0')}`,
        category: DebtCategory.PERFORMANCE,
        severity: 'HIGH',
        title: 'N+1 query pattern detected',
        description: 'Database query inside loop',
        location: { file: relativePath },
        impact: {
          maintainability: 5,
          performance: 10,
          security: 1,
          scalability: 9,
          testability: 4,
        },
        effort: {
          estimatedHours: 3,
          complexity: 'MODERATE',
          requiresDesign: true,
          breakingChange: false,
        },
        solution: {
          description: 'Use batch query with .in() or single query with joins',
          codeExample: {
            before: 'items.map(async item => await supabase.from("x").eq("id", item.id))',
            after: 'await supabase.from("x").in("id", items.map(i => i.id))',
          },
          references: [],
        },
        priorityScore: 0,
        mustFixBefore: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }
    
    // Check for useState/useEffect inside map
    if (/\.map\s*\([^)]*\n[^}]*(useState|useEffect)/.test(content)) {
      debts.push({
        id: `DEBT-PERF-${String(debtId++).padStart(3, '0')}`,
        category: DebtCategory.PERFORMANCE,
        severity: 'CRITICAL',
        title: 'Hooks called inside loop',
        description: 'useState/useEffect inside map violates React rules',
        location: { file: relativePath },
        impact: {
          maintainability: 8,
          performance: 7,
          security: 1,
          scalability: 6,
          testability: 8,
        },
        effort: {
          estimatedHours: 2,
          complexity: 'MODERATE',
          requiresDesign: true,
          breakingChange: true,
        },
        solution: {
          description: 'Extract mapped items into separate components',
          references: ['https://reactjs.org/docs/hooks-rules.html'],
        },
        priorityScore: 0,
        mustFixBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
  }
  
  return debts;
}

function analyzeMissingErrorHandling(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    
    // Find async functions without try-catch
    const asyncFnRegex = /async\s+(?:function\s+)?(\w+)?\s*\([^)]*\)\s*(?::\s*Promise<[^>]+>)?\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;
    
    while ((match = asyncFnRegex.exec(content)) !== null) {
      const fnBody = match[2];
      const hasTryCatch = /try\s*\{/.test(fnBody);
      const hasAwait = /await\s/.test(fnBody);
      
      if (hasAwait && !hasTryCatch) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        debts.push({
          id: `DEBT-ERR-${String(debtId++).padStart(3, '0')}`,
          category: DebtCategory.CODE_SMELLS,
          severity: 'HIGH',
          title: 'Async function without error handling',
          description: `Function${match[1] ? ` ${match[1]}` : ''} missing try-catch`,
          location: { file: relativePath, line: lineNumber, function: match[1] },
          impact: {
            maintainability: 6,
            performance: 2,
            security: 3,
            scalability: 4,
            testability: 5,
          },
          effort: {
            estimatedHours: 0.5,
            complexity: 'SIMPLE',
            requiresDesign: false,
            breakingChange: false,
          },
          solution: {
            description: 'Add try-catch block with proper error handling',
            codeExample: {
              before: 'async function fetchData() {\n  const data = await api.get();\n  return data;\n}',
              after: 'async function fetchData() {\n  try {\n    const data = await api.get();\n    return data;\n  } catch (error) {\n    logger.error("Fetch failed", error);\n    throw error;\n  }\n}',
            },
            references: [],
          },
          priorityScore: 0,
          mustFixBefore: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        });
      }
    }
  }
  
  return debts;
}

function analyzeTodoComments(files: string[]): TechnicalDebt[] {
  const debts: TechnicalDebt[] = [];
  let debtId = 1;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = file.replace(process.cwd(), '');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME|XXX|HACK|BUG):\s*(.*)/i);
      if (todoMatch) {
        const [, type, message] = todoMatch;
        const severityMap: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
          BUG: 'CRITICAL',
          FIXME: 'HIGH',
          HACK: 'HIGH',
          XXX: 'MEDIUM',
          TODO: 'LOW',
        };
        
        debts.push({
          id: `DEBT-TODO-${String(debtId++).padStart(3, '0')}`,
          category: DebtCategory.DOCUMENTATION,
          severity: severityMap[type.toUpperCase()] || 'LOW',
          title: `${type.toUpperCase()}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          description: message,
          location: { file: relativePath, line: idx + 1 },
          impact: {
            maintainability: 4,
            performance: type === 'BUG' ? 6 : 2,
            security: type === 'BUG' ? 5 : 1,
            scalability: 2,
            testability: 3,
          },
          effort: {
            estimatedHours: type === 'BUG' ? 2 : 1,
            complexity: type === 'BUG' ? 'MODERATE' : 'SIMPLE',
            requiresDesign: false,
            breakingChange: false,
          },
          solution: {
            description: 'Address the TODO/FIXME comment and remove it',
            references: [],
          },
          priorityScore: 0,
          mustFixBefore: new Date(Date.now() + (type === 'BUG' ? 7 : 30) * 24 * 60 * 60 * 1000),
        });
      }
    });
  }
  
  return debts;
}

// ============================================
// MAIN
// ============================================

async function analyzeAllDebts(): Promise<TechnicalDebt[]> {
  console.log('🔍 Analyzing technical debt...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx']);
  
  console.log(`📂 Scanning ${files.length} files...\n`);
  
  // Run all analyzers
  const allDebts: TechnicalDebt[] = [
    ...analyzeTypeSafety(files),
    ...analyzeLargeFiles(files),
    ...analyzeConsoleLogs(files),
    ...analyzeSecurityIssues(files),
    ...analyzePerformanceIssues(files),
    ...analyzeMissingErrorHandling(files),
    ...analyzeTodoComments(files),
  ];
  
  // Calculate priority scores
  allDebts.forEach(debt => {
    debt.priorityScore = calculatePriority(debt);
  });
  
  // Sort by priority
  allDebts.sort((a, b) => b.priorityScore - a.priorityScore);
  
  return allDebts;
}

function generateStats(debts: TechnicalDebt[]): DebtStats {
  return {
    total: debts.length,
    bySeverity: {
      CRITICAL: debts.filter(d => d.severity === 'CRITICAL').length,
      HIGH: debts.filter(d => d.severity === 'HIGH').length,
      MEDIUM: debts.filter(d => d.severity === 'MEDIUM').length,
      LOW: debts.filter(d => d.severity === 'LOW').length,
    },
    byCategory: Object.values(DebtCategory).reduce((acc, cat) => {
      acc[cat] = debts.filter(d => d.category === cat).length;
      return acc;
    }, {} as Record<string, number>),
    totalEffort: debts.reduce((sum, d) => sum + d.effort.estimatedHours, 0),
  };
}

function generateMarkdownReport(stats: DebtStats, debts: TechnicalDebt[]): string {
  return `# 📋 Technical Debt Report - Nauti One v4.0

**Generated:** ${new Date().toISOString()}  
**Status:** ${stats.bySeverity.CRITICAL === 0 ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}

---

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Total Debt Items** | ${stats.total} |
| **Estimated Effort** | ${stats.totalEffort.toFixed(1)} hours (${(stats.totalEffort / 8).toFixed(1)} days) |
| **Critical Issues** | ${stats.bySeverity.CRITICAL} |
| **High Issues** | ${stats.bySeverity.HIGH} |

## 🚨 By Severity

\`\`\`
CRITICAL: ${'█'.repeat(Math.min(stats.bySeverity.CRITICAL, 20))} ${stats.bySeverity.CRITICAL}
HIGH:     ${'█'.repeat(Math.min(stats.bySeverity.HIGH, 20))} ${stats.bySeverity.HIGH}
MEDIUM:   ${'█'.repeat(Math.min(stats.bySeverity.MEDIUM, 20))} ${stats.bySeverity.MEDIUM}
LOW:      ${'█'.repeat(Math.min(stats.bySeverity.LOW, 20))} ${stats.bySeverity.LOW}
\`\`\`

## 📁 By Category

| Category | Count |
|----------|-------|
${Object.entries(stats.byCategory)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `| ${cat} | ${count} |`)
  .join('\n')}

---

## 🔥 Top 20 Priority Items

| # | ID | Severity | Title | Effort |
|---|-----|----------|-------|--------|
${debts.slice(0, 20).map((d, i) => 
  `| ${i + 1} | ${d.id} | ${d.severity} | ${d.title.substring(0, 40)}${d.title.length > 40 ? '...' : ''} | ${d.effort.estimatedHours}h |`
).join('\n')}

---

## 📝 Detailed Breakdown

${debts.slice(0, 50).map(d => `
### ${d.id}: ${d.title}

- **Severity:** ${d.severity}
- **Category:** ${d.category}
- **Location:** \`${d.location.file}${d.location.line ? `:${d.location.line}` : ''}\`
- **Effort:** ${d.effort.estimatedHours}h (${d.effort.complexity})
- **Priority Score:** ${d.priorityScore.toFixed(2)}

${d.description}

**Solution:** ${d.solution.description}

${d.solution.codeExample ? `
\`\`\`typescript
// Before
${d.solution.codeExample.before}

// After
${d.solution.codeExample.after}
\`\`\`
` : ''}
---
`).join('\n')}

*Report generated by Nauti One Technical Debt Analyzer*
`;
}

async function main() {
  const debts = await analyzeAllDebts();
  const stats = generateStats(debts);
  
  console.log(`
========================================
TECHNICAL DEBT ANALYSIS - NAUTI ONE v4.0
========================================

Total Debts: ${stats.total}
Total Effort: ${stats.totalEffort.toFixed(1)} hours (${(stats.totalEffort / 8).toFixed(1)} days)

By Severity:
  🔴 CRITICAL: ${stats.bySeverity.CRITICAL}
  🟠 HIGH: ${stats.bySeverity.HIGH}
  🟡 MEDIUM: ${stats.bySeverity.MEDIUM}
  🟢 LOW: ${stats.bySeverity.LOW}

By Category:
${Object.entries(stats.byCategory)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `  - ${cat}: ${count}`)
  .join('\n')}

========================================
`);
  
  // Save reports
  fs.writeFileSync('technical-debt-report.json', JSON.stringify({ stats, debts }, null, 2));
  fs.writeFileSync('TECHNICAL_DEBT.md', generateMarkdownReport(stats, debts));
  
  // Generate CSV for project management tools
  const csv = [
    'ID,Title,Severity,Category,Effort (hours),Priority Score,File,Line',
    ...debts.map(d => 
      `${d.id},"${d.title.replace(/"/g, '""')}",${d.severity},${d.category},${d.effort.estimatedHours},${d.priorityScore.toFixed(2)},"${d.location.file}",${d.location.line || ''}`
    )
  ].join('\n');
  fs.writeFileSync('technical-debt-backlog.csv', csv);
  
  console.log('✅ Reports generated:');
  console.log('  - technical-debt-report.json');
  console.log('  - TECHNICAL_DEBT.md');
  console.log('  - technical-debt-backlog.csv\n');
  
  // Exit with error if critical issues
  if (stats.bySeverity.CRITICAL > 0 && process.env.CI) {
    console.error(`❌ ${stats.bySeverity.CRITICAL} critical issues found!`);
    process.exit(1);
  }
}

main();
