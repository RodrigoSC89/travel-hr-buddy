import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardAuditorias from '@/pages/admin/dashboard-auditorias';

// Mock fetch
global.fetch = vi.fn();

const mockAuditoriaData = [
  { nome_navio: 'MV Atlantic', total: 5 },
  { nome_navio: 'SS Pacific', total: 3 },
  { nome_navio: 'HMS Victory', total: 8 },
];

describe('DashboardAuditorias Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => mockAuditoriaData,
    });
  });

  it('should render the dashboard title', () => {
    render(
      <BrowserRouter>
        <DashboardAuditorias />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard de Auditorias')).toBeInTheDocument();
  });

  it('should render filter inputs', () => {
    render(
      <BrowserRouter>
        <DashboardAuditorias />
      </BrowserRouter>
    );

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Fim')).toBeInTheDocument();
    expect(screen.getByText('Usuário (ID)')).toBeInTheDocument();
  });

  it('should render filter and export buttons', () => {
    render(
      <BrowserRouter>
        <DashboardAuditorias />
      </BrowserRouter>
    );

    expect(screen.getByText('Filtrar')).toBeInTheDocument();
    expect(screen.getByText('Exportar PDF')).toBeInTheDocument();
  });

  it('should fetch data on mount', async () => {
    render(
      <BrowserRouter>
        <DashboardAuditorias />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auditoria/resumo')
      );
    });
  });
});
