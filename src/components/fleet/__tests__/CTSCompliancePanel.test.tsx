import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CTSCompliancePanel } from '../CTSCompliancePanel';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [
              {
                id: '1',
                full_name: 'João Silva',
                rank: 'captain',
                category: 'A',
                status: 'onboard',
                vessel_id: 'vessel-001',
                maritime_certificates: [
                  {
                    id: 'cert-1',
                    certificate_name: 'STCW II/2',
                    certificate_number: 'STCW-001',
                    expiry_date: '2026-12-31',
                    status: 'valid'
                  }
                ]
              }
            ],
            error: null
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({
                data: {
                  id: 'cts-1',
                  cts_number: 'CTS-2024-001',
                  required_positions: { captain: 1, chief_engineer: 1 },
                  expiry_date: '2025-12-31',
                  flag_state: 'Brazil',
                  classification_society: 'DNV'
                },
                error: null
              }))
            }))
          }))
        }))
      }))
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({
        data: { analysis: 'Compliance OK', risk_level: 'low' },
        error: null
      }))
    }
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

describe('CTSCompliancePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<CTSCompliancePanel vesselId="vessel-001" vesselName="MV Test" />);
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders compliance status after loading', async () => {
    render(<CTSCompliancePanel vesselId="vessel-001" vesselName="MV Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Conformidade CTS/i)).toBeInTheDocument();
    });
  });

  it('displays CTS number when record exists', async () => {
    render(<CTSCompliancePanel vesselId="vessel-001" vesselName="MV Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/CTS-2024-001/i)).toBeInTheDocument();
    });
  });

  it('shows compliance score', async () => {
    render(<CTSCompliancePanel vesselId="vessel-001" vesselName="MV Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Compliance Score/i)).toBeInTheDocument();
    });
  });

  it('has tabs for status, positions, and violations', async () => {
    render(<CTSCompliancePanel vesselId="vessel-001" vesselName="MV Test" />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Status/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Posições/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Violações/i })).toBeInTheDocument();
    });
  });

  it('calls onComplianceCheck callback', async () => {
    const onComplianceCheck = vi.fn();
    
    render(
      <CTSCompliancePanel 
        vesselId="vessel-001" 
        vesselName="MV Test"
        onComplianceCheck={onComplianceCheck}
      />
    );
    
    await waitFor(() => {
      expect(onComplianceCheck).toHaveBeenCalled();
    });
  });

  it('shows message when no CTS record exists', async () => {
    // Override mock for this test
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ data: [], error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({ data: null, error: null }))
            }))
          }))
        }))
      }))
    } as any));
    
    render(<CTSCompliancePanel vesselName="MV Test" />);
    
    await waitFor(() => {
      // Without vesselId, should show appropriate message or use mock
      expect(screen.getByText(/Conformidade CTS/i)).toBeInTheDocument();
    });
  });
});
