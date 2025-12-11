/**
 * Nautilus Intelligence Core - Fix Suggestion Module
 * 
 * Uses OpenAI LLM to generate intelligent fix suggestions based on detected issues
 */

import OpenAI from "openai";
import type { Finding, AnalysisResult } from "./analyzer";

export interface FixSuggestion {
  title: string;
  description: string;
  suggestedChanges: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedImpact: string;
}

/**
 * Generates fix suggestions using OpenAI GPT
 */
export async function suggestFix(analysis: AnalysisResult): Promise<FixSuggestion | null> {
  const { findings } = analysis;
  
  if (findings.length === 0) {
    return null;
  }

  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateFallbackSuggestion(findings);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = buildPrompt(findings, analysis);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o instead of GPT-5 (not yet available)
      messages: [
        {
          role: "system",
          content: "You are the chief engineer of Nautilus One, an expert in CI/CD, TypeScript, React, and automated testing. Your role is to analyze CI/CD failures and provide precise, actionable fix suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, focused responses
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return parseAIResponse(content, findings);
  } catch (error) {
    console.error("❌ Error calling OpenAI API:", error);
    console.error("❌ Error calling OpenAI API:", error);
    return generateFallbackSuggestion(findings);
  }
}

/**
 * Builds the prompt for the LLM
 */
function buildPrompt(findings: Finding[], analysis: AnalysisResult): string {
  const issuesList = findings.map((f, i) => 
    `${i + 1}. [${f.severity.toUpperCase()}] ${f.message}\n   Pattern: ${f.pattern}\n   Context: ${f.context || "N/A"}`
  ).join("\n\n");

  return `You are analyzing a CI/CD failure in the Nautilus One project.

**Workflow:** ${analysis.workflowName}
**Run ID:** ${analysis.workflowRun}

**Issues Detected:**
${issuesList}

**Your Task:**
1. Analyze the root cause of these issues
2. Provide a concise PR title (max 60 characters)
3. Write a clear PR description explaining the problem
4. Suggest specific code changes or configuration updates
5. Estimate the impact of implementing these fixes

**Response Format:**
PR_TITLE: [Your suggested PR title]
DESCRIPTION: [Explanation of what went wrong and why]
CHANGES: [Specific changes needed to fix the issues]
IMPACT: [Expected impact and benefits of the fix]
PRIORITY: [critical/high/medium/low]

Be specific, actionable, and concise.`;
}

/**
 * Parses the AI response into a structured suggestion
 */
function parseAIResponse(content: string, findings: Finding[]): FixSuggestion {
  const lines = content.split("\n");
  let title = "AI Auto-Fix Suggestion";
  let description = "";
  let suggestedChanges = "";
  let impact = "";
  let priority: "critical" | "high" | "medium" | "low" = "medium";

  lines.forEach(line => {
    if (line.startsWith("PR_TITLE:")) {
      title = line.replace("PR_TITLE:", "").trim();
    } else if (line.startsWith("DESCRIPTION:")) {
      description = line.replace("DESCRIPTION:", "").trim();
    } else if (line.startsWith("CHANGES:")) {
      suggestedChanges = line.replace("CHANGES:", "").trim();
    } else if (line.startsWith("IMPACT:")) {
      impact = line.replace("IMPACT:", "").trim();
    } else if (line.startsWith("PRIORITY:")) {
      const priorityStr = line.replace("PRIORITY:", "").trim().toLowerCase();
      if (["critical", "high", "medium", "low"].includes(priorityStr)) {
        priority = priorityStr as "critical" | "high" | "medium" | "low";
      }
    } else {
      // Accumulate multi-line content
      if (description && !suggestedChanges && !line.startsWith("CHANGES:")) {
        description += "\n" + line;
      } else if (suggestedChanges && !impact && !line.startsWith("IMPACT:")) {
        suggestedChanges += "\n" + line;
      } else if (impact && !line.startsWith("PRIORITY:")) {
        impact += "\n" + line;
      }
    }
  });

  // Determine priority from findings if not parsed
  if (findings.some(f => f.severity === "critical")) {
    priority = "critical";
  } else if (findings.some(f => f.severity === "high")) {
    priority = "high";
  }

  return {
    title: title.substring(0, 60), // Limit to 60 chars for PR title
    description: description.trim() || "Automated fix suggestion from Nautilus Intelligence Core",
    suggestedChanges: suggestedChanges.trim() || "See findings for details",
    priority,
    estimatedImpact: impact.trim() || "Should resolve detected CI/CD issues"
  };
}

/**
 * Generates a fallback suggestion when AI is not available
 */
function generateFallbackSuggestion(findings: Finding[]): FixSuggestion {
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const highCount = findings.filter(f => f.severity === "high").length;

  let title = "🤖 Auto-Fix: ";
  let description = "Nautilus Intelligence Core detected the following issues:\n\n";
  
  findings.forEach((f, i) => {
    description += `${i + 1}. **${f.message}**\n`;
    description += `   - Type: ${f.type}\n`;
    description += `   - Severity: ${f.severity}\n`;
    if (f.context) {
      description += `   - Context: \`\`\`\n${f.context.substring(0, 200)}...\n\`\`\`\n`;
    }
    description += "\n";
  });

  // Generate title based on primary issue
  const primaryIssue = findings[0];
  if (primaryIssue.type === "missing_file") {
    title += "Fix missing file/import paths";
  } else if (primaryIssue.type === "reference_error") {
    title += "Fix undefined references";
  } else if (primaryIssue.type === "build_failure") {
    title += "Fix build failures";
  } else if (primaryIssue.type === "low_coverage") {
    title += "Improve test coverage";
  } else if (primaryIssue.type === "low_contrast") {
    title += "Fix contrast issues";
  } else {
    title += `Fix ${findings.length} CI/CD issues`;
  }

  const suggestedChanges = `**Recommended Actions:**

${findings.map((f, i) => {
    switch (f.type) {
    case "missing_file":
      return `${i + 1}. Check and fix import paths, ensure all referenced files exist`;
    case "reference_error":
      return `${i + 1}. Add missing imports or declare undefined variables`;
    case "build_failure":
      return `${i + 1}. Fix TypeScript errors and ensure all dependencies are installed`;
    case "low_coverage":
      return `${i + 1}. Add unit tests to improve coverage to >= 85%`;
    case "low_contrast":
      return `${i + 1}. Update color values to meet WCAG contrast requirements`;
    case "test_failure":
      return `${i + 1}. Fix failing tests and update test expectations`;
    default:
      return `${i + 1}. Review and fix ${f.type} issues`;
    }
  }).join("\n")}`;

  const priority = criticalCount > 0 ? "critical" : highCount > 0 ? "high" : "medium";

  return {
    title,
    description,
    suggestedChanges,
    priority,
    estimatedImpact: `Resolves ${findings.length} issue(s): ${criticalCount} critical, ${highCount} high priority`
  };
}
