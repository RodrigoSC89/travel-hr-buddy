import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestForecastMockButton } from '@/components/bi/TestForecastMockButton';

describe('TestForecastMockButton', () => {
  it('renders the button correctly', () => {
    render(<TestForecastMockButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🧪 Testar Forecast com Mock');
  });

  it('shows loading state when clicked', async () => {
    // Mock fetch to delay response
    global.fetch = vi.fn(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            json: async () => ({ forecast: 'Test forecast' }),
          } as Response);
        }, 100);
      })
    );

    render(<TestForecastMockButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Executando IA...');
    
    // Wait for the request to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('displays forecast result after successful fetch', async () => {
    const mockForecast = '📊 Previsão para os próximos 2 meses: 65-70 jobs';
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => ({ forecast: mockForecast }),
      } as Response)
    );

    render(<TestForecastMockButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const output = screen.getByText(mockForecast);
      expect(output).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<TestForecastMockButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/Erro ao executar teste/);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('displays "Sem resposta da IA" when forecast is empty', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => ({ forecast: null }),
      } as Response)
    );

    render(<TestForecastMockButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const message = screen.getByText('Sem resposta da IA');
      expect(message).toBeInTheDocument();
    });
  });
});
