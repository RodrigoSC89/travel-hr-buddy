/**
 * Blockchain Compliance Ledger
 * Immutable evidence storage for maritime compliance
 */

import { supabase } from '@/integrations/supabase/client';

export interface Evidence {
  id: string;
  auditId: string;
  elementId: string;
  vesselId: string;
  content: string | Blob;
  type: 'photo' | 'document' | 'log' | 'sensor';
  timestamp: string;
  uploadedBy: string;
  txHash?: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  verified: boolean;
}

export interface VerificationResult {
  verified: boolean;
  tamperedDetected: boolean;
  blockchainTimestamp: string;
  originalHash: string;
  currentHash: string;
}

export interface ComplianceRecord {
  id: string;
  type: 'audit' | 'certificate' | 'inspection' | 'incident';
  entityId: string;
  hash: string;
  timestamp: string;
  signature: string;
  metadata: Record<string, unknown>;
}

/**
 * Blockchain Compliance Ledger
 * Provides immutable storage for compliance evidence
 */
export class BlockchainComplianceLedger {
  private static instance: BlockchainComplianceLedger;

  private constructor() {}

  static getInstance(): BlockchainComplianceLedger {
    if (!this.instance) {
      this.instance = new BlockchainComplianceLedger();
    }
    return this.instance;
  }

  /**
   * Hash evidence data using SHA-256
   */
  async hashEvidence(evidence: Evidence): Promise<string> {
    const data = JSON.stringify({
      id: evidence.id,
      auditId: evidence.auditId,
      elementId: evidence.elementId,
      vesselId: evidence.vesselId,
      type: evidence.type,
      timestamp: evidence.timestamp,
      uploadedBy: evidence.uploadedBy,
      contentHash: await this.hashContent(evidence.content)
    });

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash content (string or blob)
   */
  private async hashContent(content: string | Blob): Promise<string> {
    let dataBuffer: ArrayBuffer;

    if (typeof content === 'string') {
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(content).buffer;
    } else {
      dataBuffer = await content.arrayBuffer();
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store evidence hash on blockchain (simulated/local ledger)
   */
  async storeEvidence(evidence: Evidence): Promise<BlockchainTransaction> {
    const hash = await this.hashEvidence(evidence);
    const timestamp = new Date().toISOString();

    // Create transaction record
    const transaction: BlockchainTransaction = {
      hash,
      blockNumber: Date.now(),
      timestamp,
      verified: true
    };

    // Store in Supabase as immutable record
    const { error } = await supabase
      .from('compliance_ledger' as any)
      .insert({
        evidence_id: evidence.id,
        audit_id: evidence.auditId,
        element_id: evidence.elementId,
        vessel_id: evidence.vesselId,
        hash,
        block_number: transaction.blockNumber,
        timestamp,
        metadata: {
          type: evidence.type,
          uploadedBy: evidence.uploadedBy
        }
      });

    if (error) {
      // Fallback to localStorage for demo
      const records = JSON.parse(localStorage.getItem('compliance_ledger') || '[]');
      records.push({
        ...transaction,
        evidenceId: evidence.id,
        auditId: evidence.auditId
      });
      localStorage.setItem('compliance_ledger', JSON.stringify(records));
    }

    return {
      ...transaction,
      hash: `0x${hash.slice(0, 64)}`
    };
  }

  /**
   * Verify evidence integrity
   */
  async verifyEvidence(evidence: Evidence): Promise<VerificationResult> {
    const currentHash = await this.hashEvidence(evidence);

    let storedHash = '';
    let blockchainTimestamp = '';

    // Try localStorage first (main storage for demo)
    const records = JSON.parse(localStorage.getItem('compliance_ledger') || '[]');
    const record = records.find((r: any) => r.evidenceId === evidence.id);
    if (record) {
      storedHash = record.hash.replace('0x', '');
      blockchainTimestamp = record.timestamp;
    }

    return {
      verified: currentHash === storedHash,
      tamperedDetected: storedHash !== '' && currentHash !== storedHash,
      blockchainTimestamp,
      originalHash: storedHash,
      currentHash
    };
  }

  /**
   * Create compliance record with digital signature
   */
  async createComplianceRecord(
    type: ComplianceRecord['type'],
    entityId: string,
    metadata: Record<string, unknown>
  ): Promise<ComplianceRecord> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Create record hash
    const recordData = JSON.stringify({ id, type, entityId, timestamp, metadata });
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(recordData));
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create signature (simplified - in production use proper signing)
    const signatureData = `${hash}:${timestamp}`;
    const signatureBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(signatureData));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const record: ComplianceRecord = {
      id,
      type,
      entityId,
      hash: `0x${hash}`,
      timestamp,
      signature: `0x${signature}`,
      metadata
    };

    // Store record
    await this.storeComplianceRecord(record);

    return record;
  }

  /**
   * Store compliance record
   */
  private async storeComplianceRecord(record: ComplianceRecord): Promise<void> {
    const records = JSON.parse(localStorage.getItem('compliance_records') || '[]');
    records.push(record);
    localStorage.setItem('compliance_records', JSON.stringify(records));
  }

  /**
   * Get audit trail for entity
   */
  async getAuditTrail(entityId: string): Promise<ComplianceRecord[]> {
    const records = JSON.parse(localStorage.getItem('compliance_records') || '[]');
    return records.filter((r: ComplianceRecord) => r.entityId === entityId);
  }

  /**
   * Generate verification certificate
   */
  async generateVerificationCertificate(evidenceIds: string[]): Promise<{
    certificateId: string;
    issuedAt: string;
    validUntil: string;
    evidenceHashes: string[];
    masterHash: string;
    qrCode: string;
  }> {
    const hashes: string[] = [];

    for (const id of evidenceIds) {
      const records = JSON.parse(localStorage.getItem('compliance_ledger') || '[]');
      const record = records.find((r: any) => r.evidenceId === id);
      if (record) {
        hashes.push(record.hash);
      }
    }

    // Create master hash of all evidence
    const masterData = hashes.join(':');
    const encoder = new TextEncoder();
    const masterBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(masterData));
    const masterHash = Array.from(new Uint8Array(masterBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const certificateId = crypto.randomUUID();
    const issuedAt = new Date().toISOString();
    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    return {
      certificateId,
      issuedAt,
      validUntil,
      evidenceHashes: hashes,
      masterHash: `0x${masterHash}`,
      qrCode: `nautilus://verify/${certificateId}`
    };
  }
}

// Export singleton instance
export const blockchainLedger = BlockchainComplianceLedger.getInstance();
