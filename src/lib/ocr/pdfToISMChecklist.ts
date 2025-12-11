/**
 * PDF to ISM Checklist - OCR Integration
 * PATCH-609: Extract ISM checklist from scanned PDFs
 */

import Tesseract from "tesseract.js";
import type { ISMAuditItem } from "../../types/ism-audit";

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from PDF using OCR (Tesseract.js)
 * Note: This converts PDF to images first, then runs OCR
 */
export async function extractTextFromPDF(file: File): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
    };
  } catch (error) {
    console.error("OCR Error:", error);
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Parse extracted text into ISM audit items
 * Uses simple regex patterns to identify checklist items
 */
export function parseTextToISMItems(text: string, defaultCategory: string = "General"): ISMAuditItem[] {
  const lines = text.split("\n").filter(l => l.trim().length > 5);
  const items: ISMAuditItem[] = [];
  
  let currentCategory = defaultCategory;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect category headers (usually in uppercase or followed by colon)
    if (trimmed.match(/^[A-Z\s]{10,}:?$/) || trimmed.match(/^\d+\.\s*[A-Z]/)) {
      currentCategory = trimmed.replace(/[:\d.]/g, "").trim();
      continue;
    }
    
    // Detect questions (usually start with verbs or contain question marks)
    if (
      trimmed.match(/^(Is|Are|Does|Do|Has|Have|Was|Were)\s/) ||
      trimmed.includes("?") ||
      trimmed.match(/^[\u2022\u2023\u25E6\u2043\u2219-]\s/)
    ) {
      // Check for compliance markers
      const hasCheckMark = trimmed.includes("✓") || trimmed.includes("☑") || trimmed.includes("[X]");
      const hasCrossMark = trimmed.includes("✗") || trimmed.includes("☒") || trimmed.includes("[ ]");
      
      // Clean up the question text
      const cleanQuestion = trimmed
        .replace(/[✓✗☑☒\[\]X]/g, "")
        .replace(/^[\u2022\u2023\u25E6\u2043\u2219-]\s*/, "")
        .trim();
      
      if (cleanQuestion.length > 10) {
        items.push({
          id: `item-${Date.now()}-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substr(2, 9)}`,
          question: cleanQuestion,
          category: currentCategory,
          compliant: hasCheckMark ? "compliant" : hasCrossMark ? "non-compliant" : "pending",
          notes: "",
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  
  return items;
}

/**
 * Main function to extract ISM checklist from PDF
 */
export async function extractISMChecklistFromPDF(file: File): Promise<ISMAuditItem[]> {
  try {
    
    // Extract text using OCR
    const ocrResult = await extractTextFromPDF(file);
    
    // Parse text into structured items
    const items = parseTextToISMItems(ocrResult.text);
    
    if (items.length === 0) {
      throw new Error("No checklist items found in PDF. Please verify the document format.");
    }
    
    return items;
  } catch (error) {
    console.error("Error extracting ISM checklist from PDF:", error);
    console.error("Error extracting ISM checklist from PDF:", error);
    throw error;
  }
}

/**
 * Validate extracted items for quality
 */
export function validateExtractedItems(items: ISMAuditItem[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (items.length === 0) {
    issues.push("No items extracted");
  }
  
  if (items.length < 5) {
    issues.push("Very few items extracted. Document may not be suitable for OCR.");
  }
  
  const questionsWithoutCategory = items.filter(i => !i.category || i.category === "General");
  if (questionsWithoutCategory.length > items.length * 0.5) {
    issues.push("Many items without proper category. Manual review recommended.");
  }
  
  const shortQuestions = items.filter(i => i.question.length < 15);
  if (shortQuestions.length > items.length * 0.3) {
    issues.push("Many questions are very short. OCR quality may be low.");
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
