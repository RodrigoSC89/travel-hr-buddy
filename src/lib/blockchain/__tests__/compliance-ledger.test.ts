/**
 * Blockchain Compliance Ledger Tests
 * Unit and integration tests for immutable evidence storage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  BlockchainComplianceLedger, 
  blockchainLedger, 
  Evidence, 
  ComplianceRecord 
} from '../compliance-ledger';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

describe('BlockchainComplianceLedger', () => {
  let ledger: BlockchainComplianceLedger;
  
  beforeEach(() => {
    ledger = BlockchainComplianceLedger.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BlockchainComplianceLedger.getInstance();
      const instance2 = BlockchainComplianceLedger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(blockchainLedger).toBeDefined();
      expect(blockchainLedger).toBeInstanceOf(BlockchainComplianceLedger);
    });
  });

  describe('hashEvidence', () => {
    const mockEvidence: Evidence = {
      id: 'ev-001',
      auditId: 'audit-001',
      elementId: 'elem-1.1',
      vesselId: 'vessel-001',
      content: 'Test evidence content',
      type: 'document',
      timestamp: '2024-01-15T10:00:00Z',
      uploadedBy: 'user-001'
    };

    it('should generate consistent SHA-256 hash for same evidence', async () => {
      const hash1 = await ledger.hashEvidence(mockEvidence);
      const hash2 = await ledger.hashEvidence(mockEvidence);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex = 64 chars
    });

    it('should generate different hashes for different evidence', async () => {
      const modifiedEvidence = { ...mockEvidence, content: 'Modified content' };
      
      const hash1 = await ledger.hashEvidence(mockEvidence);
      const hash2 = await ledger.hashEvidence(modifiedEvidence);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle Blob content', async () => {
      const blobEvidence: Evidence = {
        ...mockEvidence,
        content: new Blob(['Binary content'], { type: 'application/pdf' })
      };
      
      const hash = await ledger.hashEvidence(blobEvidence);
      
      expect(hash).toHaveLength(64);
      expect(typeof hash).toBe('string');
    });

    it('should include all evidence fields in hash calculation', async () => {
      // Changing any field should produce different hash
      const fields = ['id', 'auditId', 'elementId', 'vesselId', 'type', 'timestamp', 'uploadedBy'];
      
      const originalHash = await ledger.hashEvidence(mockEvidence);
      
      for (const field of fields) {
        const modified = { ...mockEvidence, [field]: 'modified-value' };
        const modifiedHash = await ledger.hashEvidence(modified);
        expect(modifiedHash).not.toBe(originalHash);
      }
    });
  });

  describe('storeEvidence', () => {
    const mockEvidence: Evidence = {
      id: 'ev-002',
      auditId: 'audit-002',
      elementId: 'elem-2.1',
      vesselId: 'vessel-002',
      content: 'Evidence for storage test',
      type: 'photo',
      timestamp: '2024-01-16T14:30:00Z',
      uploadedBy: 'user-002'
    };

    it('should store evidence and return blockchain transaction', async () => {
      const transaction = await ledger.storeEvidence(mockEvidence);
      
      expect(transaction).toMatchObject({
        verified: true,
        blockNumber: expect.any(Number),
        timestamp: expect.any(String)
      });
      expect(transaction.hash).toMatch(/^0x[a-f0-9]+$/);
    });

    it('should store evidence in localStorage as fallback', async () => {
      await ledger.storeEvidence(mockEvidence);
      
      const records = JSON.parse(localStorage.getItem('compliance_ledger') || '[]');
      expect(records.length).toBeGreaterThanOrEqual(1);
    });

    it('should create unique block numbers for each transaction', async () => {
      const tx1 = await ledger.storeEvidence(mockEvidence);
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const tx2 = await ledger.storeEvidence({ ...mockEvidence, id: 'ev-003' });
      
      expect(tx1.blockNumber).not.toBe(tx2.blockNumber);
    });
  });

  describe('verifyEvidence', () => {
    const mockEvidence: Evidence = {
      id: 'ev-verify-001',
      auditId: 'audit-verify',
      elementId: 'elem-3.1',
      vesselId: 'vessel-003',
      content: 'Evidence to verify',
      type: 'log',
      timestamp: '2024-01-17T09:00:00Z',
      uploadedBy: 'user-003'
    };

    it('should verify unmodified evidence as valid', async () => {
      // Store evidence first
      await ledger.storeEvidence(mockEvidence);
      
      // Verify the same evidence
      const result = await ledger.verifyEvidence(mockEvidence);
      
      expect(result.verified).toBe(true);
      expect(result.tamperedDetected).toBe(false);
    });

    it('should detect tampered evidence', async () => {
      // Store original evidence
      await ledger.storeEvidence(mockEvidence);
      
      // Try to verify modified evidence
      const tamperedEvidence = { ...mockEvidence, content: 'Tampered content!' };
      const result = await ledger.verifyEvidence(tamperedEvidence);
      
      expect(result.verified).toBe(false);
      expect(result.tamperedDetected).toBe(true);
      expect(result.currentHash).not.toBe(result.originalHash);
    });

    it('should handle non-existent evidence', async () => {
      const result = await ledger.verifyEvidence(mockEvidence);
      
      expect(result.verified).toBe(false);
      expect(result.originalHash).toBe('');
    });
  });

  describe('createComplianceRecord', () => {
    it('should create audit compliance record', async () => {
      const record = await ledger.createComplianceRecord(
        'audit',
        'entity-001',
        { vessel: 'Test Vessel', element: '1.1' }
      );
      
      expect(record).toMatchObject({
        id: expect.any(String),
        type: 'audit',
        entityId: 'entity-001',
        timestamp: expect.any(String)
      });
      expect(record.hash).toMatch(/^0x[a-f0-9]+$/);
      expect(record.signature).toMatch(/^0x[a-f0-9]+$/);
    });

    it('should create certificate compliance record', async () => {
      const record = await ledger.createComplianceRecord(
        'certificate',
        'cert-001',
        { name: 'STCW Certificate', validUntil: '2025-12-31' }
      );
      
      expect(record.type).toBe('certificate');
    });

    it('should create inspection compliance record', async () => {
      const record = await ledger.createComplianceRecord(
        'inspection',
        'insp-001',
        { inspector: 'DNV', result: 'passed' }
      );
      
      expect(record.type).toBe('inspection');
    });

    it('should create incident compliance record', async () => {
      const record = await ledger.createComplianceRecord(
        'incident',
        'inc-001',
        { severity: 'low', description: 'Minor issue' }
      );
      
      expect(record.type).toBe('incident');
    });

    it('should generate unique record IDs', async () => {
      const record1 = await ledger.createComplianceRecord('audit', 'e1', {});
      const record2 = await ledger.createComplianceRecord('audit', 'e2', {});
      
      expect(record1.id).not.toBe(record2.id);
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail for entity', async () => {
      const entityId = 'entity-trail-001';
      
      // Create multiple records
      await ledger.createComplianceRecord('audit', entityId, { step: 1 });
      await ledger.createComplianceRecord('inspection', entityId, { step: 2 });
      await ledger.createComplianceRecord('certificate', 'other-entity', { step: 3 });
      
      const trail = await ledger.getAuditTrail(entityId);
      
      expect(trail.length).toBe(2);
      expect(trail.every(r => r.entityId === entityId)).toBe(true);
    });

    it('should return empty array for non-existent entity', async () => {
      const trail = await ledger.getAuditTrail('non-existent-entity');
      expect(trail).toEqual([]);
    });
  });

  describe('generateVerificationCertificate', () => {
    it('should generate certificate for evidence list', async () => {
      // Store some evidence first
      const evidence1: Evidence = {
        id: 'cert-ev-001',
        auditId: 'audit-cert',
        elementId: 'elem-1',
        vesselId: 'vessel-cert',
        content: 'Content 1',
        type: 'document',
        timestamp: new Date().toISOString(),
        uploadedBy: 'user-cert'
      };
      
      const evidence2: Evidence = {
        ...evidence1,
        id: 'cert-ev-002',
        content: 'Content 2'
      };
      
      await ledger.storeEvidence(evidence1);
      await ledger.storeEvidence(evidence2);
      
      const certificate = await ledger.generateVerificationCertificate([
        'cert-ev-001',
        'cert-ev-002'
      ]);
      
      expect(certificate).toMatchObject({
        certificateId: expect.any(String),
        issuedAt: expect.any(String),
        validUntil: expect.any(String),
        masterHash: expect.stringMatching(/^0x[a-f0-9]+$/)
      });
      expect(certificate.qrCode).toMatch(/^nautilus:\/\/verify\//);
    });

    it('should set valid certificate validity period (1 year)', async () => {
      const certificate = await ledger.generateVerificationCertificate([]);
      
      const issuedAt = new Date(certificate.issuedAt);
      const validUntil = new Date(certificate.validUntil);
      const diffDays = (validUntil.getTime() - issuedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(diffDays).toBeCloseTo(365, 0);
    });
  });
});

describe('Integration Tests - BlockchainComplianceLedger', () => {
  let ledger: BlockchainComplianceLedger;

  beforeEach(() => {
    ledger = BlockchainComplianceLedger.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should complete full evidence lifecycle: store -> verify -> certificate', async () => {
    // 1. Create and store evidence
    const evidence: Evidence = {
      id: 'lifecycle-001',
      auditId: 'audit-lifecycle',
      elementId: 'elem-lifecycle',
      vesselId: 'vessel-lifecycle',
      content: 'Complete lifecycle test evidence',
      type: 'document',
      timestamp: new Date().toISOString(),
      uploadedBy: 'test-user'
    };
    
    const transaction = await ledger.storeEvidence(evidence);
    expect(transaction.verified).toBe(true);
    
    // 2. Verify evidence integrity
    const verification = await ledger.verifyEvidence(evidence);
    expect(verification.verified).toBe(true);
    expect(verification.tamperedDetected).toBe(false);
    
    // 3. Generate verification certificate
    const certificate = await ledger.generateVerificationCertificate([evidence.id]);
    expect(certificate.certificateId).toBeDefined();
    expect(certificate.evidenceHashes.length).toBeGreaterThanOrEqual(1);
  });

  it('should maintain compliance record audit trail integrity', async () => {
    const entityId = 'integrity-test-entity';
    
    // Create compliance records in sequence
    const record1 = await ledger.createComplianceRecord('audit', entityId, { phase: 'initial' });
    const record2 = await ledger.createComplianceRecord('inspection', entityId, { phase: 'review' });
    const record3 = await ledger.createComplianceRecord('certificate', entityId, { phase: 'final' });
    
    // Verify audit trail
    const trail = await ledger.getAuditTrail(entityId);
    
    expect(trail.length).toBe(3);
    expect(trail.map(r => r.type)).toEqual(['audit', 'inspection', 'certificate']);
    
    // All records should have unique signatures
    const signatures = trail.map(r => r.signature);
    expect(new Set(signatures).size).toBe(3);
  });

  it('should handle concurrent evidence storage', async () => {
    const evidences = Array.from({ length: 5 }, (_, i) => ({
      id: `concurrent-${i}`,
      auditId: 'concurrent-audit',
      elementId: `elem-${i}`,
      vesselId: 'concurrent-vessel',
      content: `Concurrent evidence ${i}`,
      type: 'log' as const,
      timestamp: new Date().toISOString(),
      uploadedBy: 'concurrent-user'
    }));
    
    // Store all evidences concurrently
    const transactions = await Promise.all(
      evidences.map(e => ledger.storeEvidence(e))
    );
    
    // All transactions should succeed
    expect(transactions.every(t => t.verified)).toBe(true);
    
    // All hashes should be unique
    const hashes = transactions.map(t => t.hash);
    expect(new Set(hashes).size).toBe(5);
  });
});
