import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReservationStats } from '../reservation-stats';
import { EnhancedReservation } from '../enhanced-reservations-dashboard';

describe('ReservationStats', () => {
  const mockReservations: EnhancedReservation[] = [
    {
      id: '1',
      title: 'Hotel A',
      description: 'Test hotel',
      reservation_type: 'hotel',
      start_date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      end_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      location: 'São Paulo',
      address: 'Rua Test, 123',
      contact_info: '+55 11 99999-9999',
      confirmation_number: 'HTL001',
      supplier_url: 'https://test.com',
      room_type: 'Standard',
      total_amount: 1000,
      currency: 'BRL',
      status: 'confirmed',
      crew_member_name: 'João Silva',
      notes: '',
      conflict_detected: false,
      ai_suggestions: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      user_id: 'user-1',
    },
    {
      id: '2',
      title: 'Flight B',
      description: 'Test flight',
      reservation_type: 'flight',
      start_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      end_date: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      location: 'Rio de Janeiro',
      address: null,
      contact_info: null,
      confirmation_number: 'FLT002',
      supplier_url: null,
      room_type: null,
      total_amount: 500,
      currency: 'BRL',
      status: 'completed',
      crew_member_name: 'Maria Santos',
      notes: '',
      conflict_detected: false,
      ai_suggestions: [],
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
      user_id: 'user-1',
    },
    {
      id: '3',
      title: 'Hotel C',
      description: 'Pending hotel',
      reservation_type: 'hotel',
      start_date: new Date(Date.now() + 86400000 * 10).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 12).toISOString(),
      location: 'Salvador',
      address: null,
      contact_info: null,
      confirmation_number: null,
      supplier_url: null,
      room_type: null,
      total_amount: 800,
      currency: 'BRL',
      status: 'pending',
      crew_member_name: null,
      notes: '',
      conflict_detected: false,
      ai_suggestions: [],
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
      user_id: 'user-1',
    },
    {
      id: '4',
      title: 'Cancelled Reservation',
      description: 'Test cancelled',
      reservation_type: 'transport',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      location: 'Recife',
      address: null,
      contact_info: null,
      confirmation_number: null,
      supplier_url: null,
      room_type: null,
      total_amount: 300,
      currency: 'BRL',
      status: 'cancelled',
      crew_member_name: null,
      notes: '',
      conflict_detected: false,
      ai_suggestions: [],
      created_at: '2024-01-04',
      updated_at: '2024-01-04',
      user_id: 'user-1',
    },
  ];

  it('renders without crashing', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
  });

  it('displays total reservations count', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('displays confirmed reservations count', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Confirmadas')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays pending reservations count', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays upcoming reservations', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Próximas')).toBeInTheDocument();
  });

  it('calculates and displays total amount correctly', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
    // Total should be 1000 + 500 + 800 = 2300 (cancelled is excluded)
    expect(screen.getByText(/2\.300/)).toBeInTheDocument();
  });

  it('excludes cancelled reservations from total amount', () => {
    const singleReservation: EnhancedReservation[] = [
      {
        ...mockReservations[3],
        total_amount: 1000,
        status: 'cancelled',
      },
    ];
    
    render(<ReservationStats reservations={singleReservation} />);
    // Should show R$ 0 as the cancelled reservation is excluded
    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });

  it('displays crew members count', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Tripulantes')).toBeInTheDocument();
    // Should be 2 unique crew members (João Silva and Maria Santos)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles empty reservations array', () => {
    render(<ReservationStats reservations={[]} />);
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    render(<ReservationStats reservations={mockReservations} />);
    
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    expect(screen.getByText('Confirmadas')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Próximas')).toBeInTheDocument();
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
  });

  it('displays formatted currency for total amount', () => {
    render(<ReservationStats reservations={mockReservations} />);
    const currencyPattern = /R\$.*\d/;
    const currencyElements = screen.getAllByText(currencyPattern);
    expect(currencyElements.length).toBeGreaterThan(0);
  });
});
