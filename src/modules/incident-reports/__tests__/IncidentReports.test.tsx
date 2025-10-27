import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IncidentReports from '../index';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('IncidentReports', () => {
  it('should render the incident reports page', () => {
    render(<IncidentReports />);
    expect(screen.getByText('Incident Reports')).toBeInTheDocument();
  });

  it('should display statistics cards', async () => {
    render(<IncidentReports />);
    
    // Wait for loading to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('Open Cases')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('should have main navigation tabs', () => {
    render(<IncidentReports />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('All Incidents')).toBeInTheDocument();
  });
});
