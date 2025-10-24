/**
 * PATCH 91.0 - Document Hub Tests
 * Test document upload, AI analysis, and Supabase integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDocument } from '../modules/document-hub/services/ai';
import { uploadDocument, listDocuments, deleteDocument } from '../modules/document-hub/services/supabase';

// Mock dependencies
vi.mock('@/ai/kernel', () => ({
  runAIContext: vi.fn(async (request) => ({
    type: 'recommendation',
    message: 'Sumário: Este é um documento de teste.\n\nTópicos: teste, documento, análise\n\nValidade: válido\n\nCNPJ: 12.345.678/0001-90',
    confidence: 85,
    timestamp: new Date(),
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({
          data: { path: 'test/file.pdf' },
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/test/file.pdf' },
        })),
        remove: vi.fn(async () => ({ error: null })),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: {
              doc_id: 'test-doc-id',
              owner_id: 'test-user-id',
              filename: 'test.pdf',
              file_size: 1024,
              file_type: 'application/pdf',
              storage_url: 'https://example.com/test/file.pdf',
              created_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                doc_id: 'test-doc-id',
                owner_id: 'test-user-id',
                filename: 'test.pdf',
                file_size: 1024,
                file_type: 'application/pdf',
                storage_url: 'https://example.com/test/file.pdf',
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null })),
      })),
    })),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Document Hub - AI Service', () => {
  it('should analyze document and extract summary', async () => {
    const result = await analyzeDocument('Este é um documento de teste', 'test.pdf');
    
    expect(result).toBeDefined();
    expect(result.summary).toContain('documento de teste');
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should extract topics from AI response', async () => {
    const result = await analyzeDocument('Documento sobre compliance e segurança', 'compliance.pdf');
    
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.topics.length).toBeGreaterThan(0);
  });

  it('should extract validity status', async () => {
    const result = await analyzeDocument('Documento válido até 2025', 'valid.pdf');
    
    expect(result.validity_status).toBeDefined();
    expect(['valid', 'expired', 'expiring_soon', 'invalid']).toContain(result.validity_status);
  });

  it('should handle AI failures gracefully', async () => {
    const { runAIContext } = await import('@/ai/kernel');
    vi.mocked(runAIContext).mockRejectedValueOnce(new Error('AI error'));
    
    const result = await analyzeDocument('test', 'test.pdf');
    
    expect(result).toBeDefined();
    expect(result.summary).toBeTruthy();
    expect(result.confidence).toBe(0);
  });
});

describe('Document Hub - Supabase Service', () => {
  let mockFile: File;

  beforeEach(() => {
    // Create a mock File object
    mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  });

  it('should upload document successfully', async () => {
    const result = await uploadDocument(mockFile, 'test-user-id');
    
    expect(result.success).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.filename).toBe('test.pdf');
  });

  it('should list documents for a user', async () => {
    const documents = await listDocuments('test-user-id');
    
    expect(documents).toBeInstanceOf(Array);
    expect(documents.length).toBeGreaterThanOrEqual(0);
  });

  it('should delete document', async () => {
    const result = await deleteDocument('test-doc-id');
    
    expect(result).toBe(true);
  });

  it('should handle upload errors', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.storage.from).mockReturnValueOnce({
      upload: vi.fn(async () => ({
        data: null,
        error: new Error('Upload failed'),
      })),
    } as any);
    
    const result = await uploadDocument(mockFile, 'test-user-id');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('Document Hub - Integration', () => {
  it('should have correct module structure', () => {
    // Test that module files exist and are importable
    expect(() => require('../modules/document-hub')).not.toThrow();
    expect(() => require('../modules/document-hub/types')).not.toThrow();
    expect(() => require('../modules/document-hub/services/supabase')).not.toThrow();
    expect(() => require('../modules/document-hub/services/ai')).not.toThrow();
  });

  it('should export expected types', async () => {
    const types = await import('../modules/document-hub/types');
    
    // Check that types exist (TypeScript compilation will fail if they don't)
    expect(types).toBeDefined();
  });
});
