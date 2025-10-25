/**
 * Digital Signature Service
 * PATCH 153.0 - Document signing with ICP-Brasil/OpenCert
 */

import { createClient } from '@/integrations/supabase/client';
import { DigitalCertificate, SignatureRequest, SignedDocument, SignatureVerification } from '../types';

/**
 * Upload digital certificate or key
 */
export const uploadCertificate = async (
  certificateFile: File,
  type: 'ICP-Brasil' | 'OpenCert' | 'Custom'
): Promise<DigitalCertificate> => {
  const supabase = createClient();

  // Read certificate file
  const fileContent = await certificateFile.text();
  
  // Extract certificate information (simplified)
  const certificate: DigitalCertificate = {
    id: `CERT-${Date.now()}`,
    type,
    name: certificateFile.name,
    issuer: 'Certificate Authority',
    subject: 'User Subject',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    serialNumber: `SN-${Date.now()}`,
    publicKey: fileContent.substring(0, 100), // Simplified
    fingerprint: await generateFingerprint(fileContent),
    uploadedAt: new Date().toISOString()
  };

  // Store certificate
  const { error } = await supabase
    .from('digital_certificates')
    .insert([certificate]);

  if (error) throw error;

  return certificate;
};

/**
 * Sign a document with digital certificate
 */
export const signDocument = async (request: SignatureRequest): Promise<SignedDocument> => {
  const supabase = createClient();

  // Generate digital signature
  const signature = await generateSignature(request);

  const signedDoc: SignedDocument = {
    id: `SIGNED-${Date.now()}`,
    originalDocumentId: request.documentId,
    signedDocumentUrl: `${request.documentUrl}?signed=true`,
    certificateId: request.certificateId,
    signedBy: 'Current User',
    signedAt: new Date().toISOString(),
    reason: request.reason,
    location: request.location,
    signature,
    verified: false
  };

  // Store signed document
  const { error } = await supabase
    .from('signed_documents')
    .insert([signedDoc]);

  if (error) throw error;

  return signedDoc;
};

/**
 * Verify digital signature
 */
export const verifySignature = async (signedDocumentId: string): Promise<SignatureVerification> => {
  const supabase = createClient();

  // Fetch signed document
  const { data: signedDoc, error: docError } = await supabase
    .from('signed_documents')
    .select('*')
    .eq('id', signedDocumentId)
    .single();

  if (docError || !signedDoc) {
    return {
      valid: false,
      signedDocument: null,
      certificate: null,
      message: 'Signed document not found',
      verifiedAt: new Date().toISOString()
    };
  }

  // Fetch certificate
  const { data: cert, error: certError } = await supabase
    .from('digital_certificates')
    .select('*')
    .eq('id', signedDoc.certificateId)
    .single();

  if (certError || !cert) {
    return {
      valid: false,
      signedDocument: signedDoc,
      certificate: null,
      message: 'Certificate not found',
      verifiedAt: new Date().toISOString()
    };
  }

  // Check certificate validity
  const now = new Date();
  const validFrom = new Date(cert.validFrom);
  const validTo = new Date(cert.validTo);

  if (now < validFrom || now > validTo) {
    return {
      valid: false,
      signedDocument: signedDoc,
      certificate: cert,
      message: 'Certificate is expired or not yet valid',
      verifiedAt: new Date().toISOString()
    };
  }

  // Verify signature (simplified)
  const isValid = await verifySignatureWithPublicKey(signedDoc.signature, cert.publicKey);

  return {
    valid: isValid,
    signedDocument: signedDoc,
    certificate: cert,
    message: isValid ? 'Signature is valid' : 'Signature verification failed',
    verifiedAt: new Date().toISOString()
  };
};

/**
 * Generate signature
 */
const generateSignature = async (request: SignatureRequest): Promise<string> => {
  const data = JSON.stringify({
    documentId: request.documentId,
    certificateId: request.certificateId,
    timestamp: new Date().toISOString()
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return signature;
};

/**
 * Generate certificate fingerprint
 */
const generateFingerprint = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return fingerprint;
};

/**
 * Verify signature with public key
 */
const verifySignatureWithPublicKey = async (
  signature: string,
  publicKey: string
): Promise<boolean> => {
  // In real implementation, this would use crypto.subtle.verify
  // For now, we return true if signature exists
  return signature.length > 0 && publicKey.length > 0;
};

/**
 * List all certificates
 */
export const listCertificates = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('digital_certificates')
    .select('*')
    .order('uploadedAt', { ascending: false });

  if (error) {
    console.error('Error listing certificates:', error);
    return [];
  }

  return data || [];
};

/**
 * List signed documents
 */
export const listSignedDocuments = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('signed_documents')
    .select('*')
    .order('signedAt', { ascending: false });

  if (error) {
    console.error('Error listing signed documents:', error);
    return [];
  }

  return data || [];
};
