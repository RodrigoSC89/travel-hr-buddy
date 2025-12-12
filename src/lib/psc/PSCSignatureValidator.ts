/**
 * PSC Signature Validator
 * Validates digital signatures for PSC inspection reports
 */

/**
 * Generate SHA-256 hash for signature validation
 */
export async function generateSignatureHash(data: string): Promise<string> {
  // Convert string to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Generate signature hash for PSC inspection
 */
export async function generatePSCSignatureHash(
  inspectionId: string,
  vesselId: string,
  inspectorName: string,
  inspectionDate: string,
  findingsJson: string
): Promise<string> {
  const signatureData = `${inspectionId}|${vesselId}|${inspectorName}|${inspectionDate}|${findingsJson}`;
  return generateSignatureHash(signatureData);
}

/**
 * Validate signature hash for PSC inspection
 */
export async function validatePSCSignature(
  inspectionId: string,
  vesselId: string,
  inspectorName: string,
  inspectionDate: string,
  findingsJson: string,
  providedHash: string
): Promise<boolean> {
  try {
    const calculatedHash = await generatePSCSignatureHash(
      inspectionId,
      vesselId,
      inspectorName,
      inspectionDate,
      findingsJson
    );

    return calculatedHash === providedHash;
  } catch (error) {
    console.error("Error validating signature:", error);
    return false;
  }
}

/**
 * Signature validation result
 */
export interface SignatureValidationResult {
  isValid: boolean;
  message: string;
  timestamp: Date;
}

/**
 * Validate signature with detailed result
 */
export async function validatePSCSignatureDetailed(
  inspectionId: string,
  vesselId: string,
  inspectorName: string,
  inspectionDate: string,
  findingsJson: string,
  providedHash: string
): Promise<SignatureValidationResult> {
  const timestamp = new Date();

  if (!providedHash) {
    return {
      isValid: false,
      message: "No signature hash provided",
      timestamp,
    };
  }

  try {
    const isValid = await validatePSCSignature(
      inspectionId,
      vesselId,
      inspectorName,
      inspectionDate,
      findingsJson,
      providedHash
    );

    return {
      isValid,
      message: isValid 
        ? "Signature is valid and inspection data is intact"
        : "Signature validation failed - data may have been modified",
      timestamp,
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp,
    };
  }
}

/**
 * Generate simple RSA-like identifier (for display purposes)
 * Note: This is a simplified version. In production, use proper RSA signing
 */
export function generateRSAIdentifier(hash: string): string {
  // Take first 8 and last 8 characters of hash for display
  const prefix = hash.substring(0, 8);
  const suffix = hash.substring(hash.length - 8);
  return `RSA-${prefix.toUpperCase()}...${suffix.toUpperCase()}`;
}

/**
 * Verify inspection integrity
 */
export async function verifyInspectionIntegrity(
  inspection: {
    id: string;
    vessel_id: string;
    inspector_name: string;
    inspection_date: string;
    findings: any;
    signature_hash?: string;
  }
): Promise<SignatureValidationResult> {
  if (!inspection.signature_hash) {
    return {
      isValid: false,
      message: "Inspection is not signed",
      timestamp: new Date(),
    };
  }

  const findingsJson = JSON.stringify(inspection.findings);

  return validatePSCSignatureDetailed(
    inspection.id,
    inspection.vessel_id,
    inspection.inspector_name,
    inspection.inspection_date,
    findingsJson,
    inspection.signature_hash
  );
}
