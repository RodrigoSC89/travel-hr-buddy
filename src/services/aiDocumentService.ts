/**
 * PATCH 297: AI Document Service
 * Tesseract.js integration for OCR with entity extraction
 */

import { createLazyWorker } from "@/lib/ocr/lazy-tesseract";
import type { Worker } from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface OCRExtractionResult {
  text: string;
  hocr: string;
  confidence: number;
  words: OCRWord[];
}

interface Entity {
  text: string;
  type: string;
  confidence_score: number;
  relevance_score: number;
}

interface DocumentAIAnalysis {
  ocr_extraction_result: OCRExtractionResult | null;
  entities: Entity[] | null;
}

export class AiDocumentService {
  private worker: Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker(): Promise<void> {
    try {
      this.worker = await createLazyWorker("por");
      logger.info("Tesseract worker initialized");
    } catch (error) {
      logger.error("Error initializing Tesseract worker:", error as Error);
    }
  }

  public async analyzeDocument(imageURL: string): Promise<DocumentAIAnalysis | null> {
    if (!this.worker) {
      logger.error("Tesseract worker not initialized");
      return null;
    }

    try {
      const result = await this.worker.recognize(imageURL);
      const { text, hocr, confidence } = result.data;

      const ocr_extraction_result: OCRExtractionResult = {
        text,
        hocr: hocr || "",
        confidence,
        words: [],
      };

      const entities = await this.extractEntities(text);
      return { ocr_extraction_result, entities };
    } catch (error) {
      logger.error("Error analyzing document:", error as Error);
      return null;
    }
  }

  private async extractEntities(text: string): Promise<Entity[]> {
    try {
      const response = await supabase.functions.invoke("extract-entities", { body: { text } });
      if (response.error) throw response.error;

      const rawEntities = response.data as unknown[];
      if (!Array.isArray(rawEntities)) return [];

      return rawEntities.map((item) => {
        const entity = item as Record<string, unknown>;
        return {
          text: String(entity.text ?? ""),
          type: String(entity.type ?? "unknown"),
          confidence_score: Number(entity.confidence_score ?? 0),
          relevance_score: Number(entity.relevance_score ?? 0),
        };
      });
    } catch (error) {
      logger.error("Error extracting entities:", error as Error);
      return [];
    }
  }

  public async terminateWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      logger.info("Tesseract worker terminated");
    }
  }
}
