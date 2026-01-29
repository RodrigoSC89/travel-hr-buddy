/**
 * Digital Signature Engine
 * E-signature with hashing, timestamps, and verification
 * Superior to Fluig DocSign and SoftExpert e-Sign
 * Uses in-memory storage (production would use DB)
 */

// Types
export interface SignatureRequest {
  id: string;
  document_id: string;
  document_title: string;
  requestor_id: string;
  requestor_name: string;
  signers: SignerConfig[];
  signature_order: 'sequential' | 'parallel';
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  message: string | null;
  due_date: string | null;
  reminder_frequency: 'none' | 'daily' | 'weekly';
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface SignerConfig {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  role: 'signer' | 'approver' | 'witness' | 'copy';
  order: number;
  status: 'pending' | 'signed' | 'declined' | 'delegated';
  signed_at: string | null;
  signature_data: SignatureData | null;
  declined_reason: string | null;
  delegated_to: string | null;
  ip_address: string | null;
  user_agent: string | null;
  geolocation: { lat: number; lng: number } | null;
}

export interface SignatureData {
  type: 'drawn' | 'typed' | 'uploaded' | 'certificate';
  value: string; // Base64 image or text
  font?: string;
  certificate_info?: CertificateInfo;
  timestamp: string;
  hash: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  serial_number: string;
  thumbprint: string;
}

export interface SignatureField {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signer_id: string;
  field_type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  required: boolean;
  value: string | null;
}

export interface SignatureAuditLog {
  id: string;
  request_id: string;
  action: string;
  actor_id: string | null;
  actor_email: string;
  actor_name: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
}

// In-memory storage
const signatureRequests = new Map<string, SignatureRequest>();
const auditLogs: SignatureAuditLog[] = [];

// Digital Signature Engine
class DigitalSignatureEngine {
  private static instance: DigitalSignatureEngine;

  private constructor() {}

  static getInstance(): DigitalSignatureEngine {
    if (!DigitalSignatureEngine.instance) {
      DigitalSignatureEngine.instance = new DigitalSignatureEngine();
    }
    return DigitalSignatureEngine.instance;
  }

  /**
   * Create a new signature request
   */
  async createSignatureRequest(params: {
    documentId: string;
    documentTitle: string;
    requestorId: string;
    requestorName: string;
    signers: Omit<SignerConfig, 'id' | 'status' | 'signed_at' | 'signature_data' | 'declined_reason' | 'delegated_to' | 'ip_address' | 'user_agent' | 'geolocation'>[];
    signatureOrder?: 'sequential' | 'parallel';
    message?: string;
    dueDate?: string;
    reminderFrequency?: 'none' | 'daily' | 'weekly';
  }): Promise<SignatureRequest> {
    // Prepare signers
    const signers: SignerConfig[] = params.signers.map((s, index) => ({
      ...s,
      id: crypto.randomUUID(),
      order: s.order ?? index,
      status: 'pending' as const,
      signed_at: null,
      signature_data: null,
      declined_reason: null,
      delegated_to: null,
      ip_address: null,
      user_agent: null,
      geolocation: null
    }));

    // Create request
    const request: SignatureRequest = {
      id: crypto.randomUUID(),
      document_id: params.documentId,
      document_title: params.documentTitle,
      requestor_id: params.requestorId,
      requestor_name: params.requestorName,
      signers,
      signature_order: params.signatureOrder || 'sequential',
      status: 'pending',
      message: params.message || null,
      due_date: params.dueDate || null,
      reminder_frequency: params.reminderFrequency || 'none',
      created_at: new Date().toISOString(),
      completed_at: null,
      metadata: {}
    };

    signatureRequests.set(request.id, request);

    // Log audit
    this.logAudit(request.id, 'request_created', params.requestorId, params.requestorName, {
      signers: signers.map(s => s.email)
    });

    console.log(`[SignatureEngine] Created request ${request.id} for document ${params.documentId}`);

    return request;
  }

  /**
   * Sign a document
   */
  async signDocument(params: {
    requestId: string;
    signerId: string;
    signatureData: Omit<SignatureData, 'timestamp' | 'hash'>;
    ipAddress?: string;
    userAgent?: string;
    geolocation?: { lat: number; lng: number };
  }): Promise<SignatureRequest> {
    const request = signatureRequests.get(params.requestId);
    if (!request) {
      throw new Error('Signature request not found');
    }

    const signerIndex = request.signers.findIndex(s => s.id === params.signerId);
    if (signerIndex === -1) {
      throw new Error('Signer not found in request');
    }

    const signer = request.signers[signerIndex];

    // Check sequential order
    if (request.signature_order === 'sequential') {
      const previousSigners = request.signers.slice(0, signerIndex);
      const allPreviousSigned = previousSigners.every(s => s.status === 'signed' || s.role === 'copy');
      if (!allPreviousSigned) {
        throw new Error('Previous signers must sign first');
      }
    }

    // Create signature hash
    const timestamp = new Date().toISOString();
    const hash = await this.generateHash(
      `${params.requestId}|${params.signerId}|${timestamp}|${params.signatureData.value}`
    );

    // Update signer
    request.signers[signerIndex] = {
      ...signer,
      status: 'signed',
      signed_at: timestamp,
      signature_data: {
        ...params.signatureData,
        timestamp,
        hash
      },
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      geolocation: params.geolocation || null
    };

    // Check completion
    const allSigned = request.signers.every(s => s.role === 'copy' || s.status === 'signed');
    if (allSigned) {
      request.status = 'completed';
      request.completed_at = new Date().toISOString();
    } else {
      request.status = 'in_progress';
    }

    signatureRequests.set(params.requestId, request);

    // Log audit
    this.logAudit(params.requestId, 'signed', signer.user_id, signer.name, {
      ip_address: params.ipAddress,
      hash
    });

    console.log(`[SignatureEngine] Signer ${signer.name} signed document`);

    return request;
  }

