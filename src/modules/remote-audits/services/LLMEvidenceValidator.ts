/**
 * PATCH 606 - LLM Evidence Validator
 * AI-powered validation of checklist evidence
 */

import { logger } from "@/lib/logger";
import { runAIContext } from "@/ai/kernel";
import type { 
  AIChecklistValidation, 
  AIEvidenceAnalysis, 
  ChecklistResponse,
  RemoteAuditChecklistItem,
  RemoteAuditEvidence
} from "../types";

export class LLMEvidenceValidator {
  /**
   * Validate checklist evidence using AI
   */
  static async validateChecklistEvidence(
    checklistItem: RemoteAuditChecklistItem,
    evidence: RemoteAuditEvidence[],
    ocrText?: string
  ): Promise<AIChecklistValidation> {
    logger.info(`[LLM Evidence Validator] Validating evidence for item ${checklistItem.id}...`);

    try {
      const context = this.buildValidationContext(checklistItem, evidence, ocrText);
      
      const aiResponse = await runAIContext({
        module: "remote-audits",
        action: "validate_evidence",
        context: {
          prompt: this.buildValidationPrompt(context),
          checklistItemId: checklistItem.id,
          evidenceCount: evidence.length
        }
      });

      return this.parseValidationResponse(aiResponse);
    } catch (error) {
      logger.error("[LLM Evidence Validator] Validation failed:", error);
      return this.fallbackValidation(checklistItem, evidence);
    }
  }

  /**
   * Analyze evidence document using AI
   */
  static async analyzeEvidence(
    evidence: RemoteAuditEvidence,
    ocrText: string
  ): Promise<AIEvidenceAnalysis> {
    logger.info(`[LLM Evidence Validator] Analyzing evidence ${evidence.id}...`);

    try {
      const context = {
        fileName: evidence.fileName,
        fileType: evidence.fileType,
        ocrText,
        ocrLength: ocrText.length
      };

      const aiResponse = await runAIContext({
        module: "remote-audits",
        action: "analyze_evidence",
        context: {
          prompt: this.buildAnalysisPrompt(context),
          evidenceId: evidence.id
        }
      });

      return this.parseAnalysisResponse(aiResponse, ocrText);
    } catch (error) {
      logger.error("[LLM Evidence Validator] Analysis failed:", error);
      return this.fallbackAnalysis(evidence, ocrText);
    }
  }

  /**
   * Batch validate multiple checklist items
   */
  static async batchValidate(
    items: Array<{
      checklistItem: RemoteAuditChecklistItem;
      evidence: RemoteAuditEvidence[];
      ocrText?: string;
    }>
  ): Promise<AIChecklistValidation[]> {
    logger.info(`[LLM Evidence Validator] Batch validating ${items.length} items...`);

    const results = await Promise.all(
      items.map(item =>
        this.validateChecklistEvidence(item.checklistItem, item.evidence, item.ocrText)
      )
    );

    return results;
  }

  /**
   * Build validation context
   */
  private static buildValidationContext(
    checklistItem: RemoteAuditChecklistItem,
    evidence: RemoteAuditEvidence[],
    ocrText?: string
  ) {
    return {
      question: checklistItem.question,
      section: checklistItem.section,
      response: checklistItem.response,
      notes: checklistItem.notes,
      evidenceRequired: checklistItem.evidenceRequired,
      evidenceCount: evidence.length,
      evidenceTypes: evidence.map(e => e.fileType),
      hasOCRText: !!ocrText,
      ocrText: ocrText?.substring(0, 1000) // Limit text length for prompt
    };
  }

  /**
   * Build validation prompt for AI
   */
  private static buildValidationPrompt(context: any): string {
    return `
You are an expert maritime compliance auditor. Validate the following audit checklist item and its evidence:

**Question:** ${context.question}
**Section:** ${context.section}
**Response:** ${context.response || "Not answered"}
**Notes:** ${context.notes || "None"}

**Evidence:**
- Evidence Required: ${context.evidenceRequired ? "Yes" : "No"}
- Evidence Provided: ${context.evidenceCount} file(s)
- Evidence Types: ${context.evidenceTypes.join(", ")}

${context.hasOCRText ? `**Extracted Text (OCR):**
${context.ocrText}` : ""}

Based on this information, provide:
1. **Is Compliant** - Does the response match the evidence?
2. **Confidence** - Your confidence level (0-100%)
3. **Reasoning** - Brief explanation of your assessment
4. **Suggested Response** - If response is unclear, suggest: yes/no/n/a/partial
5. **Evidence Quality** - Rate the evidence: excellent/good/fair/poor
6. **Flags** - Any concerns or issues to review

Respond in JSON format:
{
  "isCompliant": boolean,
  "confidence": number,
  "reasoning": "string",
  "suggestedResponse": "yes" | "no" | "n/a" | "partial",
  "evidenceQuality": "excellent" | "good" | "fair" | "poor",
  "flags": ["string"]
}
`;
  }

