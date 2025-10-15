import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seedSuggestionsForWorkflow } from '@/lib/workflows/seedSuggestions';
import { workflowSuggestionTemplates } from '@/lib/workflows/suggestionTemplates';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('seedSuggestionsForWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should seed suggestions with workflow_id', async () => {
    const testWorkflowId = 'test-workflow-123';
    const { supabase } = await import('@/integrations/supabase/client');
    
    const result = await seedSuggestionsForWorkflow(testWorkflowId);
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('workflow_ai_suggestions');
    
    // Verify the insert was called with enriched data
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    const insertMock = fromMock.mock.results[0].value.insert;
    
    const expectedData = workflowSuggestionTemplates.map((suggestion) => ({
      ...suggestion,
      workflow_id: testWorkflowId,
    }));
    
    expect(insertMock).toHaveBeenCalledWith(expectedData);
  });

  it('should return false on error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock an error
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
    });
    
    const result = await seedSuggestionsForWorkflow('test-workflow-123');
    
    expect(result).toBe(false);
  });

  it('should handle exceptions', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock an exception
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    
    const result = await seedSuggestionsForWorkflow('test-workflow-123');
    
    expect(result).toBe(false);
  });
});

describe('workflowSuggestionTemplates', () => {
  it('should have at least one suggestion template', () => {
    expect(workflowSuggestionTemplates.length).toBeGreaterThan(0);
  });

  it('should have templates with all required fields', () => {
    workflowSuggestionTemplates.forEach((template) => {
      expect(template).toHaveProperty('etapa');
      expect(template).toHaveProperty('tipo_sugestao');
      expect(template).toHaveProperty('conteudo');
      expect(template).toHaveProperty('criticidade');
      expect(template).toHaveProperty('responsavel_sugerido');
      expect(template).toHaveProperty('origem');
    });
  });

  it('should have templates with valid criticidade values', () => {
    const validCriticidades = ['alta', 'média', 'baixa'];
    
    workflowSuggestionTemplates.forEach((template) => {
      expect(validCriticidades).toContain(template.criticidade);
    });
  });

  it('should have templates with valid origem values', () => {
    const validOrigens = ['Template Histórico', 'Checklists', 'MMI', 'Audit Logs'];
    
    workflowSuggestionTemplates.forEach((template) => {
      expect(validOrigens).toContain(template.origem);
    });
  });
});
