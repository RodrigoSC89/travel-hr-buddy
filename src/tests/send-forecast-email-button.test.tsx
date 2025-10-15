/**
 * SendForecastEmailButton Component Tests
 * Tests for the forecast email button component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SendForecastEmailButton } from '@/components/bi/SendForecastEmailButton';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('SendForecastEmailButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button with correct text', () => {
    render(<SendForecastEmailButton />);
    
    const button = screen.getByRole('button', { name: /Disparar Previsão por E-mail/i });
    expect(button).toBeDefined();
  });

  it('should show loading state when clicked', async () => {
    render(<SendForecastEmailButton />);
    
    const button = screen.getByRole('button', { name: /Disparar Previsão por E-mail/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: /Enviando/i });
      expect(loadingButton).toBeDefined();
    });
  });

  it('should be disabled while loading', async () => {
    render(<SendForecastEmailButton />);
    
    const button = screen.getByRole('button', { name: /Disparar Previsão por E-mail/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: /Enviando/i });
      expect(loadingButton).toBeDisabled();
    });
  });

  it('should have correct emoji icon', () => {
    render(<SendForecastEmailButton />);
    
    const button = screen.getByRole('button', { name: /📧 Disparar Previsão por E-mail/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain('📧');
  });
});
