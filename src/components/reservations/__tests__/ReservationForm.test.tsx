import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReservationForm } from '../reservation-form';
import { EnhancedReservation } from '../enhanced-reservations-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/use-toast');
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
  },
}));

jest.mock('../reservation-templates', () => ({
  ReservationTemplates: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="templates-modal" onClick={onClose}>Templates</div> : null,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

describe('ReservationForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      session: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      isLoading: false,
    });
    
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    });
  });

  it('renders without crashing when open', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    expect(screen.getByText(/Nova Reserva|Editar Reserva/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ReservationForm 
        isOpen={false} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    expect(screen.queryByText(/Nova Reserva/)).not.toBeInTheDocument();
  });

  it('displays form fields', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    expect(screen.getByLabelText(/Título/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Reserva/)).toBeInTheDocument();
  });

  it('allows text input in title field', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    const titleInput = screen.getByLabelText(/Título/) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test Hotel' } });
    
    expect(titleInput.value).toBe('Test Hotel');
  });

  it('populates form when editing existing reservation', () => {
    const existingReservation: EnhancedReservation = {
      id: '1',
      title: 'Hotel Test',
      description: 'Test description',
      reservation_type: 'hotel',
      start_date: '2024-03-15T14:00:00',
      end_date: '2024-03-17T12:00:00',
      location: 'São Paulo',
      address: 'Rua Test, 123',
      contact_info: '+55 11 99999-9999',
      confirmation_number: 'HTL123',
      supplier_url: 'https://test.com',
      room_type: 'Standard',
      total_amount: 1000,
      currency: 'BRL',
      status: 'confirmed',
      crew_member_name: null,
      notes: 'Test notes',
      conflict_detected: false,
      ai_suggestions: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      user_id: 'user-1',
    };
    
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={existingReservation} 
        onSaved={mockOnSaved} 
      />
    );
    
    const titleInput = screen.getByLabelText(/Título/) as HTMLInputElement;
    expect(titleInput.value).toBe('Hotel Test');
  });

  it('has save button', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('has cancel button', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows selecting reservation type', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    const typeSelect = screen.getByLabelText(/Tipo de Reserva/);
    expect(typeSelect).toBeInTheDocument();
  });

  it('shows templates button', () => {
    render(
      <ReservationForm 
        isOpen={true} 
        onClose={mockOnClose} 
        reservation={null} 
        onSaved={mockOnSaved} 
      />
    );
    
    const templatesButton = screen.getByText(/templates/i);
    expect(templatesButton).toBeInTheDocument();
  });
});
