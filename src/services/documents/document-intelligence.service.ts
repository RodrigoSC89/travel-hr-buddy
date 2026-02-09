/**
 * Document Intelligence Service
 * Service layer for document management, version control, OCR, and classification
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type DocumentAction = "document_overview" | "version_history" | "expiring_documents" | "classification_stats" | "ai_analysis";

export interface DocumentOverview {
  totalDocuments: number;
  totalTemplates: number;
  totalGenerated: number;
  totalInsights: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  ocrCompleted: number;
  ocrPending: number;
  avgConfidence: number;
  recentDocuments: Record<string, unknown>[];
}

export interface VersionHistory {
  id: string;
  title: string;
  type: string;
  status: string;
  model: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export class DocumentIntelligenceService {
  async getDocumentOverview(): Promise<DocumentOverview> {
    try {
      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { action: "document_overview" },
      });
      if (error) throw error;
      return data.overview;
    } catch (error) {
      logger.error("Error fetching document overview", error as Error);
      throw error;
    }
  }

  async getVersionHistory(): Promise<{ versions: VersionHistory[]; stats: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { action: "version_history" },
      });
      if (error) throw error;
      return { versions: data.versions, stats: data.stats };
    } catch (error) {
      logger.error("Error fetching version history", error as Error);
      throw error;
    }
  }

  async getExpiringDocuments(): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { action: "expiring_documents" },
      });
      if (error) throw error;
      return data.expiring;
    } catch (error) {
      logger.error("Error fetching expiring documents", error as Error);
      throw error;
    }
  }

  async getClassificationStats(): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { action: "classification_stats" },
      });
      if (error) throw error;
      return data.classification;
    } catch (error) {
      logger.error("Error fetching classification stats", error as Error);
      throw error;
    }
  }

  async runAIAnalysis(): Promise<{ analysis: string; summary: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { action: "ai_analysis" },
      });
      if (error) throw error;
      return { analysis: data.analysis, summary: data.summary };
    } catch (error) {
      logger.error("Error running document AI analysis", error as Error);
      throw error;
    }
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();