  /**
   * Build analysis prompt for evidence
   */
  private static buildAnalysisPrompt(context: any): string {
    return `
Analyze the following audit evidence document:

**File Name:** ${context.fileName}
**File Type:** ${context.fileType}
**Extracted Text Length:** ${context.ocrLength} characters

**Content:**
${context.ocrText}

Provide detailed analysis:
1. **Document Type** - What type of document is this?
2. **Confidence** - Your confidence in the analysis (0-100%)
3. **Extracted Data** - Key data points found in the document
4. **Compliance Checks** - List of compliance items and whether they pass
5. **Quality** - Overall document quality: excellent/good/fair/poor
6. **Recommendations** - Suggestions for the auditor

Respond in JSON format:
{
  "documentType": "string",
  "confidence": number,
  "extractedData": {},
  "complianceChecks": [
    {
      "item": "string",
      "passed": boolean,
      "details": "string"
    }
  ],
  "quality": "excellent" | "good" | "fair" | "poor",
  "recommendations": ["string"]
}
`;
  }

  /**
   * Parse validation response
   */
  private static parseValidationResponse(aiResponse: any): AIChecklistValidation {
    try {
      const data = aiResponse?.validation || aiResponse || {};
      return {
        isCompliant: data.isCompliant ?? false,
        confidence: (data.confidence ?? 50) / 100,
        reasoning: data.reasoning || "AI validation completed",
        suggestedResponse: data.suggestedResponse,
        evidenceQuality: data.evidenceQuality || "fair",
        flags: data.flags || []
      };
    } catch (error) {
      logger.error("[LLM Evidence Validator] Failed to parse validation response:", error);
      throw error;
    }
  }

  /**
   * Parse analysis response
   */
  private static parseAnalysisResponse(aiResponse: any, ocrText: string): AIEvidenceAnalysis {
    try {
      const data = aiResponse?.analysis || aiResponse || {};
      return {
        documentType: data.documentType || "Unknown",
        confidence: (data.confidence ?? 50) / 100,
        extractedData: data.extractedData || {},
        complianceChecks: data.complianceChecks || [],
        quality: data.quality || "fair",
        recommendations: data.recommendations || []
      };
    } catch (error) {
      logger.error("[LLM Evidence Validator] Failed to parse analysis response:", error);
      throw error;
    }
  }

  /**
   * Fallback validation using rules
   */
  private static fallbackValidation(
    checklistItem: RemoteAuditChecklistItem,
    evidence: RemoteAuditEvidence[]
  ): AIChecklistValidation {
    logger.info("[LLM Evidence Validator] Using fallback validation...");

    const hasEvidence = evidence.length > 0;
    const evidenceRequired = checklistItem.evidenceRequired;
    
    // Simple rule-based validation
    let isCompliant = true;
    const flags: string[] = [];

    if (evidenceRequired && !hasEvidence) {
      isCompliant = false;
      flags.push("Evidence required but not provided");
    }

    if (!checklistItem.response) {
      isCompliant = false;
      flags.push("Question not answered");
    }

    return {
      isCompliant,
      confidence: 0.6,
      reasoning: "Rule-based validation (AI unavailable)",
      suggestedResponse: checklistItem.response,
      evidenceQuality: hasEvidence ? "fair" : "poor",
      flags
    };
  }

  /**
   * Fallback analysis
   */
  private static fallbackAnalysis(
    evidence: RemoteAuditEvidence,
    ocrText: string
  ): AIEvidenceAnalysis {
    logger.info("[LLM Evidence Validator] Using fallback analysis...");

    return {
      documentType: evidence.fileType,
      confidence: 0.5,
      extractedData: {
        textLength: ocrText.length,
        fileName: evidence.fileName
      },
      complianceChecks: [],
      quality: ocrText.length > 100 ? "fair" : "poor",
      recommendations: [
        "Manual review recommended",
        "AI analysis unavailable"
      ]
    };
  }
}
