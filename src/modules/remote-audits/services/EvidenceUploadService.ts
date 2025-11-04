// @ts-nocheck
/**
 * PATCH 606 - Evidence Upload Service
 * Handle file uploads to Supabase storage for audit evidence
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { RemoteAuditEvidence } from "../types";

export class EvidenceUploadService {
  private static readonly BUCKET_NAME = "audit-evidence";
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/webm"
  ];

  /**
   * Upload evidence file to Supabase storage
   */
  static async uploadEvidence(
    file: File,
    auditId: string,
    checklistItemId?: string
  ): Promise<RemoteAuditEvidence> {
    logger.info(`[Evidence Upload] Uploading ${file.name} for audit ${auditId}...`);

    try {
      // Validate file
      this.validateFile(file);

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${auditId}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      logger.info(`[Evidence Upload] File uploaded to ${storagePath}`);

      // Create evidence record in database
      const evidenceRecord = {
        audit_id: auditId,
        checklist_item_id: checklistItemId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        uploaded_at: new Date().toISOString(),
        ocr_processed: false,
        verification_status: "pending"
      };

      const { data: dbData, error: dbError } = await supabase
        .from("remote_audit_evidence")
        .insert(evidenceRecord)
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.deleteFile(storagePath);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      logger.info(`[Evidence Upload] Evidence record created: ${dbData.id}`);

      return this.mapFromDB(dbData);
    } catch (error) {
      logger.error("[Evidence Upload] Upload failed:", error);
      throw error;
    }
  }

  /**
   * Upload multiple evidence files
   */
  static async uploadMultipleEvidence(
    files: File[],
    auditId: string,
    checklistItemId?: string
  ): Promise<RemoteAuditEvidence[]> {
    logger.info(`[Evidence Upload] Batch uploading ${files.length} files...`);

    const results: RemoteAuditEvidence[] = [];
    const errors: Error[] = [];

    for (const file of files) {
      try {
        const evidence = await this.uploadEvidence(file, auditId, checklistItemId);
        results.push(evidence);
      } catch (error) {
        logger.error(`[Evidence Upload] Failed to upload ${file.name}:`, error);
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    if (errors.length > 0) {
      logger.warn(`[Evidence Upload] ${errors.length} of ${files.length} uploads failed`);
    }

    return results;
  }

  /**
   * Get evidence file URL
   */
  static async getEvidenceURL(storagePath: string): Promise<string> {
    try {
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (!data?.signedUrl) {
        throw new Error("Failed to generate signed URL");
      }

      return data.signedUrl;
    } catch (error) {
      logger.error("[Evidence Upload] Failed to get URL:", error);
      throw error;
    }
  }

  /**
   * Download evidence file
   */
  static async downloadEvidence(storagePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(storagePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data received");
      }

      return data;
    } catch (error) {
      logger.error("[Evidence Upload] Download failed:", error);
      throw error;
    }
  }

  /**
   * Delete evidence file
   */
  static async deleteEvidence(evidenceId: string): Promise<void> {
    logger.info(`[Evidence Upload] Deleting evidence ${evidenceId}...`);

    try {
      // Get evidence record
      const { data: evidence, error: fetchError } = await supabase
        .from("remote_audit_evidence")
        .select("storage_path")
        .eq("id", evidenceId)
        .single();

      if (fetchError || !evidence) {
        throw new Error("Evidence not found");
      }

      // Delete from storage
      await this.deleteFile(evidence.storage_path);

      // Delete database record
      const { error: deleteError } = await supabase
        .from("remote_audit_evidence")
        .delete()
        .eq("id", evidenceId);

      if (deleteError) {
        throw new Error(`Database delete failed: ${deleteError.message}`);
      }

      logger.info(`[Evidence Upload] Evidence ${evidenceId} deleted`);
    } catch (error) {
      logger.error("[Evidence Upload] Delete failed:", error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Check file name
    if (!file.name || file.name.length > 255) {
      throw new Error("Invalid file name");
    }
  }

  /**
   * Delete file from storage
   */
  private static async deleteFile(storagePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([storagePath]);

      if (error) {
        logger.error(`[Evidence Upload] Storage delete failed: ${error.message}`);
      }
    } catch (error) {
      logger.error("[Evidence Upload] Storage delete error:", error);
    }
  }

  /**
   * Map database record to RemoteAuditEvidence
   */
  private static mapFromDB(data: any): RemoteAuditEvidence {
    return {
      id: data.id,
      auditId: data.audit_id,
      checklistItemId: data.checklist_item_id,
      fileName: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      storagePath: data.storage_path,
      uploadedBy: data.uploaded_by,
      uploadedAt: new Date(data.uploaded_at),
      ocrText: data.ocr_text,
      ocrProcessed: data.ocr_processed,
      aiAnalysis: data.ai_analysis,
      verificationStatus: data.verification_status,
      metadata: data.metadata
    };
  }

  /**
   * Check if file type is an image
   */
  static isImageFile(fileType: string): boolean {
    return fileType.startsWith("image/");
  }

  /**
   * Check if file type is a video
   */
  static isVideoFile(fileType: string): boolean {
    return fileType.startsWith("video/");
  }

  /**
   * Check if file type is a PDF
   */
  static isPDFFile(fileType: string): boolean {
    return fileType === "application/pdf";
  }
}
