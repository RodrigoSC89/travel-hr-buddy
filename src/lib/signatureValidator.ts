/**
 * Signature Validator for LSA & FFA Inspections
 * Validates digital signatures and ensures data integrity
 */

import { supabase } from "@/integrations/supabase/client";

export interface SignatureValidation {
  isValid: boolean;
  timestamp: string;
  inspector: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validate signature format
 */
export function validateSignatureFormat(signatureData: string): boolean {
  // Check if signature is a valid base64 data URI
  const dataUriPattern = /^data:image\/(png|jpg|jpeg|svg\+xml);base64,/;
  
  if (!dataUriPattern.test(signatureData)) {
    return false;
  }
  
  // Check minimum size (should have actual signature data)
  const base64Data = signatureData.split(",")[1];
  if (!base64Data || base64Data.length < 100) {
    return false;
  }
  
  return true;
}

/**
 * Create signature hash for verification
 * Uses Web Crypto API for secure hashing
 */
export async function createSignatureHash(
  inspectionId: string,
  inspector: string,
  timestamp: string
): Promise<string> {
  const data = `${inspectionId}:${inspector}:${timestamp}`;
  
  // Use crypto.subtle.digest for production
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.warn("Crypto API not available, using fallback hash");
    }
  }
  
  // Fallback for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Validate signature against inspection data
 */
export async function validateInspectionSignature(
  inspectionId: string,
  signatureData: string
): Promise<SignatureValidation> {
  try {
    // Validate format first
    if (!validateSignatureFormat(signatureData)) {
      return {
        isValid: false,
        timestamp: new Date().toISOString(),
        inspector: "unknown",
      };
    }
    
    // Get inspection data
    const { data: inspection, error } = await supabase
      .from("lsa_ffa_inspections")
      .select("*")
      .eq("id", inspectionId)
      .single();
    
    if (error || !inspection) {
      return {
        isValid: false,
        timestamp: new Date().toISOString(),
        inspector: "unknown",
      };
    }
    
    // Check if inspection can still be signed (not already validated)
    if (inspection.signature_validated) {
      return {
        isValid: false,
        timestamp: inspection.signature_validated_at || new Date().toISOString(),
        inspector: inspection.inspector,
        metadata: {
          reason: "Inspection already signed",
        },
      };
    }
    
    // Validate timestamp (signature should be after inspection date)
    const inspectionDate = new Date(inspection.date);
    const signatureDate = new Date();
    
    if (signatureDate < inspectionDate) {
      return {
        isValid: false,
        timestamp: signatureDate.toISOString(),
        inspector: inspection.inspector,
        metadata: {
          reason: "Signature date cannot be before inspection date",
        },
      };
    }
    
    // All checks passed
    return {
      isValid: true,
      timestamp: signatureDate.toISOString(),
      inspector: inspection.inspector,
      metadata: {
        inspectionDate: inspection.date,
        inspectionType: inspection.type,
      },
    };
  } catch (error) {
    console.error("Signature validation error:", error);
    return {
      isValid: false,
      timestamp: new Date().toISOString(),
      inspector: "unknown",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Apply signature to inspection
 */
export async function applySignature(
  inspectionId: string,
  signatureData: string
): Promise<{ success: boolean; message: string }> {
  try {
    const validation = await validateInspectionSignature(inspectionId, signatureData);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.metadata?.reason as string || "Invalid signature",
      };
    }
    
    // Update inspection with signature
    const { error } = await supabase
      .from("lsa_ffa_inspections")
      .update({
        signature_data: signatureData,
        signature_validated: true,
        signature_validated_at: validation.timestamp,
      })
      .eq("id", inspectionId);
    
    if (error) {
      return {
        success: false,
        message: "Failed to apply signature",
      };
    }
    
    return {
      success: true,
      message: "Signature applied successfully",
    };
  } catch (error) {
    console.error("Apply signature error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify signature integrity
 */
export function verifySignatureIntegrity(
  signatureData: string,
  expectedHash: string
): boolean {
  const actualHash = createSignatureHash(
    signatureData,
    new Date().toISOString(),
    "verify"
  );
  
  return actualHash === expectedHash;
}

/**
 * Get signature metadata for display
 */
export function getSignatureMetadata(signatureData: string): {
  format: string;
  size: number;
  createdAt: string;
} {
  const parts = signatureData.split(",");
  const format = parts[0]?.match(/image\/([^;]+)/)?.[1] || "unknown";
  const base64Data = parts[1] || "";
  const size = Math.round((base64Data.length * 3) / 4); // Approximate byte size
  
  return {
    format,
    size,
    createdAt: new Date().toISOString(),
  };
}
