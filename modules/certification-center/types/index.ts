/**
 * Certification Center - Type Definitions
 * PATCH 151.0 - Digital Certification System
 */

export interface CertificationData {
  id: string;
  type: 'ISM' | 'ISPS' | 'IMCA';
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  operationDetails: {
    portName: string;
    operationType: string;
    inspectorName: string;
    inspectionDate: string;
    findings: string[];
    status: 'compliant' | 'non-compliant' | 'conditional';
  };
  hash: string;
  qrCode: string;
  validationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationFormData {
  type: 'ISM' | 'ISPS' | 'IMCA';
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  issuedBy: string;
  expiryDate: string;
  portName: string;
  operationType: string;
  inspectorName: string;
  inspectionDate: string;
  findings: string[];
  status: 'compliant' | 'non-compliant' | 'conditional';
}

export interface ValidationResult {
  valid: boolean;
  certificate?: CertificationData;
  message: string;
  verifiedAt: string;
}

export interface CertificationHistory {
  id: string;
  certificateId: string;
  action: 'issued' | 'validated' | 'revoked' | 'renewed';
  performedBy: string;
  timestamp: string;
  details: string;
}
