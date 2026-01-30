#!/usr/bin/env npx ts-node
/**
 * Sprint Planning for Technical Debt Elimination
 * Plans debt elimination across sprints based on team capacity
 * 
 * Usage: npx ts-node scripts/plan-debt-sprints.ts
 */

import * as fs from 'fs';

interface DebtItem {
  id: string;
  title: string;
  severity: string;
  category: string;
  effort: { estimatedHours: number };
  priorityScore: number;
}

interface Sprint {
  number: number;
  startDate: string;
  endDate: string;
  items: DebtItem[];
  totalEffort: number;
  focusAreas: string[];
  goals: string[];
}

function loadDebtReport(): { stats: any; debts: DebtItem[] } | null {
  const reportPath = 'technical-debt-report.json';
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ No debt report found. Run analyze-technical-debt.ts first.');
    return null;
  }
  
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

function planSprints(
  debts: DebtItem[],
  teamCapacity: number = 40, // hours per sprint
  sprintDays: number = 10    // business days
): Sprint[] {
  const sprints: Sprint[] = [];
  let currentSprint: Sprint | null = null;
  let sprintNumber = 1;
  
  // Sort by severity and priority
  const severityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  
  const sortedDebts = [...debts].sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.priorityScore - a.priorityScore;
  });
  
  for (const debt of sortedDebts) {
    const effort = debt.effort.estimatedHours;
    
    // Skip items that exceed sprint capacity
    if (effort > teamCapacity) {
      console.warn(`⚠️  Skipping ${debt.id}: effort (${effort}h) exceeds sprint capacity`);
      continue;
    }
    
    if (!currentSprint || currentSprint.totalEffort + effort > teamCapacity) {
      // Save current sprint
      if (currentSprint) {
        sprints.push(currentSprint);
        sprintNumber++;
      }
      
      // Calculate dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (sprintNumber - 1) * sprintDays);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + sprintDays);
      
      currentSprint = {
        number: sprintNumber,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        items: [],
        totalEffort: 0,
        focusAreas: [],
        goals: [],
      };
    }
    
    currentSprint.items.push(debt);
    currentSprint.totalEffort += effort;
    
    // Track categories
    if (!currentSprint.focusAreas.includes(debt.category)) {
      currentSprint.focusAreas.push(debt.category);
    }
  }
  
  // Don't forget the last sprint
  if (currentSprint && currentSprint.items.length > 0) {
    sprints.push(currentSprint);
  }
  
  // Generate goals for each sprint
  sprints.forEach(sprint => {
    const criticalCount = sprint.items.filter(i => i.severity === 'CRITICAL').length;
    const highCount = sprint.items.filter(i => i.severity === 'HIGH').length;
    
    sprint.goals = [];
    
    if (criticalCount > 0) {
      sprint.goals.push(`🔴 Eliminate ${criticalCount} critical issues`);
    }
    if (highCount > 0) {
      sprint.goals.push(`🟠 Fix ${highCount} high-priority items`);
    }
    sprint.goals.push(`📊 Reduce debt by ${sprint.totalEffort.toFixed(1)} hours`);
    sprint.goals.push(`🎯 Focus: ${sprint.focusAreas.slice(0, 2).join(', ')}`);
  });
  
  return sprints;
}

function generateSprintPlan(sprints: Sprint[]): string {
  const totalItems = sprints.reduce((sum, s) => sum + s.items.length, 0);
  const totalEffort = sprints.reduce((sum, s) => sum + s.totalEffort, 0);
  
  return `# 📅 Technical Debt Sprint Plan

**Generated:** ${new Date().toISOString()}  
**Total Sprints:** ${sprints.length}  
**Total Items:** ${totalItems}  
**Total Effort:** ${totalEffort.toFixed(1)} hours (${(totalEffort / 8).toFixed(1)} days)

---

## 📊 Overview

\`\`\`
${sprints.map(s => 
  `Sprint ${s.number}: ${'█'.repeat(Math.round(s.totalEffort / 4))} ${s.totalEffort.toFixed(0)}h (${s.items.length} items)`
).join('\n')}
\`\`\`

---

${sprints.map(sprint => `
## Sprint ${sprint.number}

**Period:** ${sprint.startDate} → ${sprint.endDate}  
**Capacity:** ${sprint.totalEffort.toFixed(1)} / 40 hours  
**Items:** ${sprint.items.length}

### Goals
${sprint.goals.map(g => `- ${g}`).join('\n')}

### Items

| ID | Severity | Title | Effort |
|----|----------|-------|--------|
${sprint.items.map(item => 
  `| ${item.id} | ${item.severity} | ${item.title.substring(0, 40)}${item.title.length > 40 ? '...' : ''} | ${item.effort.estimatedHours}h |`
).join('\n')}

---
`).join('\n')}

## 🎯 Success Criteria

After completing all sprints:

- [ ] Zero CRITICAL issues
- [ ] Zero HIGH issues  
- [ ] Type safety: 100% strict mode
- [ ] Test coverage: >80%
- [ ] Security scan: clean
- [ ] Performance: Lighthouse >90

---

*Plan generated by Nauti One Sprint Planner*
`;
}

function main() {
  console.log('\n📅 Sprint Planning - Technical Debt Elimination\n');
  
  const report = loadDebtReport();
  if (!report) return;
  
  const { stats, debts } = report;
  
  console.log(`📊 Loaded ${debts.length} debt items`);
  console.log(`⏱️  Total effort: ${stats.totalEffort.toFixed(1)} hours\n`);
  
  // Plan sprints with default 40h capacity
  const sprints = planSprints(debts, 40, 10);
  
  console.log(`
========================================
SPRINT PLAN - DEBT ELIMINATION
========================================

Total Sprints: ${sprints.length}
Duration: ${sprints.length * 2} weeks

${sprints.map(s => `
Sprint ${s.number} (${s.startDate} - ${s.endDate}):
  - Items: ${s.items.length}
  - Effort: ${s.totalEffort.toFixed(0)}h / 40h
  - Focus: ${s.focusAreas.slice(0, 2).join(', ')}
  - Goals:
${s.goals.map(g => `      ${g}`).join('\n')}`).join('\n')}

========================================
`);
  
  // Save plan
  fs.writeFileSync('debt-sprint-plan.json', JSON.stringify(sprints, null, 2));
  fs.writeFileSync('SPRINT_PLAN.md', generateSprintPlan(sprints));
  
  console.log('✅ Sprint plan generated:');
  console.log('  - debt-sprint-plan.json');
  console.log('  - SPRINT_PLAN.md\n');
}

main();
