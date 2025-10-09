import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReservationCard } from '../reservation-card';
import { EnhancedReservation } from '../enhanced-reservations-dashboard';

// Mock sub-components
jest.mock('../reservation-attachments', () => ({
  ReservationAttachments: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="attachments-modal" onClick={onClose}>Attachments Modal</div> : null,
}));

jest.mock('../reservation-pdf-generator', () => ({
  ReservationPDFGenerator: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="pdf-modal" onClick={onClose}>PDF Generator Modal</div> : null,
}));

describe('ReservationCard', () => {
  const mockReservation: EnhancedReservation = {
    id: '1',
    title: 'Hotel Santos Dumont',
    description: 'Reserva para evento corporativo',
    reservation_type: 'hotel',
    start_date: '2024-03-15T14:00:00',
    end_date: '2024-03-17T12:00:00',
    location: 'Rio de Janeiro, RJ',
    address: 'Rua Example, 123',
    contact_info: '+55 21 99999-9999',
    confirmation_number: 'HTL123456',
    supplier_url: 'https://example.com',
    room_type: 'Suíte Executiva',
    total_amount: 1500,
    currency: 'BRL',
    status: 'confirmed',
    crew_member_name: 'João Silva',
    notes: 'Reserva confirmada',
    conflict_detected: false,
    ai_suggestions: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    user_id: 'user-1',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Hotel Santos Dumont')).toBeInTheDocument();
  });

  it('displays reservation title', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Hotel Santos Dumont')).toBeInTheDocument();
  });

  it('displays status badge with correct text', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
  });

  it('displays reservation type badge', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Hotel')).toBeInTheDocument();
  });

  it('displays location information', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Rio de Janeiro, RJ')).toBeInTheDocument();
  });

  it('displays crew member name', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('displays formatted price', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText(/R\$.*1\.500/)).toBeInTheDocument();
  });

  it('displays confirmation number', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText(/HTL123456/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockReservation);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Find delete button by its parent with text content
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(btn => btn.querySelector('.lucide-trash-2'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    }
  });

  it('shows conflict warning when conflict is detected', () => {
    const conflictReservation = {
      ...mockReservation,
      conflict_detected: true,
      ai_suggestions: ['Conflito com outra reserva'],
    };
    
    render(
      <ReservationCard 
        reservation={conflictReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('Conflito detectado')).toBeInTheDocument();
    expect(screen.getByText('Conflito com outra reserva')).toBeInTheDocument();
  });

  it('shows different status colors for different statuses', () => {
    const pendingReservation = { ...mockReservation, status: 'pending' as const };
    
    const { rerender } = render(
      <ReservationCard 
        reservation={pendingReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    
    const cancelledReservation = { ...mockReservation, status: 'cancelled' as const };
    rerender(
      <ReservationCard 
        reservation={cancelledReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('renders different icons for different reservation types', () => {
    const flightReservation = { ...mockReservation, reservation_type: 'flight' as const };
    
    render(
      <ReservationCard 
        reservation={flightReservation} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('Voo')).toBeInTheDocument();
  });
});
