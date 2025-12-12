#!/usr/bin/env node
// @ts-nocheck
/**
 * Nautilus Intelligence Core - Main Orchestrator
 * 
 * Coordinates the analysis of CI/CD failures and automated PR creation
 * This is the entry point for the Nautilus Intelligence Core system
 */

import * as fs from "fs";
import * as path from "path";
import { analyzeLogs, generateSummary, type AnalysisResult } from "./analyzer";
import { suggestFix } from "./suggestFix";
import { createAutoPR, commentOnPR } from "./createPR";
import { MemoryEngine } from "./memory/memoryEngine";
import { logger } from "@/lib/logger";

interface NautilusCoreConfig {
  workflowName: string;
  runId: number;
  logSources: string[];
  createPR: boolean;
  outputPath: string;
}

/**
 * Main execution function
 */
async function main() {
  logger.info("🌊 Nautilus Intelligence Core - Starting Analysis");

  try {
    // Get configuration from environment or defaults
    const config = getConfiguration();

    logger.info("📋 Configuration:", {
      workflow: config.workflowName,
      runId: config.runId,
      logSourcesCount: config.logSources.length,
      createPR: config.createPR
    });

    // Step 1: Collect and analyze logs
    logger.info("📖 Step 1: Analyzing logs...");
    const logs = await collectLogs(config.logSources);
    const analysis = analyzeLogs(logs, config.workflowName, config.runId);

    logger.info(`Found ${analysis.findings.length} issue(s)`);

    // Step 2: Save analysis results
    logger.info("💾 Step 2: Saving analysis results...");
    await saveAnalysis(analysis, config.outputPath);
    logger.info(`Saved to: ${config.outputPath}`);

    // Step 3: Generate summary
    const summary = generateSummary(analysis);
    logger.info("📊 Analysis Summary:", { summary });

    // Step 4: If issues found, generate fix suggestions
    if (analysis.hasIssues && config.createPR) {
      logger.info("🔧 Step 3: Generating fix suggestions...");
      const suggestion = await suggestFix(analysis);

      if (suggestion) {
        logger.info("Fix suggestion generated", {
          title: suggestion.title,
          priority: suggestion.priority
        });

        // Step 5: Create automated PR
        logger.info("🚀 Step 4: Creating automated PR...");
        const result = await createAutoPR(suggestion, analysis);

        if (result.success) {
          logger.info("✅ PR created successfully!", {
            prUrl: result.prUrl,
            prNumber: result.prNumber
          });

          // 🧠 Store learning in Nautilus Memory Engine
          logger.info("🧠 Storing learning in Memory Engine...");
          const memory = new MemoryEngine();
          const findingsArray = analysis.findings.map(f => f.message || String(f));
          memory.store(findingsArray, suggestion.title);
          
          // Check for recurrent patterns
          const patterns = memory.getRecurrentPatterns();
          if (patterns.length > 0) {
            logger.info("📊 Recurrent patterns detected:", {
              patterns: patterns.map(p => ({ pattern: p.pattern, occurrences: p.occurrences }))
            });
          } else {
            logger.info("🧩 No recurrent patterns found yet.");
          }
        } else {
          logger.error("❌ Failed to create PR", { error: result.error });
          process.exit(1);
        }
      } else {
        logger.info("ℹ️  No fix suggestions generated");
      }
    } else if (!analysis.hasIssues) {
      logger.info("✅ No issues detected - no action needed");
    } else {
      logger.info("ℹ️  PR creation disabled - analysis complete");
    }

    logger.info("🎉 Nautilus Intelligence Core - Analysis Complete");
    process.exit(0);
  } catch (error: any) {
    logger.error("❌ Fatal error", { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Gets configuration from environment variables or defaults
 */
function getConfiguration(): NautilusCoreConfig {
  const workflowName = process.env.GITHUB_WORKFLOW || "Unknown Workflow";
  const runId = parseInt(process.env.GITHUB_RUN_ID || "0", 10);
  const logSourcesEnv = process.env.LOG_SOURCES || "";
  const createPR = process.env.CREATE_PR !== "false"; // Default to true
  const outputPath = process.env.ANALYSIS_OUTPUT || "analysis.json";

  // Parse log sources from environment or use default
  let logSources: string[] = [];
  
  if (logSourcesEnv) {
    logSources = logSourcesEnv.split(",").map(s => s.trim());
  } else {
    // Default log sources
    logSources = [
      "ci-build.log",
      "test-output.log",
      "workflow.log"
    ];
  }

  return {
    workflowName,
    runId,
    logSources,
    createPR,
    outputPath
  };
}

/**
 * Collects logs from multiple sources
 */
async function collectLogs(sources: string[]): Promise<string> {
  let combinedLogs = "";

  for (const source of sources) {
    try {
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, "utf-8");
        combinedLogs += `\n=== Log Source: ${source} ===\n`;
        combinedLogs += content;
        combinedLogs += "\n";
        logger.debug(`✓ Loaded: ${source}`);
      } else {
        logger.debug(`⚠ Skipped: ${source} (not found)`);
      }
    } catch (error: any) {
      logger.warn(`Error reading ${source}`, { error: error.message });
    }
  }

  // If no logs were found, check if we're in a CI environment
  if (!combinedLogs) {
    logger.info("No log files found, checking GitHub Actions context...");
    combinedLogs = getCIContextLogs();
  }

  return combinedLogs;
}

/**
 * Gets logs from GitHub Actions context
 */
function getCIContextLogs(): string {
  let logs = "";

  // Collect environment variables that might contain useful info
  const relevantEnvVars = [
    "GITHUB_WORKFLOW",
    "GITHUB_RUN_ID",
    "GITHUB_RUN_NUMBER",
    "GITHUB_JOB",
    "GITHUB_ACTION",
    "GITHUB_ACTOR",
    "GITHUB_EVENT_NAME",
    "GITHUB_REF",
    "GITHUB_SHA"
  ];

  logs += "=== GitHub Actions Context ===\n";
  relevantEnvVars.forEach(key => {
    if (process.env[key]) {
      logs += `${key}: ${process.env[key]}\n`;
    }
  });

  return logs;
}

/**
 * Saves analysis results to a JSON file
 */
async function saveAnalysis(analysis: AnalysisResult, outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir) && dir !== ".") {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(analysis, null, 2);
  fs.writeFileSync(outputPath, json, "utf-8");
}

/**
 * Run in demo mode with sample logs for testing
 */
async function runDemo() {
  logger.info("🎭 Running Nautilus Intelligence Core in DEMO mode");

  const sampleLogs = `
=== Build Log ===
npm run build
Building project...
error TS2304: Cannot find name 'invalidVariable'.
    at src/components/Button.tsx:15:3
Build failed with 1 error.

=== Test Log ===
Running tests...
FAIL src/tests/contrast.test.ts
  ✕ should meet contrast requirements (523 ms)
    Expected contrast ratio: 4.5:1
    Actual contrast ratio below 3.2:1

Coverage report:
  Statements   : 78% ( 450/576 )
  Branches     : 72% ( 120/166 )
  Functions    : 81% ( 98/121 )
  Lines        : 78% ( 445/570 )
coverage < 85% threshold

=== Accessibility Log ===
⚠️ WCAG Violation: suspended button detected in DOM
  Element: <button disabled>Submit</button>
  Location: src/pages/Forms.tsx:42
`;

  // Write sample logs to temp file
  fs.writeFileSync("demo-logs.txt", sampleLogs, "utf-8");

  const analysis = analyzeLogs(sampleLogs, "Demo Workflow", 12345);
  const summary = generateSummary(analysis);
  
  logger.info("Demo analysis summary", { summary });
  logger.info("📊 Analysis JSON:", { analysis });

  // Save to file
  await saveAnalysis(analysis, "demo-analysis.json");
  logger.info("💾 Saved to demo-analysis.json");

  // Generate suggestion (will use fallback without API key)
  logger.info("🔧 Generating fix suggestions...");
  const suggestion = await suggestFix(analysis);
  
  if (suggestion) {
    logger.info("📝 Fix Suggestion:", {
      title: suggestion.title,
      priority: suggestion.priority,
      description: suggestion.description,
      suggestedChanges: suggestion.suggestedChanges
    });
  }

  // Clean up
  fs.unlinkSync("demo-logs.txt");
}

// Check if running in demo mode
if (process.argv.includes("--demo")) {
  runDemo().catch((error) => logger.error("Demo failed", { error }));
} else {
  main().catch((error) => logger.error("Main execution failed", { error }));
}
