import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorSearchService } from '../vectorSearch';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      }),
    },
  },
}));

// Mock fetch for OpenAI API
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    data: [{ embedding: Array(1536).fill(0.1) }],
  }),
}) as any;

describe('VectorSearchService', () => {
  let vectorSearch: VectorSearchService;

  beforeEach(() => {
    vectorSearch = new VectorSearchService();
    vi.clearAllMocks();
  });

  it('should initialize correctly', () => {
    expect(vectorSearch).toBeInstanceOf(VectorSearchService);
  });

  it('should search documents with default options', async () => {
    const results = await vectorSearch.searchDocuments('test query');
    expect(results).toEqual([]);
  });

  it('should fetch categories', async () => {
    const categories = await vectorSearch.getCategories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should fetch tags', async () => {
    const tags = await vectorSearch.getTags();
    expect(Array.isArray(tags)).toBe(true);
  });
});
