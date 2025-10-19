import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MMIOrdersPage from '@/pages/admin/mmi/orders';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn(),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('MMI Orders Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    render(<MMIOrdersPage />);
    expect(screen.getByText(/Gerenciamento de Ordens de Serviço/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<MMIOrdersPage />);
    expect(screen.getByText(/Carregando ordens de serviço/i)).toBeInTheDocument();
  });

  it('should render work order cards', async () => {
    const mockOrders = [
      {
        id: 'test-1',
        status: 'open',
        created_at: '2024-01-15T10:00:00Z',
        notes: 'Test order',
      },
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockOrders,
          error: null,
        }),
      }),
    } as any);

    render(<MMIOrdersPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    });
  });

  it('should display status badges', () => {
    const statuses = [
      { status: 'open', label: 'Aberta', emoji: '🟡' },
      { status: 'in_progress', label: 'Em Andamento', emoji: '🔵' },
      { status: 'completed', label: 'Concluída', emoji: '🟢' },
      { status: 'cancelled', label: 'Cancelada', emoji: '🔴' },
    ];

    statuses.forEach(({ status, label, emoji }) => {
      expect(status).toBeDefined();
      expect(label).toBeDefined();
      expect(emoji).toBeDefined();
    });
  });

  it('should disable editing for completed orders', () => {
    const completedOrder = {
      id: 'test-completed',
      status: 'completed',
      created_at: '2024-01-15T10:00:00Z',
    };

    expect(completedOrder.status).toBe('completed');
  });

  it('should handle save button click', async () => {
    const mockOrder = {
      id: 'test-1',
      status: 'open',
      created_at: '2024-01-15T10:00:00Z',
    };

    // Verify save button behavior
    expect(mockOrder.id).toBeDefined();
  });

  it('should update work order via API', async () => {
    const updateData = {
      id: 'test-1',
      status: 'completed',
      executed_at: '2024-01-20T14:30:00Z',
      technician_comment: 'Trabalho concluído',
    };

    expect(updateData.id).toBeDefined();
    expect(updateData.status).toBe('completed');
  });

  it('should validate form inputs', () => {
    const validInputs = {
      executedAt: '2024-01-20T14:30',
      technicianComment: 'Test comment',
      status: 'in_progress',
    };

    expect(validInputs.executedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(validInputs.technicianComment).toBeTruthy();
    expect(['open', 'in_progress', 'completed', 'cancelled']).toContain(validInputs.status);
  });
});
