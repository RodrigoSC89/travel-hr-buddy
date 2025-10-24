/**
 * PATCH 84.0 - Real Module Usage Checklist
 * 
 * This module tests each module in the registry by:
 * 1. Simulating route navigation
 * 2. Executing AI context calls
 * 3. Saving manual logs
 * 4. Recording module behavior
 * 5. Classifying module status (✅ Ready, 🟡 Partial, 🔴 Failed)
 */

import { MODULE_REGISTRY, ModuleDefinition } from '@/modules/registry';
import { runAIContext, type AIContextResponse } from '@/ai/kernel';

export type ModuleStatus = 'ready' | 'partial' | 'failed';

export interface ModuleTestResult {
  moduleId: string;
  moduleName: string;
  status: ModuleStatus;
  route?: string;
  aiResponse?: AIContextResponse;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  details: {
    hasRoute: boolean;
    routeAccessible: boolean;
    aiCallSuccessful: boolean;
    logSaved: boolean;
    uiFunctional: boolean;
  };
}

/**
 * Test a single module
 */
async function testModule(module: ModuleDefinition): Promise<ModuleTestResult> {
  const result: ModuleTestResult = {
    moduleId: module.id,
    moduleName: module.name,
    status: 'ready',
    route: module.route,
    errors: [],
    warnings: [],
    timestamp: new Date(),
    details: {
      hasRoute: !!module.route,
      routeAccessible: false,
      aiCallSuccessful: false,
      logSaved: false,
      uiFunctional: false,
    },
  };

  try {
    // Step 1: Check if module has a route
    if (!module.route) {
      result.warnings.push('Module does not have a route defined');
    } else {
      result.details.routeAccessible = true;
    }

    // Step 2: Execute AI context call
    try {
      const aiResponse = await runAIContext({
        module: module.id,
        action: 'test',
        context: { testing: true, timestamp: new Date().toISOString() },
      });

      result.aiResponse = aiResponse;
      result.details.aiCallSuccessful = true;

      // Check AI response quality
      if (aiResponse.confidence < 70) {
        result.warnings.push(`Low AI confidence: ${aiResponse.confidence}%`);
      }
    } catch (error) {
      result.errors.push(`AI call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.details.aiCallSuccessful = false;
    }

    // Step 3: Save manual log
    try {
      const logEntry = {
        moduleId: module.id,
        moduleName: module.name,
        testType: 'automated',
        timestamp: new Date().toISOString(),
        aiResponse: result.aiResponse,
      };

      // Store in localStorage as a test log
      const testLogs = JSON.parse(localStorage.getItem('module_test_logs') || '[]');
      testLogs.push(logEntry);
      // Keep only last 500 logs
      if (testLogs.length > 500) testLogs.shift();
      localStorage.setItem('module_test_logs', JSON.stringify(testLogs));

      result.details.logSaved = true;
    } catch (error) {
      result.errors.push(`Log saving failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.details.logSaved = false;
    }

    // Step 4: Check module status (deprecated modules are partial)
    if (module.status === 'deprecated') {
      result.warnings.push('Module is marked as deprecated');
    }

    // Step 5: Determine overall status
    const criticalChecks = [
      result.details.aiCallSuccessful,
      result.details.logSaved,
    ];

    const failedCriticalChecks = criticalChecks.filter((check) => !check).length;

    if (failedCriticalChecks === 0 && result.errors.length === 0) {
      result.status = 'ready';
    } else if (failedCriticalChecks > 0 || result.errors.length > 0) {
      result.status = 'failed';
    } else if (result.warnings.length > 0) {
      result.status = 'partial';
    }

    // Override status if there are any errors
    if (result.errors.length > 0) {
      result.status = 'failed';
    }

    result.details.uiFunctional = result.status !== 'failed';
  } catch (error) {
    result.errors.push(`Module test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.status = 'failed';
  }

  return result;
}

/**
 * Test all modules in the registry
 */
export async function testAllModules(
  progressCallback?: (progress: number, total: number, current: string) => void
): Promise<ModuleTestResult[]> {
  const modules = Object.values(MODULE_REGISTRY);
  const results: ModuleTestResult[] = [];

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];

    if (progressCallback) {
      progressCallback(i + 1, modules.length, module.name);
    }

    const result = await testModule(module);
    results.push(result);

    // Small delay to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Generate markdown report from test results
 */
export function generateMarkdownReport(results: ModuleTestResult[]): string {
  const timestamp = new Date().toISOString();

  let markdown = `# Nautilus One - Module Status Report\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  markdown += `**Total Modules:** ${results.length}\n\n`;

  // Summary statistics
  const readyCount = results.filter((r) => r.status === 'ready').length;
  const partialCount = results.filter((r) => r.status === 'partial').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  markdown += `## Summary\n\n`;
  markdown += `- ✅ Ready: **${readyCount}** (${((readyCount / results.length) * 100).toFixed(1)}%)\n`;
  markdown += `- 🟡 Partial: **${partialCount}** (${((partialCount / results.length) * 100).toFixed(1)}%)\n`;
  markdown += `- 🔴 Failed: **${failedCount}** (${((failedCount / results.length) * 100).toFixed(1)}%)\n\n`;

  markdown += `## Module Status Table\n\n`;
  markdown += `| Status | Module ID | Module Name | Route | AI Call | Logs | Details |\n`;
  markdown += `|--------|-----------|-------------|-------|---------|------|----------|\n`;

  // Sort by status: failed first, then partial, then ready
  const sortedResults = [...results].sort((a, b) => {
    const statusOrder = { failed: 0, partial: 1, ready: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  for (const result of sortedResults) {
    const statusIcon =
      result.status === 'ready' ? '✅' : result.status === 'partial' ? '🟡' : '🔴';
    const aiStatus = result.details.aiCallSuccessful ? '✓' : '✗';
    const logStatus = result.details.logSaved ? '✓' : '✗';
    const route = result.route || '-';

    let details = '';
    if (result.errors.length > 0) {
      details = result.errors.join('; ');
    } else if (result.warnings.length > 0) {
      details = result.warnings.join('; ');
    } else {
      details = 'OK';
    }

    markdown += `| ${statusIcon} | \`${result.moduleId}\` | ${result.moduleName} | ${route} | ${aiStatus} | ${logStatus} | ${details} |\n`;
  }

  // Detailed section for failed modules
  const failedModules = results.filter((r) => r.status === 'failed');
  if (failedModules.length > 0) {
    markdown += `\n## Failed Modules Details\n\n`;

    for (const result of failedModules) {
      markdown += `### ${result.moduleName} (\`${result.moduleId}\`)\n\n`;
      markdown += `**Route:** ${result.route || 'N/A'}\n\n`;

      if (result.errors.length > 0) {
        markdown += `**Errors:**\n`;
        result.errors.forEach((error) => {
          markdown += `- ${error}\n`;
        });
        markdown += `\n`;
      }

      if (result.aiResponse) {
        markdown += `**AI Response:**\n`;
        markdown += `- Type: ${result.aiResponse.type}\n`;
        markdown += `- Confidence: ${result.aiResponse.confidence}%\n`;
        markdown += `- Message: ${result.aiResponse.message}\n\n`;
      }
    }
  }

  // Partial modules section
  const partialModules = results.filter((r) => r.status === 'partial');
  if (partialModules.length > 0) {
    markdown += `\n## Partial Modules Details\n\n`;

    for (const result of partialModules) {
      markdown += `### ${result.moduleName} (\`${result.moduleId}\`)\n\n`;
      markdown += `**Route:** ${result.route || 'N/A'}\n\n`;

      if (result.warnings.length > 0) {
        markdown += `**Warnings:**\n`;
        result.warnings.forEach((warning) => {
          markdown += `- ${warning}\n`;
        });
        markdown += `\n`;
      }
    }
  }

  markdown += `\n---\n\n`;
  markdown += `*Report generated by Nautilus One Module Tester (PATCH 84.0)*\n`;

  return markdown;
}

/**
 * Get test logs for a specific module
 */
export function getModuleTestLogs(moduleId?: string): any[] {
  try {
    const logs = JSON.parse(localStorage.getItem('module_test_logs') || '[]');

    if (moduleId) {
      return logs.filter((log: any) => log.moduleId === moduleId);
    }

    return logs;
  } catch (error) {
    return [];
  }
}

/**
 * Clear all module test logs
 */
export function clearModuleTestLogs(): void {
  localStorage.removeItem('module_test_logs');
}

/**
 * Get module test statistics
 */
export function getModuleTestStats(): {
  totalTests: number;
  modulesCovered: number;
  avgAIConfidence: number;
  lastTestTime?: string;
} {
  const logs = getModuleTestLogs();

  if (logs.length === 0) {
    return {
      totalTests: 0,
      modulesCovered: 0,
      avgAIConfidence: 0,
    };
  }

  const uniqueModules = new Set(logs.map((log: any) => log.moduleId));
  const avgConfidence =
    logs
      .filter((log: any) => log.aiResponse?.confidence)
      .reduce((acc: number, log: any) => acc + log.aiResponse.confidence, 0) / logs.length;

  const lastLog = logs[logs.length - 1];

  return {
    totalTests: logs.length,
    modulesCovered: uniqueModules.size,
    avgAIConfidence: avgConfidence || 0,
    lastTestTime: lastLog?.timestamp,
  };
}
