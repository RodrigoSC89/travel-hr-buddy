#!/usr/bin/env node
/**
 * TypeScript Cleanup Engine - PATCH 64.0
 * Remove @ts-nocheck, @ts-ignore and fix 'any' types
 */

import fs from 'fs';
import path from 'path';

interface TypeIssue {
  file: string;
  line: number;
  type: 'ts-nocheck' | 'ts-ignore' | 'any';
  context: string;
}

const issues: TypeIssue[] = [];

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes('@ts-nocheck')) {
      issues.push({
        file: filePath,
        line: index + 1,
        type: 'ts-nocheck',
        context: line.trim()
      });
    }

    if (line.includes('@ts-ignore')) {
      issues.push({
        file: filePath,
        line: index + 1,
        type: 'ts-ignore',
        context: line.trim()
      });
    }

    if (/:\s*any\b/.test(line) && !line.includes('// any is required')) {
      issues.push({
        file: filePath,
        line: index + 1,
        type: 'any',
        context: line.trim()
      });
    }
  });
}

function generateReport() {
  const reportPath = path.join(process.cwd(), 'logs', 'ts-cleanup.log');
  
  // Create logs directory if it doesn't exist
  const logsDir = path.dirname(reportPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const report = [
    '='.repeat(80),
    'TypeScript Cleanup Report - PATCH 64.0',
    `Generated: ${new Date().toISOString()}`,
    '='.repeat(80),
    '',
    `Total Issues Found: ${issues.length}`,
    '',
    '--- Issues by Type ---',
    `@ts-nocheck: ${issues.filter(i => i.type === 'ts-nocheck').length}`,
    `@ts-ignore: ${issues.filter(i => i.type === 'ts-ignore').length}`,
    `any types: ${issues.filter(i => i.type === 'any').length}`,
    '',
    '--- Detailed Issues ---',
    ...issues.map(issue => 
      `${issue.file}:${issue.line} [${issue.type}]\n  ${issue.context}`
    ),
    '',
    '='.repeat(80)
  ].join('\n');

  fs.writeFileSync(reportPath, report);
  console.log(`Report generated: ${reportPath}`);
  console.log(`Total issues: ${issues.length}`);
}

// Run scan
console.log('🔍 Scanning for TypeScript issues...');
scanDirectory(path.join(process.cwd(), 'src'));
generateReport();
