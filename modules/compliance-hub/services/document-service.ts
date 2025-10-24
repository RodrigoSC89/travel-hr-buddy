/**
 * Compliance Hub - Document Service
 * PATCH 92.0 - Document upload, storage, and AI analysis
 */

import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";
import { ComplianceDocument, DocumentAIAnalysis } from "../types";
import { validateFile } from "../utils/config";
import { analyzeDocumentWithAI } from "./ai-service";

/**
 * Upload compliance document to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  metadata: {
    title: string;
    type: ComplianceDocument["type"];
    category: ComplianceDocument["category"];
    vessel_id?: string;
    sector?: string;
    expiry_date?: string;
  },
  userId?: string
): Promise<{ success: boolean; data?: ComplianceDocument; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    Logger.info("Uploading compliance document", { 
      fileName: file.name, 
      fileSize: file.size,
      type: metadata.type 
    });

    // Generate unique file path
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${metadata.category}_${timestamp}.${fileExt}`;
    const filePath = `compliance/${metadata.category}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("compliance_documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      Logger.error("Document upload failed", uploadError, "compliance-hub");
      return { 
        success: false, 
        error: uploadError.message 
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("compliance_documents")
      .getPublicUrl(filePath);

    const document: ComplianceDocument = {
      id: crypto.randomUUID(),
      title: metadata.title,
      type: metadata.type,
      category: metadata.category,
      file_path: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_at: new Date().toISOString(),
      uploaded_by: userId,
      vessel_id: metadata.vessel_id,
      sector: metadata.sector,
      expiry_date: metadata.expiry_date,
      ai_analyzed: false,
      version: "1.0"
    };

    Logger.info("Document uploaded successfully", { 
      documentId: document.id,
      fileName: file.name 
    });

    return { 
      success: true, 
      data: document 
    };

  } catch (error) {
    Logger.error("Unexpected error during document upload", error, "compliance-hub");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Analyze document with AI after upload
 */
export async function analyzeDocument(
  documentId: string,
  documentText: string,
  category: string
): Promise<{ success: boolean; analysis?: DocumentAIAnalysis; error?: string }> {
  try {
    Logger.info("Analyzing document", { documentId, category });

    const analysis = await analyzeDocumentWithAI(documentText, category, documentId);

    if (!analysis) {
      return {
        success: false,
        error: "AI analysis failed or returned no results"
      };
    }

    // Save analysis results to database (in real implementation)
    // await saveDocumentAnalysis(analysis);

    Logger.info("Document analysis completed", { 
      documentId, 
      confidence: analysis.confidence 
    });

    return {
      success: true,
      analysis
    };

  } catch (error) {
    Logger.error("Document analysis error", error, "compliance-hub");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed"
    };
  }
}

/**
 * Delete compliance document
 */
export async function deleteDocument(
  documentId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    Logger.info("Deleting document", { documentId });

    // Extract storage path from URL
    const pathMatch = filePath.match(/compliance\/[^?]+/);
    const storagePath = pathMatch ? pathMatch[0] : filePath;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("compliance_documents")
      .remove([storagePath]);

    if (storageError) {
      Logger.error("Failed to delete document from storage", storageError, "compliance-hub");
      return {
        success: false,
        error: storageError.message
      };
    }

    // Delete from database (in real implementation)
    // await deleteDocumentRecord(documentId);

    Logger.info("Document deleted successfully", { documentId });
    return { success: true };

  } catch (error) {
    Logger.error("Unexpected error deleting document", error, "compliance-hub");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed"
    };
  }
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(
  category: string,
  vessel_id?: string
): Promise<ComplianceDocument[]> {
  try {
    Logger.info("Fetching documents", { category, vessel_id });

    // In real implementation, fetch from Supabase
    // For now, return mock data
    const mockDocuments: ComplianceDocument[] = [];

    return mockDocuments;

  } catch (error) {
    Logger.error("Failed to fetch documents", error, "compliance-hub");
    return [];
  }
}

/**
 * Get expiring documents (within 30 days)
 */
export async function getExpiringDocuments(): Promise<ComplianceDocument[]> {
  try {
    Logger.info("Fetching expiring documents");

    // In real implementation, query Supabase with date filter
    const mockDocuments: ComplianceDocument[] = [];

    return mockDocuments;

  } catch (error) {
    Logger.error("Failed to fetch expiring documents", error, "compliance-hub");
    return [];
  }
}

/**
 * Extract text from PDF (placeholder - would use actual PDF parser)
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // In real implementation, use pdf.js or similar
  // For now, return a placeholder
  return `[PDF content from ${file.name}]`;
}

/**
 * Handle file upload with validation and AI analysis
 */
export async function handleDocumentUpload(
  file: File,
  metadata: {
    title: string;
    type: ComplianceDocument["type"];
    category: ComplianceDocument["category"];
    vessel_id?: string;
    sector?: string;
    expiry_date?: string;
  },
  userId?: string,
  options?: {
    analyzeWithAI?: boolean;
  }
): Promise<{
  success: boolean;
  document?: ComplianceDocument;
  analysis?: DocumentAIAnalysis;
  error?: string;
}> {
  try {
    // Upload document
    const uploadResult = await uploadDocument(file, metadata, userId);
    
    if (!uploadResult.success || !uploadResult.data) {
      return {
        success: false,
        error: uploadResult.error
      };
    }

    const document = uploadResult.data;

    // Optionally analyze with AI
    if (options?.analyzeWithAI && file.type === "application/pdf") {
      const text = await extractTextFromPDF(file);
      const analysisResult = await analyzeDocument(
        document.id,
        text,
        metadata.category
      );

      if (analysisResult.success && analysisResult.analysis) {
        document.ai_analyzed = true;
        document.ai_summary = analysisResult.analysis.summary;
        document.ai_tags = analysisResult.analysis.related_regulations;
      }

      return {
        success: true,
        document,
        analysis: analysisResult.analysis
      };
    }

    return {
      success: true,
      document
    };

  } catch (error) {
    Logger.error("Document upload handler error", error, "compliance-hub");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    };
  }
}
