import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TestDashboard from '@/pages/admin/tests';

// Mock fetch
global.fetch = vi.fn();

describe('TestDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dashboard title', () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));
    render(<TestDashboard />);
    
    const title = screen.getByText(/🧪 Painel de Testes Automatizados/i);
    expect(title).toBeInTheDocument();
  });

  it('should display fallback message when coverage report is not available', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));
    
    render(<TestDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Relatório de cobertura não disponível/i)).toBeInTheDocument();
    });
  });

  it('should display coverage percentage when report is available', async () => {
    const mockHtml = "<span class='strong'>85%</span>";
    (global.fetch as any).mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });
    
    render(<TestDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Cobertura total atual: 85%/i)).toBeInTheDocument();
    });
  });

  it('should render link to full coverage report', () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));
    
    render(<TestDashboard />);
    
    const link = screen.getByRole('link', { name: /Ver relatório de cobertura HTML completo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/coverage/index.html');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
