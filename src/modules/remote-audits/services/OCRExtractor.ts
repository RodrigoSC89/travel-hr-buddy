/**
 * PATCH 606 - OCR Extractor Service
 * Extract text from images and PDFs using Tesseract.js
 */

import { logger } from "@/lib/logger";
import type { OCRResult } from "../types";

// Dynamically import Tesseract
let TesseractModule: any = null;

async function loadTesseract() {
  if (TesseractModule) return TesseractModule;
  
  if (typeof window !== "undefined") {
    try {
      TesseractModule = await import("tesseract.js");
    } catch (error) {
      logger.error("Tesseract.js not available:", error);
      throw new Error("Tesseract.js is required for OCR");
    }
  }
  
  return TesseractModule;
}

export class OCRExtractor {
  private static worker: any = null;

  /**
   * Initialize OCR worker
   */
  private static async initializeWorker(): Promise<any> {
    if (this.worker) return this.worker;

    try {
      const Tesseract = await loadTesseract();
      this.worker = await Tesseract.createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            logger.info(`[OCR] Progress: ${Math.floor(m.progress * 100)}%`);
          }
        },
      });
      
      logger.info("[OCR] Worker initialized");
      return this.worker;
    } catch (error) {
      logger.error("[OCR] Failed to initialize worker:", error);
      throw error;
    }
  }

  /**
   * Extract text from image file
   */
  static async extractTextFromImage(
    imageFile: File | Blob | string
  ): Promise<OCRResult> {
    logger.info("[OCR] Extracting text from image...");

    try {
      const worker = await this.initializeWorker();
      const { data } = await worker.recognize(imageFile);

      const result: OCRResult = {
        text: data.text,
        confidence: data.confidence,
        language: "eng",
        blocks: data.blocks.map((block: any) => ({
          text: block.text,
          confidence: block.confidence,
          boundingBox: block.bbox ? {
            x: block.bbox.x0,
            y: block.bbox.y0,
            width: block.bbox.x1 - block.bbox.x0,
            height: block.bbox.y1 - block.bbox.y0
          } : undefined
        }))
      };

      logger.info(`[OCR] Text extracted: ${result.text.length} characters, ${result.confidence}% confidence`);
      return result;
    } catch (error) {
      logger.error("[OCR] Extraction failed:", error);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   * Note: For PDFs, we first need to convert pages to images
   */
  static async extractTextFromPDF(pdfFile: File): Promise<OCRResult> {
    logger.info("[OCR] Extracting text from PDF...");

    try {
      // For a full implementation, you'd use pdf.js to render pages as images
      // then process each page with Tesseract
      // For now, we'll return a simplified implementation
      
      logger.warn("[OCR] PDF extraction requires pdf.js integration");
      
      return {
        text: "PDF extraction not fully implemented - requires pdf.js",
        confidence: 0,
        language: "eng",
        blocks: []
      };
    } catch (error) {
      logger.error("[OCR] PDF extraction failed:", error);
      throw error;
    }
  }

  /**
   * Extract text from multiple files (batch processing)
   */
  static async extractTextBatch(
    files: (File | Blob)[]
  ): Promise<OCRResult[]> {
    logger.info(`[OCR] Batch processing ${files.length} files...`);

    const results: OCRResult[] = [];

    for (const file of files) {
      try {
        const result = await this.extractTextFromImage(file);
        results.push(result);
      } catch (error) {
        logger.error("[OCR] Failed to process file:", error);
        results.push({
          text: "",
          confidence: 0,
          language: "eng",
          blocks: []
        });
      }
    }

    return results;
  }

  /**
   * Validate extracted text quality
   */
  static validateOCRQuality(result: OCRResult): {
    isValid: boolean;
    quality: "excellent" | "good" | "fair" | "poor";
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check confidence
    if (result.confidence < 50) {
      issues.push("Low confidence score");
    }

    // Check text length
    if (result.text.length < 10) {
      issues.push("Very short text extracted");
    }

    // Check for empty blocks
    const emptyBlocks = result.blocks.filter(b => !b.text.trim()).length;
    if (emptyBlocks > result.blocks.length / 2) {
      issues.push("Many empty text blocks");
    }

    // Determine quality
    let quality: "excellent" | "good" | "fair" | "poor";
    if (result.confidence >= 90 && issues.length === 0) {
      quality = "excellent";
    } else if (result.confidence >= 75 && issues.length <= 1) {
      quality = "good";
    } else if (result.confidence >= 50) {
      quality = "fair";
    } else {
      quality = "poor";
    }

    return {
      isValid: issues.length === 0,
      quality,
      issues
    };
  }

  /**
   * Clean up resources
   */
  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      logger.info("[OCR] Worker terminated");
    }
  }
}
