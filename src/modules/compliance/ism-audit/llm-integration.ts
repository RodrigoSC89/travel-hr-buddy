/**
 * ISM Audit Intelligence Module - LLM Integration
 * PATCH 633
 * Provides AI-powered contextual explanations for ISM audit items
 */

import { ISMChecklistItem, ISMLLMAnalysis, ISMSection, ISM_SECTIONS } from "./types";
import { Logger } from "@/lib/utils/logger";

interface LLMExplanationRequest {
  item: ISMChecklistItem;
  vessel_context?: {
    vessel_type: string;
    vessel_age: number;
    operation_area: string;
  };
}

interface LLMExplanationResponse {
  explanation: string;
  practical_examples: string[];
  common_pitfalls: string[];
  verification_tips: string[];
  related_requirements: string[];
}

/**
 * Get LLM explanation for a specific ISM checklist item
 */
export async function getLLMExplanation(
  request: LLMExplanationRequest
): Promise<{ success: boolean; data?: LLMExplanationResponse; error?: string }> {
  try {
    const { item, vessel_context } = request;

    Logger.ai("Requesting LLM explanation for ISM item", {
      item_id: item.id,
      section: item.section
    });

    // Build context-aware prompt
    const prompt = buildExplanationPrompt(item, vessel_context);

    // Call LLM API (using OpenAI or fallback)
    const response = await callLLMAPI(prompt);

    if (!response) {
      return {
        success: false,
        error: "LLM API unavailable"
      };
    }

    const explanation = parseLLMResponse(response, item);

    Logger.ai("LLM explanation generated successfully", {
      item_id: item.id
    });

    return {
      success: true,
      data: explanation
    };
  } catch (error) {
    Logger.error("Failed to get LLM explanation", error, "ism-audit-llm");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Generate comprehensive audit analysis using LLM
 */
export async function generateAuditAnalysis(
  auditId: string,
  checklist: ISMChecklistItem[],
  vesselContext?: any
): Promise<{ success: boolean; data?: ISMLLMAnalysis; error?: string }> {
  try {
    Logger.ai("Generating comprehensive ISM audit analysis", { auditId });

    // Group items by section
    const sectionData: Record<ISMSection, ISMChecklistItem[]> = {} as any;
    checklist.forEach(item => {
      if (!sectionData[item.section]) {
        sectionData[item.section] = [];
      }
      sectionData[item.section].push(item);
    });

    // Build comprehensive analysis prompt
    const prompt = buildAnalysisPrompt(sectionData, vesselContext);

    // Call LLM API
    const response = await callLLMAPI(prompt);

    if (!response) {
      return getFallbackAnalysis(checklist);
    }

    const analysis = parseAnalysisResponse(response, auditId);

    Logger.ai("Audit analysis generated successfully", { auditId });

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    Logger.error("Failed to generate audit analysis", error, "ism-audit-llm");
    return getFallbackAnalysis(checklist);
  }
}

/**
 * Build explanation prompt for LLM
 */
function buildExplanationPrompt(
  item: ISMChecklistItem,
  vessel_context?: any
): string {
  const sectionInfo = ISM_SECTIONS[item.section];
  
  let prompt = `You are an expert maritime auditor specializing in ISM Code compliance.

ISM Code Section: ${sectionInfo.title} (${sectionInfo.imo_ref})
Requirement ID: ${item.id}
Requirement: ${item.requirement}
Description: ${item.description}
IMO Reference: ${item.imo_reference}
`;

  if (vessel_context) {
    prompt += `\nVessel Context:
- Type: ${vessel_context.vessel_type}
- Age: ${vessel_context.vessel_age} years
- Operation Area: ${vessel_context.operation_area}
`;
  }

  prompt += `\nProvide a comprehensive explanation including:
1. What this requirement means in practical terms
2. Specific examples of compliance (2-3 examples)
3. Common pitfalls or mistakes to avoid
4. Tips for verification during audit
5. Related ISM Code requirements

Format your response as JSON with keys: explanation, practical_examples, common_pitfalls, verification_tips, related_requirements`;

  return prompt;
}

/**
 * Build analysis prompt for comprehensive audit
 */
function buildAnalysisPrompt(
  sectionData: Record<ISMSection, ISMChecklistItem[]>,
  vesselContext?: any
): string {
  let prompt = `You are an expert ISM Code auditor analyzing a complete ISM audit.

Audit Data by Section:
`;

  Object.entries(sectionData).forEach(([section, items]) => {
    const sectionInfo = ISM_SECTIONS[section as ISMSection];
    prompt += `\n${sectionInfo.title} (${sectionInfo.imo_ref}):
`;
    
    items.forEach(item => {
      prompt += `  - ${item.requirement}: ${item.compliance_status}\n`;
    });
  });

  if (vesselContext) {
    prompt += `\nVessel Context: ${JSON.stringify(vesselContext, null, 2)}`;
  }

  prompt += `\nProvide a comprehensive analysis including:
1. Overall assessment of ISM compliance
2. Section-by-section insights (one paragraph per section)
3. Critical gaps that need immediate attention
4. Strengths observed in the audit
5. Actionable recommendations for improvement
6. Overall risk level (low/medium/high/critical)

Format your response as JSON with keys: overall_assessment, section_insights (object with section keys), critical_gaps (array), strengths (array), recommendations (array), risk_level`;

  return prompt;
}

/**
 * Call LLM API (OpenAI compatible)
 */
async function callLLMAPI(prompt: string): Promise<string | null> {
  try {
    // Check if OpenAI API is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      Logger.warn("OpenAI API key not configured, using fallback");
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert maritime auditor specializing in ISM Code (International Safety Management Code) compliance. Provide detailed, practical, and actionable guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      Logger.error("LLM API request failed", { status: response.status }, "ism-audit-llm");
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    Logger.error("LLM API call failed", error, "ism-audit-llm");
    return null;
  }
}

/**
 * Parse LLM response for explanation
 */
function parseLLMResponse(
  response: string,
  item: ISMChecklistItem
): LLMExplanationResponse {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      explanation: parsed.explanation || "",
      practical_examples: parsed.practical_examples || [],
      common_pitfalls: parsed.common_pitfalls || [],
      verification_tips: parsed.verification_tips || [],
      related_requirements: parsed.related_requirements || []
    };
  } catch {
    // Fallback: parse as plain text
    return {
      explanation: response,
      practical_examples: [],
      common_pitfalls: [],
      verification_tips: [],
      related_requirements: []
    };
  }
}

