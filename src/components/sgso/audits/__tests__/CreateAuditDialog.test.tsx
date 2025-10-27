import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateAuditDialog } from '../CreateAuditDialog';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('CreateAuditDialog', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <CreateAuditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Audit')).toBeInTheDocument();
    expect(screen.getByLabelText(/Audit Title/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CreateAuditDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Audit')).not.toBeInTheDocument();
  });

  it('has all required form fields', () => {
    render(
      <CreateAuditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/Audit Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Audit Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Risk Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Criticality/i)).toBeInTheDocument();
  });

  it('calls onOpenChange when cancel button clicked', () => {
    render(
      <CreateAuditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
