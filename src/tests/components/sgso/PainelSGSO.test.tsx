import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PainelSGSO } from '@/components/sgso/PainelSGSO';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockData = [
  {
    embarcacao: 'PSV Atlântico',
    risco: 'baixo',
    total: 2,
    por_mes: { Jan: 0, Fev: 0, Mar: 1 },
  },
  {
    embarcacao: 'OSV Pacífico',
    risco: 'moderado',
    total: 8,
    por_mes: { Jan: 1, Fev: 2, Mar: 1 },
  },
  {
    embarcacao: 'AHTS Brasileiro',
    risco: 'alto',
    total: 15,
    por_mes: { Jan: 3, Fev: 2, Mar: 4 },
  },
];

describe('PainelSGSO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => mockData,
    });
  });

  it('should render the component title', () => {
    render(<PainelSGSO />);
    expect(screen.getByText(/Painel SGSO/i)).toBeInTheDocument();
  });

  it('should render export CSV button', () => {
    render(<PainelSGSO />);
    expect(screen.getByRole('button', { name: /Exportar CSV/i })).toBeInTheDocument();
  });

  it('should fetch and display vessel data', async () => {
    render(<PainelSGSO />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/sgso');
    });

    await waitFor(() => {
      expect(screen.getByText(/PSV Atlântico/i)).toBeInTheDocument();
      expect(screen.getByText(/OSV Pacífico/i)).toBeInTheDocument();
      expect(screen.getByText(/AHTS Brasileiro/i)).toBeInTheDocument();
    });
  });

  it('should display risk levels with correct formatting', async () => {
    render(<PainelSGSO />);
    
    await waitFor(() => {
      expect(screen.getByText(/Risco: BAIXO/i)).toBeInTheDocument();
      expect(screen.getByText(/Risco: MODERADO/i)).toBeInTheDocument();
      expect(screen.getByText(/Risco: ALTO/i)).toBeInTheDocument();
    });
  });

  it('should display total failures for each vessel', async () => {
    render(<PainelSGSO />);
    
    await waitFor(() => {
      expect(screen.getByText(/Falhas críticas: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Falhas críticas: 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Falhas críticas: 15/i)).toBeInTheDocument();
    });
  });

  it('should render monthly comparison chart title', async () => {
    render(<PainelSGSO />);
    
    await waitFor(() => {
      expect(screen.getByText(/Comparativo Mensal de Falhas/i)).toBeInTheDocument();
    });
  });

  it('should call saveAs when export button is clicked', async () => {
    const { saveAs } = await import('file-saver');
    
    render(<PainelSGSO />);
    
    await waitFor(() => {
      expect(screen.getByText(/PSV Atlântico/i)).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /Exportar CSV/i });
    fireEvent.click(exportButton);

    expect(saveAs).toHaveBeenCalled();
  });
});
