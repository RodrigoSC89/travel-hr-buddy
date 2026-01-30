/**
 * 📄 useDocumentsIntelligence Hook
 * AI-powered document processing, extraction, classification
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedData {
  documentType: string;
  dates: Array<{ type: string; date: string; description: string }>;
  monetaryValues: Array<{ amount: number; currency: string; purpose: string }>;
  entities: Array<{ type: string; name: string; role: string }>;
  referenceNumbers: Array<{ type: string; value: string }>;
  vessels: Array<{ name: string; imo: string; flag: string }>;
  obligations: Array<{ action: string; responsible: string; deadline: string }>;
  complianceItems: Array<{ regulation: string; requirement: string; status: string }>;
  keyPoints: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  language: string;
}

export interface Classification {
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
  retentionPeriod: number;
  accessLevel: string;
  suggestedFolder: string;
}

export interface ComplianceValidation {
  compliant: boolean;
  overallScore: number;
  regulations: Array<{
    name: string;
    applicable: boolean;
    compliant: boolean;
    findings: string[];
    recommendations: string[];
  }>;
  expirations: Array<{
    item: string;
    expiryDate: string;
    daysRemaining: number;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ProcessedDocument {
  documentId: string;
  extractedData: ExtractedData;
  classification: Classification;
  compliance: ComplianceValidation;
  summary: string;
  processed: boolean;
}

export function useProcessDocument() {
  return useMutation({
    mutationFn: async ({ documentId, ocrText }: { documentId: string; ocrText?: string }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "process-document", documentId, ocrText },
      });
      if (error) throw error;
      return data as ProcessedDocument;
    },
    onSuccess: (data) => {
      toast.success("📄 Documento processado com IA", {
        description: `Tipo: ${data.classification.category} | Confiança: ${data.classification.confidence}%`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao processar documento", { description: error.message });
    },
  });
}

export function useExtractData() {
  return useMutation({
    mutationFn: async ({ text, fileName }: { text: string; fileName?: string }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "extract-data", text, fileName },
      });
      if (error) throw error;
      return data as ExtractedData;
    },
    onSuccess: (data) => {
      toast.success("🔍 Dados extraídos", {
        description: `Tipo: ${data.documentType} | ${data.keyPoints.length} pontos-chave`,
      });
    },
  });
}

export function useClassifyDocument() {
  return useMutation({
    mutationFn: async ({ text, extractedData }: { text?: string; extractedData?: ExtractedData }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "classify", text, extractedData },
      });
      if (error) throw error;
      return data as Classification;
    },
    onSuccess: (data) => {
      toast.success("🏷️ Documento classificado", {
        description: `${data.category}/${data.subcategory}`,
      });
    },
  });
}

export function useValidateCompliance() {
  return useMutation({
    mutationFn: async ({ extractedData, classification }: { extractedData?: ExtractedData; classification?: Classification }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "validate-compliance", extractedData, classification },
      });
      if (error) throw error;
      return data as ComplianceValidation;
    },
    onSuccess: (data) => {
      if (data.compliant) {
        toast.success("✅ Documento em compliance", {
          description: `Score: ${data.overallScore}%`,
        });
      } else {
        toast.warning("⚠️ Problemas de compliance detectados", {
          description: `${data.violations.length} violações | ${data.warnings.length} alertas`,
        });
      }
    },
  });
}

export function useSearchDocuments() {
  return useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: any }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "search", query, filters },
      });
      if (error) throw error;
      return data as { results: any[]; total: number; query: string };
    },
  });
}

export function useFindRelatedDocuments() {
  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const { data, error } = await supabase.functions.invoke("documents-intelligence", {
        body: { action: "find-related", documentId },
      });
      if (error) throw error;
      return data as { related: any[]; basedOn: string };
    },
  });
}

// Query for document insights
export function useDocumentInsights(documentId: string) {
  return useQuery({
    queryKey: ["document-insights", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_document_insights")
        .select("*")
        .eq("document_id", documentId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!documentId,
  });
}
