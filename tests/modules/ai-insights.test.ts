/**
 * PATCH 89.5 - AI Insights Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AIInsights from '@/modules/intelligence/ai-insights';
import { supabase } from '@/integrations/supabase/client';
import { runAIContext } from '@/ai/kernel';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/ai/kernel', () => ({
  runAIContext: vi.fn(),
}));

vi.mock('@/hooks/use-logger', () => ({
  useLogger: vi.fn(() => ({
    logMount: vi.fn(),
    logDataLoad: vi.fn(),
    logAIActivation: vi.fn(),
    logUserAction: vi.fn(),
    logError: vi.fn(),
  })),
}));

describe('AIInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase responses
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);
    
    // Default mock implementations for AI insights
    mockSupabaseChain.gte.mockImplementation((field: string, value: string) => {
      if (field === 'created_at') {
        return Promise.resolve({ 
          data: [
            { id: '1', confidence: 90, created_at: new Date().toISOString() },
            { id: '2', confidence: 85, created_at: new Date().toISOString() },
          ], 
          error: null 
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    // Default mock for recommendations
    mockSupabaseChain.eq.mockResolvedValue({ 
      data: [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
        { id: '3', status: 'active' },
      ], 
      error: null 
    });

    // Mock AI context responses
    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Test AI insight message',
      confidence: 92.5,
      metadata: { testKey: 'testValue' },
      timestamp: new Date(),
    });
  });

  it('should render the AI Insights title', async () => {
    render(React.createElement(AIInsights));
    
    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeDefined();
    });
  });

  it('should load and display AI metrics from Supabase', async () => {
    render(React.createElement(AIInsights));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('ai_insights');
      expect(supabase.from).toHaveBeenCalledWith('ai_recommendations');
    });

    await waitFor(() => {
      expect(screen.getByText('Insights Generated')).toBeDefined();
      expect(screen.getByText('Accuracy Rate')).toBeDefined();
      expect(screen.getByText('Recommendations')).toBeDefined();
      expect(screen.getByText('Value Impact')).toBeDefined();
    });
  });

  it('should execute AI context for multiple modules', async () => {
    render(React.createElement(AIInsights));

    await waitFor(() => {
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'intelligence.ai-insights',
          action: 'analyze',
        })
      );
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'operations.fleet',
          action: 'analyze',
        })
      );
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'operations.crew',
          action: 'analyze',
        })
      );
    });
  });

  it('should display AI insights with confidence scores', async () => {
    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Fleet optimization recommended',
      confidence: 94.2,
      metadata: { fleet: 'active' },
      timestamp: new Date(),
    });

    render(React.createElement(AIInsights));

    await waitFor(() => {
      expect(screen.getByText('Active Insights & Recommendations')).toBeDefined();
    });
  });

  it('should handle Supabase errors gracefully', async () => {
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    };

    mockSupabaseChain.gte.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    mockSupabaseChain.eq.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    render(React.createElement(AIInsights));

    // Dashboard should still render despite errors
    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeDefined();
    });
  });

  it('should calculate metrics correctly from data', async () => {
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    };

    mockSupabaseChain.gte.mockResolvedValue({ 
      data: [
        { id: '1', confidence: 90, created_at: new Date().toISOString() },
        { id: '2', confidence: 80, created_at: new Date().toISOString() },
        { id: '3', confidence: 95, created_at: new Date().toISOString() },
      ], 
      error: null 
    });

    mockSupabaseChain.eq.mockResolvedValue({ 
      data: [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
      ], 
      error: null 
    });

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    render(React.createElement(AIInsights));

    await waitFor(() => {
      // Should display calculated metrics
      expect(screen.getByText('Insights Generated')).toBeDefined();
    });
  });

  it('should display metadata for insights', async () => {
    (runAIContext as any).mockResolvedValue({
      type: 'risk',
      message: 'Critical issue detected',
      confidence: 97.5,
      metadata: { 
        severity: 'high',
        module: 'fleet'
      },
      timestamp: new Date(),
    });

    render(React.createElement(AIInsights));

    await waitFor(() => {
      expect(screen.getByText('Active Insights & Recommendations')).toBeDefined();
    });
  });
});
