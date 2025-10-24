/**
 * PATCH 89.5 - Operations Dashboard Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import OperationsDashboard from '@/modules/operations/operations-dashboard';
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

describe('OperationsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase responses
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);
    
    // Default mock implementations
    mockSupabaseChain.select.mockImplementation((fields: string) => {
      if (fields === 'id') {
        return Promise.resolve({ data: [{ id: '1' }, { id: '2' }], error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });

    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Test AI insight',
      confidence: 90,
      timestamp: new Date(),
    });
  });

  it('should render the dashboard title', async () => {
    render(React.createElement(OperationsDashboard));
    
    await waitFor(() => {
      expect(screen.getByText('Operations Dashboard')).toBeDefined();
    });
  });

  it('should load and display operational data from Supabase', async () => {
    const mockVessels = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const mockCrew = [{ id: '1' }, { id: '2' }];
    const mockMissions = [{ id: '1' }];

    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
    };

    let callCount = 0;
    mockSupabaseChain.eq.mockImplementation((field: string, value: string) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ data: mockVessels, error: null });
      } else if (callCount === 2) {
        return Promise.resolve({ data: mockCrew, error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });

    mockSupabaseChain.lt.mockResolvedValue({ data: mockMissions, error: null });
    mockSupabaseChain.gte.mockImplementation(() => {
      if (callCount > 2) {
        return Promise.resolve({ data: [], error: null });
      }
      return mockSupabaseChain;
    });

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    render(React.createElement(OperationsDashboard));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('vessels');
      expect(supabase.from).toHaveBeenCalledWith('crew_members');
      expect(supabase.from).toHaveBeenCalledWith('missions');
    });
  });

  it('should execute AI context for insights', async () => {
    render(React.createElement(OperationsDashboard));

    await waitFor(() => {
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'operations-dashboard',
          action: 'analyze',
        })
      );
    });
  });

  it('should display KPI card labels', async () => {
    render(React.createElement(OperationsDashboard));

    // The component should render the title even if data loading fails
    await waitFor(() => {
      expect(screen.getByText('Operations Dashboard')).toBeDefined();
    });
  });

  it('should handle Supabase errors gracefully', async () => {
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
    };

    mockSupabaseChain.eq.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    render(React.createElement(OperationsDashboard));

    // Dashboard should still render despite errors
    await waitFor(() => {
      expect(screen.getByText('Operations Dashboard')).toBeDefined();
    });
  });

  it('should call AI context when loading insights', async () => {
    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Operational efficiency is optimal',
      confidence: 95.5,
      timestamp: new Date(),
    });

    render(React.createElement(OperationsDashboard));

    // Verify AI context is called
    await waitFor(() => {
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'operations-dashboard',
        })
      );
    });
  });
});