  /**
   * Decline to sign
   */
  async declineSignature(params: {
    requestId: string;
    signerId: string;
    reason: string;
  }): Promise<SignatureRequest> {
    const request = signatureRequests.get(params.requestId);
    if (!request) {
      throw new Error('Signature request not found');
    }

    const signerIndex = request.signers.findIndex(s => s.id === params.signerId);
    if (signerIndex === -1) {
      throw new Error('Signer not found');
    }

    request.signers[signerIndex] = {
      ...request.signers[signerIndex],
      status: 'declined',
      declined_reason: params.reason
    };

    request.status = 'cancelled';
    signatureRequests.set(params.requestId, request);

    // Log audit
    this.logAudit(params.requestId, 'declined', request.signers[signerIndex].user_id, request.signers[signerIndex].name, {
      reason: params.reason
    });

    return request;
  }

  /**
   * Delegate signature
   */
  async delegateSignature(params: {
    requestId: string;
    signerId: string;
    delegateToEmail: string;
    delegateToName: string;
  }): Promise<SignatureRequest> {
    const request = signatureRequests.get(params.requestId);
    if (!request) {
      throw new Error('Signature request not found');
    }

    const signerIndex = request.signers.findIndex(s => s.id === params.signerId);
    if (signerIndex === -1) {
      throw new Error('Signer not found');
    }

    const originalSigner = request.signers[signerIndex];

    // Update original signer
    request.signers[signerIndex] = {
      ...originalSigner,
      status: 'delegated',
      delegated_to: params.delegateToEmail
    };

    // Add new signer
    const newSigner: SignerConfig = {
      id: crypto.randomUUID(),
      user_id: null,
      email: params.delegateToEmail,
      name: params.delegateToName,
      role: originalSigner.role,
      order: originalSigner.order,
      status: 'pending',
      signed_at: null,
      signature_data: null,
      declined_reason: null,
      delegated_to: null,
      ip_address: null,
      user_agent: null,
      geolocation: null
    };

    request.signers.push(newSigner);
    signatureRequests.set(params.requestId, request);

    // Log audit
    this.logAudit(params.requestId, 'delegated', originalSigner.user_id, originalSigner.name, {
      delegated_to: params.delegateToEmail
    });

    return request;
  }

  /**
   * Generate SHA-256 hash
   */
  private async generateHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log audit entry
   */
  private logAudit(
    requestId: string,
    action: string,
    actorId: string | null,
    actorName: string,
    details: Record<string, unknown>
  ): void {
    const log: SignatureAuditLog = {
      id: crypto.randomUUID(),
      request_id: requestId,
      action,
      actor_id: actorId,
      actor_email: '',
      actor_name: actorName,
      timestamp: new Date().toISOString(),
      ip_address: null,
      user_agent: null,
      details
    };
    auditLogs.push(log);
  }

  /**
   * Get signature request by ID
   */
  getRequest(requestId: string): SignatureRequest | undefined {
    return signatureRequests.get(requestId);
  }

  /**
   * Get requests for a document
   */
  getRequestsForDocument(documentId: string): SignatureRequest[] {
    return Array.from(signatureRequests.values())
      .filter(r => r.document_id === documentId);
  }

  /**
   * Get pending signatures for a user
   */
  getPendingForUser(userId: string, email: string): SignatureRequest[] {
    return Array.from(signatureRequests.values())
      .filter(r => {
        const userSigner = r.signers.find(s => 
          (s.user_id === userId || s.email === email) && s.status === 'pending'
        );
        return !!userSigner;
      });
  }

  /**
   * Verify signature integrity
   */
  async verifySignature(requestId: string): Promise<{
    isValid: boolean;
    details: { signer: string; hash: string; verified: boolean }[];
  }> {
    const request = signatureRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const details = [];
    let allValid = true;

    for (const signer of request.signers) {
      if (signer.signature_data) {
        const expectedHash = await this.generateHash(
          `${requestId}|${signer.id}|${signer.signature_data.timestamp}|${signer.signature_data.value}`
        );
        const isValid = expectedHash === signer.signature_data.hash;
        
        if (!isValid) allValid = false;
        
        details.push({
          signer: signer.name,
          hash: signer.signature_data.hash,
          verified: isValid
        });
      }
    }

    return { isValid: allValid, details };
  }

  /**
   * Get audit logs for a request
   */
  getAuditLogs(requestId: string): SignatureAuditLog[] {
    return auditLogs.filter(l => l.request_id === requestId);
  }

  /**
   * Get all requests
   */
  getAllRequests(): SignatureRequest[] {
    return Array.from(signatureRequests.values());
  }
}

export const signatureEngine = DigitalSignatureEngine.getInstance();