/**
 * Parse LLM response for comprehensive analysis
 */
function parseAnalysisResponse(
  response: string,
  auditId: string
): ISMLLMAnalysis {
  try {
    const parsed = JSON.parse(response);
    
    return {
      audit_id: auditId,
      overall_assessment: parsed.overall_assessment || "",
      section_insights: parsed.section_insights || {},
      critical_gaps: parsed.critical_gaps || [],
      strengths: parsed.strengths || [],
      recommendations: parsed.recommendations || [],
      risk_level: parsed.risk_level || "medium",
      confidence_score: 0.85,
      generated_at: new Date().toISOString()
    };
  } catch {
    // Fallback parsing
    return {
      audit_id: auditId,
      overall_assessment: response,
      section_insights: {},
      critical_gaps: [],
      strengths: [],
      recommendations: [],
      risk_level: "medium",
      confidence_score: 0.5,
      generated_at: new Date().toISOString()
    };
  }
}

/**
 * Get fallback analysis when LLM is unavailable
 */
function getFallbackAnalysis(
  checklist: ISMChecklistItem[]
): { success: boolean; data: ISMLLMAnalysis } {
  const nonCompliant = checklist.filter(
    item => item.compliance_status === "non_conformity" || item.compliance_status === "major_non_conformity"
  );
  
  const observations = checklist.filter(
    item => item.compliance_status === "observation"
  );

  return {
    success: true,
    data: {
      audit_id: "fallback",
      overall_assessment: `ISM audit completed with ${nonCompliant.length} non-conformities and ${observations.length} observations. ${
        nonCompliant.length === 0 ? "Good overall compliance detected." : "Several areas require attention."
      }`,
      section_insights: {},
      critical_gaps: nonCompliant.map(item => `${item.requirement} - ${item.description}`),
      strengths: checklist
        .filter(item => item.compliance_status === "compliant")
        .slice(0, 3)
        .map(item => item.requirement),
      recommendations: [
        "Address non-conformities within 30 days",
        "Document corrective actions",
        "Schedule follow-up verification",
        "Update SMS documentation as needed"
      ],
      risk_level: nonCompliant.length > 5 ? "high" : nonCompliant.length > 0 ? "medium" : "low",
      confidence_score: 0.6,
      generated_at: new Date().toISOString()
    }
  };
}

/**
 * Get fallback explanation when LLM is unavailable
 */
export function getFallbackExplanation(item: ISMChecklistItem): LLMExplanationResponse {
  const sectionInfo = ISM_SECTIONS[item.section];
  
  return {
    explanation: `This requirement is part of ${sectionInfo.title} (${sectionInfo.imo_ref}). ${item.description}`,
    practical_examples: [
      "Review SMS documentation for this requirement",
      "Interview relevant personnel",
      "Verify implementation through observation"
    ],
    common_pitfalls: [
      "Incomplete documentation",
      "Lack of crew awareness",
      "Insufficient evidence of implementation"
    ],
    verification_tips: [
      "Check documentation date and signatures",
      "Verify crew understanding through interviews",
      "Observe actual implementation onboard"
    ],
    related_requirements: []
  };
}
