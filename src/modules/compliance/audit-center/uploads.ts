/**
 * Audit Center - Evidence Upload Utilities
 * PATCH 62.0
 */

import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";
import { AuditEvidence } from "./types";

/**
 * Upload audit evidence file to Supabase Storage
 */
export async function uploadEvidence(
  file: File,
  auditId: string,
  userId?: string
): Promise<{ success: boolean; data?: AuditEvidence; error?: string }> {
  try {
    Logger.info("Uploading audit evidence", { 
      fileName: file.name, 
      fileSize: file.size,
      auditId 
    });

    // Generate unique file path
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${auditId}_${timestamp}.${fileExt}`;
    const filePath = `audits/${auditId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidence_uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      Logger.error("Evidence upload failed", uploadError, "audit-center");
      return { 
        success: false, 
        error: uploadError.message 
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("evidence_uploads")
      .getPublicUrl(filePath);

    const evidence: AuditEvidence = {
      id: crypto.randomUUID(),
      audit_id: auditId,
      file_name: file.name,
      file_path: urlData.publicUrl,
      file_type: file.type,
      uploaded_at: new Date().toISOString(),
      uploaded_by: userId
    };

    Logger.info("Evidence uploaded successfully", { 
      auditId, 
      fileName: file.name 
    });

    return { 
      success: true, 
      data: evidence 
    };

  } catch (error) {
    Logger.error("Unexpected error during upload", error, "audit-center");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Handle file input change event
 */
export function handleFileUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  auditId: string,
  onSuccess?: (evidence: AuditEvidence) => void,
  onError?: (error: string) => void
) {
  const file = event.target.files?.[0];
  
  if (!file) {
    return;
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    const error = "File size exceeds 10MB limit";
    Logger.warn("File upload rejected", { reason: error, size: file.size });
    onError?.(error);
    return;
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowedTypes.includes(file.type)) {
    const error = "Invalid file type. Only PDF, images, and Word documents allowed";
    Logger.warn("File upload rejected", { reason: error, type: file.type });
    onError?.(error);
    return;
  }

  // Upload file
  uploadEvidence(file, auditId)
    .then(result => {
      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || "Upload failed");
      }
    })
    .catch(error => {
      Logger.error("File upload exception", error, "audit-center");
      onError?.(error instanceof Error ? error.message : "Upload failed");
    });
}

/**
 * Delete audit evidence
 */
export async function deleteEvidence(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from("evidence_uploads")
      .remove([filePath]);

    if (error) {
      Logger.error("Failed to delete evidence", error, "audit-center");
      return false;
    }

    Logger.info("Evidence deleted successfully", { filePath });
    return true;

  } catch (error) {
    Logger.error("Unexpected error deleting evidence", error, "audit-center");
    return false;
  }
}
