import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DPIntelligenceCenter from '@/components/dp-intelligence/dp-intelligence-center';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              id: '1',
              title: 'Test Incident',
              date: '2024-10-01',
              class_dp: 'DP2',
              vessel: 'Test Vessel',
              location: 'Test Location',
              summary: 'Test Summary',
              status: 'pending',
              severity: 'high',
            },
          ],
          error: null,
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({
        data: {
          result: {
            resumo_tecnico: 'Test technical summary',
            normas_relacionadas: ['IMCA M190'],
            causas_adicionais: ['Test cause'],
            recomendacoes_preventivas: ['Test recommendation'],
            acoes_corretivas: ['Test action'],
            referencias_imca: ['IMCA M190'],
          },
        },
        error: null,
      })),
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DP Intelligence Center', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DPIntelligenceCenter />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main title', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Centro de Inteligência DP')).toBeInTheDocument();
    });
  });

  it('should render incident cards after loading', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Incident')).toBeInTheDocument();
    });
  });

  it('should display statistics cards', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Total de Incidentes')).toBeInTheDocument();
      expect(screen.getByText('Críticos')).toBeInTheDocument();
      expect(screen.getByText('Analisados')).toBeInTheDocument();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
    });
  });

  it('should have filter controls', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar incidentes...')).toBeInTheDocument();
    });
  });

  it('should open analysis modal when clicking analyze button', async () => {
    renderComponent();
    
    await waitFor(() => {
      const analyzeButton = screen.getByText('Analisar com IA');
      fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Análise IA - Incidente DP')).toBeInTheDocument();
    });
  });
});
