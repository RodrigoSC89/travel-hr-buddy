import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExternalAuditSystem from '@/pages/ExternalAuditSystem';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null }))
      })),
      createBucket: vi.fn(() => Promise.resolve({ error: null }))
    }
  }
}));

// Mock html2pdf
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn(() => ({
      from: vi.fn(() => ({
        save: vi.fn()
      }))
    }))
  }))
}));

describe('ExternalAuditSystem', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders the main page with all tabs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    expect(screen.getByText('External Audit System')).toBeInTheDocument();
    expect(screen.getByText('Audit Simulator')).toBeInTheDocument();
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Evidence Manager')).toBeInTheDocument();
  });

  it('renders system overview cards', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    expect(screen.getByText('AI Audit Simulation')).toBeInTheDocument();
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Evidence Management')).toBeInTheDocument();
  });

  it('renders the audit simulator form', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/Vessel ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vessel Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Audit Type/i)).toBeInTheDocument();
  });
});

describe('AuditSimulator Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('has simulate audit button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', { name: /Simulate Audit/i })).toBeInTheDocument();
  });
});

describe('PerformanceDashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders performance dashboard when switching tabs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    const performanceTab = screen.getByText('Performance Dashboard');
    performanceTab.click();

    await waitFor(() => {
      expect(screen.getByText('Technical Performance Dashboard')).toBeInTheDocument();
    });
  });
});

describe('EvidenceManager Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders evidence manager when switching tabs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExternalAuditSystem />
      </QueryClientProvider>
    );

    const evidenceTab = screen.getByText('Evidence Manager');
    evidenceTab.click();

    await waitFor(() => {
      expect(screen.getByText('Evidence Management System')).toBeInTheDocument();
    });
  });
});
