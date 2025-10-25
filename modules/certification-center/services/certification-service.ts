/**
 * Certification Service
 * PATCH 151.0 - Certificate generation and validation
 */

import { createClient } from '@/integrations/supabase/client';
import QRCode from 'qrcode';
import { CertificationData, CertificationFormData, ValidationResult } from '../types';

/**
 * Generate SHA256 hash from certificate data
 */
export const generateCertificateHash = async (data: CertificationFormData): Promise<string> => {
  const dataString = JSON.stringify({
    type: data.type,
    vesselName: data.vesselName,
    imoNumber: data.imoNumber,
    issuedBy: data.issuedBy,
    expiryDate: data.expiryDate,
    timestamp: new Date().toISOString()
  });
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Generate QR Code for certificate validation
 */
export const generateQRCode = async (certificateId: string, hash: string): Promise<string> => {
  const validationUrl = `${window.location.origin}/certification/validate/${certificateId}`;
  const qrData = JSON.stringify({
    id: certificateId,
    hash,
    url: validationUrl
  });
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Issue a new certificate
 */
export const issueCertificate = async (formData: CertificationFormData): Promise<CertificationData> => {
  const supabase = createClient();
  
  // Generate hash and QR code
  const hash = await generateCertificateHash(formData);
  const certificateId = `CERT-${formData.type}-${Date.now()}`;
  const qrCode = await generateQRCode(certificateId, hash);
  const validationUrl = `${window.location.origin}/certification/validate/${certificateId}`;
  
  const certificateData: CertificationData = {
    id: certificateId,
    type: formData.type,
    vesselId: formData.vesselId,
    vesselName: formData.vesselName,
    imoNumber: formData.imoNumber,
    issuedBy: formData.issuedBy,
    issuedDate: new Date().toISOString(),
    expiryDate: formData.expiryDate,
    operationDetails: {
      portName: formData.portName,
      operationType: formData.operationType,
      inspectorName: formData.inspectorName,
      inspectionDate: formData.inspectionDate,
      findings: formData.findings,
      status: formData.status
    },
    hash,
    qrCode,
    validationUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Store in database
  const { error } = await supabase
    .from('certifications')
    .insert([certificateData]);
  
  if (error) {
    console.error('Error storing certificate:', error);
    throw error;
  }
  
  return certificateData;
};

/**
 * Validate a certificate by ID and hash
 */
export const validateCertificate = async (certificateId: string, hash?: string): Promise<ValidationResult> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', certificateId)
    .single();
  
  if (error || !data) {
    return {
      valid: false,
      message: 'Certificate not found',
      verifiedAt: new Date().toISOString()
    };
  }
  
  // Validate hash if provided
  if (hash && data.hash !== hash) {
    return {
      valid: false,
      certificate: data,
      message: 'Certificate hash mismatch - possible tampering detected',
      verifiedAt: new Date().toISOString()
    };
  }
  
  // Check expiry
  const expiryDate = new Date(data.expiryDate);
  const now = new Date();
  
  if (expiryDate < now) {
    return {
      valid: false,
      certificate: data,
      message: 'Certificate has expired',
      verifiedAt: new Date().toISOString()
    };
  }
  
  return {
    valid: true,
    certificate: data,
    message: 'Certificate is valid',
    verifiedAt: new Date().toISOString()
  };
};

/**
 * Get certificate history
 */
export const getCertificateHistory = async (certificateId: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('certification_history')
    .select('*')
    .eq('certificateId', certificateId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }
  
  return data || [];
};

/**
 * List all certificates with filters
 */
export const listCertificates = async (filters?: {
  type?: string;
  vesselId?: string;
  status?: string;
}) => {
  const supabase = createClient();
  
  let query = supabase
    .from('certifications')
    .select('*')
    .order('createdAt', { ascending: false });
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.vesselId) {
    query = query.eq('vesselId', filters.vesselId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error listing certificates:', error);
    return [];
  }
  
  return data || [];
};
