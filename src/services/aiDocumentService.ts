// @ts-nocheck
// TODO v3.3: Alinhar campo confidence_score vs confidence
/**
 * PATCH 297: AI Document Service
 * Tesseract.js integration for OCR with entity extraction
 */

import { createWorker, Worker } from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface OCRExtractionResult {
  text: string;
  hocr: string;
  confidence: number;
  words: {
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }[];
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

  private async initializeWorker() {
    try {
      this.worker = await createWorker({
        logger: (m) => console.log(m), // Add console log for debugging
      });
      await this.worker.loadLanguage("por");
      await this.worker.initialize("por");
      await this.worker.setParameters({
        tessjs_create_hocr: "1",
        // tessjs_create_tsv: '1',
      });
      logger.info("Tesseract worker initialized");
    } catch (error) {
      logger.error("Error initializing Tesseract worker:", error);
    }
  }

  public async analyzeDocument(
    imageURL: string
  ): Promise<DocumentAIAnalysis | null> {
    if (!this.worker) {
      logger.error("Tesseract worker not initialized");
      return null;
    }

    try {
      const {
        data: { text, hocr, confidence, words },
      } = await this.worker.recognize(imageURL);

      const ocr_extraction_result: OCRExtractionResult = {
        text,
        hocr,
        confidence,
        words,
      };

      const entities = await this.extractEntities(text);

      return {
        ocr_extraction_result,
        entities,
      };
    } catch (error) {
      logger.error("Error analyzing document:", error);
      return null;
    }
  }

  private async extractEntities(text: string): Promise<Entity[]> {
    try {
      const response = await supabase.functions.invoke("extract-entities", {
        body: { text },
      });

      if (response.error) {
        throw response.error;
      }

      const entities: Entity[] = response.data;
      return entities;
    } catch (error) {
      logger.error("Error extracting entities:", error);
      return [];
    }
  }

  public async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      logger.info("Tesseract worker terminated");
    }
  }
}
