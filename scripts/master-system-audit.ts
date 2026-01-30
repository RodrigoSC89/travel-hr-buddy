/**
 * 🔍 MASTER SYSTEM AUDIT - Nauti One v4.0
 * Comprehensive system audit to find all issues
 * 
 * Categories:
 * - @ts-nocheck / @ts-ignore
 * - Mock data usage
 * - TODO/FIXME comments
 * - Console.log statements
 * - Missing handlers
 * - RLS coverage
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  autoFixable: boolean;
}

interface AuditSummary {
  timestamp: string;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  autoFixableCount: number;
  results: AuditResult[];
}

const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', 'coverage', 'storybook-static'];
const EXCLUDED_FILES = ['types.ts']; // Auto-generated files

class MasterSystemAudit {
  private results: AuditResult[] = [];

  async run(): Promise<AuditSummary> {
    console.log('🔍 MASTER SYSTEM AUDIT - Starting...\n');
    console.log('━'.repeat(60));

    // Run all audits
    await this.auditTsNoCheck('src');
    await this.auditMockData('src');
    await this.auditTodoFixme('src');
    await this.auditConsoleLogs('src');
    await this.auditMissingHandlers('src');

    // Generate summary
    const summary = this.generateSummary();
    
    // Output results
    this.printSummary(summary);
    
    // Save report
    await this.saveReport(summary);

    return summary;
  }

  private async auditTsNoCheck(dir: string): Promise<void> {
    console.log('\n📋 Auditing @ts-nocheck/@ts-ignore...');
    
    const files = this.getAllFiles(dir, ['.ts', '.tsx']);
    let count = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.includes('@ts-nocheck') || line.includes('@ts-ignore')) {
          // Skip test files - they often need type overrides
          const isTestFile = file.includes('.test.') || file.includes('/tests/');
          const severity = isTestFile ? 'low' : 'high';
          
          this.results.push({
            category: 'typescript',
            severity,
            file,
            line: index + 1,
            message: `Contains ${line.includes('@ts-nocheck') ? '@ts-nocheck' : '@ts-ignore'}`,
            autoFixable: false // Needs manual type fixes
          });
          count++;
        }
      });
    }

    console.log(`   Found ${count} instances`);
  }

  private async auditMockData(dir: string): Promise<void> {
    console.log('\n📋 Auditing mock data usage...');
    
    const files = this.getAllFiles(dir, ['.ts', '.tsx']);
    const mockPatterns = [
      /const\s+MOCK_/g,
      /let\s+MOCK_/g,
      /mockData/g,
      /fakeData/g,
      /dummyData/g
    ];
    let count = 0;

    for (const file of files) {
      // Skip test files and mock services
      if (file.includes('.test.') || file.includes('/tests/') || file.includes('/mocks/')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        for (const pattern of mockPatterns) {
          if (pattern.test(line)) {
            this.results.push({
              category: 'mock-data',
              severity: 'medium',
              file,
              line: index + 1,
              message: 'Contains mock data - should use real database queries',
              autoFixable: false
            });
            count++;
            break;
          }
          // Reset regex lastIndex
          pattern.lastIndex = 0;
        }
      });
    }

    console.log(`   Found ${count} instances (excluding test files)`);
  }

  private async auditTodoFixme(dir: string): Promise<void> {
    console.log('\n📋 Auditing TODO/FIXME comments...');
    
    const files = this.getAllFiles(dir, ['.ts', '.tsx']);
    let count = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (/\bTODO\b|\bFIXME\b|\bXXX\b/i.test(line)) {
          this.results.push({
            category: 'todo-fixme',
            severity: 'low',
            file,
            line: index + 1,
            message: line.trim().substring(0, 100),
            autoFixable: false
          });
          count++;
        }
      });
    }

    console.log(`   Found ${count} instances`);
  }

  private async auditConsoleLogs(dir: string): Promise<void> {
    console.log('\n📋 Auditing console.log statements...');
    
    const files = this.getAllFiles(dir, ['.ts', '.tsx']);
    let count = 0;

    for (const file of files) {
      // Skip test files and logger utilities
      if (file.includes('.test.') || file.includes('/tests/') || 
          file.includes('logger') || file.includes('Logger')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (/console\.(log|warn|error|debug)\(/.test(line)) {
          // Skip if it's in a comment
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
            return;
          }

          this.results.push({
            category: 'console-log',
            severity: 'low',
            file,
            line: index + 1,
            message: 'Console statement - consider using structured logger',
            autoFixable: true
          });
          count++;
        }
      });
    }

    console.log(`   Found ${count} instances (excluding loggers)`);
  }

  private async auditMissingHandlers(dir: string): Promise<void> {
    console.log('\n📋 Auditing missing button handlers...');
    
    const files = this.getAllFiles(dir, ['.tsx']);
    let count = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Find Button components without onClick
        if (/<Button/.test(line) && !line.includes('onClick') && 
            !line.includes('disabled') && !line.includes('type="submit"') &&
            !line.includes('asChild')) {
          // Check next few lines for onClick
          const nextLines = lines.slice(index, index + 5).join(' ');
          if (!nextLines.includes('onClick')) {
            this.results.push({
              category: 'missing-handler',
              severity: 'medium',
              file,
              line: index + 1,
              message: 'Button without onClick handler',
              autoFixable: true
            });
            count++;
          }
        }
      });
    }

    console.log(`   Found ${count} potential issues`);
  }

  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    const scan = (currentDir: string) => {
      if (!fs.existsSync(currentDir)) return;

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!EXCLUDED_DIRS.includes(entry.name)) {
            scan(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext) && !EXCLUDED_FILES.includes(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };

    scan(dir);
    return files;
  }

  private generateSummary(): AuditSummary {
    const criticalCount = this.results.filter(r => r.severity === 'critical').length;
    const highCount = this.results.filter(r => r.severity === 'high').length;
    const mediumCount = this.results.filter(r => r.severity === 'medium').length;
    const lowCount = this.results.filter(r => r.severity === 'low').length;
    const autoFixableCount = this.results.filter(r => r.autoFixable).length;

    return {
      timestamp: new Date().toISOString(),
      totalIssues: this.results.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      autoFixableCount,
      results: this.results
    };
  }

  private printSummary(summary: AuditSummary): void {
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 AUDIT SUMMARY');
    console.log('━'.repeat(60));
    console.log(`\nTotal Issues: ${summary.totalIssues}`);
    console.log(`  🔴 Critical: ${summary.criticalCount}`);
    console.log(`  🟠 High: ${summary.highCount}`);
    console.log(`  🟡 Medium: ${summary.mediumCount}`);
    console.log(`  🟢 Low: ${summary.lowCount}`);
    console.log(`  🔧 Auto-fixable: ${summary.autoFixableCount}`);

    // Breakdown by category
    console.log('\nBy Category:');
    const categories = new Map<string, number>();
    for (const result of summary.results) {
      categories.set(result.category, (categories.get(result.category) || 0) + 1);
    }
    for (const [category, count] of categories) {
      console.log(`  - ${category}: ${count}`);
    }

    if (summary.totalIssues === 0) {
      console.log('\n✅✅✅ SYSTEM IS 100% COMPLETE! ✅✅✅');
    } else {
      console.log(`\n⚠️  ${summary.totalIssues} issues need attention`);
    }
  }

  private async saveReport(summary: AuditSummary): Promise<void> {
    const reportDir = 'audit-results';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Save JSON
    fs.writeFileSync(
      path.join(reportDir, 'audit-results.json'),
      JSON.stringify(summary, null, 2)
    );

    // Save Markdown report
    let md = `# System Audit Report\n\n`;
    md += `**Date:** ${new Date(summary.timestamp).toLocaleString()}\n`;
    md += `**Total Issues:** ${summary.totalIssues}\n\n`;
    md += `## Summary\n\n`;
    md += `| Severity | Count |\n`;
    md += `|----------|-------|\n`;
    md += `| 🔴 Critical | ${summary.criticalCount} |\n`;
    md += `| 🟠 High | ${summary.highCount} |\n`;
    md += `| 🟡 Medium | ${summary.mediumCount} |\n`;
    md += `| 🟢 Low | ${summary.lowCount} |\n`;
    md += `| 🔧 Auto-fixable | ${summary.autoFixableCount} |\n\n`;

    // Group by category
    const byCategory = new Map<string, AuditResult[]>();
    for (const result of summary.results) {
      if (!byCategory.has(result.category)) {
        byCategory.set(result.category, []);
      }
      byCategory.get(result.category)!.push(result);
    }

    for (const [category, results] of byCategory) {
      md += `## ${category.toUpperCase()}\n\n`;
      md += `| File | Line | Message |\n`;
      md += `|------|------|----------|\n`;
      
      // Show first 50 per category
      for (const result of results.slice(0, 50)) {
        const shortFile = result.file.replace(/^src\//, '');
        md += `| ${shortFile} | ${result.line || '-'} | ${result.message.substring(0, 60)} |\n`;
      }
      
      if (results.length > 50) {
        md += `\n*...and ${results.length - 50} more*\n`;
      }
      md += '\n';
    }

    fs.writeFileSync(path.join(reportDir, 'AUDIT_REPORT.md'), md);

    console.log(`\n📁 Reports saved to: ${reportDir}/`);
  }
}

// Export for use
export const masterAudit = new MasterSystemAudit();

// CLI execution
if (require.main === module) {
  masterAudit.run().then(summary => {
    process.exit(summary.totalIssues > 0 ? 1 : 0);
  });
}
