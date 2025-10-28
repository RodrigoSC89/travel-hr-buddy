/**
 * Digital Signature - Type Definitions
 * PATCH 153.0 - ICP-Brasil & OpenCert Integration
 */

export interface DigitalCertificate {
  id: string;
  type: "ICP-Brasil" | "OpenCert" | "Custom";
  name: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  publicKey: string;
  fingerprint: string;
  uploadedAt: string;
}

export interface SignatureRequest {
  documentId: string;
  documentName: string;
  documentUrl: string;
  certificateId: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
}

export interface SignedDocument {
  id: string;
  originalDocumentId: string;
  signedDocumentUrl: string;
  certificateId: string;
  signedBy: string;
  signedAt: string;
  reason?: string;
  location?: string;
  signature: string;
  verified: boolean;
}

export interface SignatureVerification {
  valid: boolean;
  signedDocument: SignedDocument | null;
  certificate: DigitalCertificate | null;
  message: string;
  verifiedAt: string;
}
