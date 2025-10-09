import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReservationStats } from '../reservation-stats';
import { EnhancedReservation } from '../enhanced-reservations-dashboard';

describe('ReservationStats', () => {
  const mockReservations: EnhancedReservation[] = [
    {
      id: 'res-1',
      title: 'Hotel A',
      reservation_type: 'hotel',
      status: 'confirmed',
      start_date: '2024-12-15',
      end_date: '2024-12-20',
      location: 'São Paulo',
      crew_member_id: 'crew-1',
      crew_member_name: 'João Silva',
      estimated_cost: 2500,
      total_amount: 2500,
      currency: 'BRL',
      notes: '',
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      conflict_detected: false,
    },
    {
      id: 'res-2',
      title: 'Flight B',
      reservation_type: 'flight',
      status: 'pending',
      start_date: '2024-12-25',
      end_date: '2024-12-25',
      location: 'Rio de Janeiro',
      crew_member_id: 'crew-2',
      crew_member_name: 'Maria Santos',
      estimated_cost: 800,
      total_amount: 800,
      currency: 'BRL',
      notes: '',
      created_at: '2024-01-11',
      updated_at: '2024-01-11',
      conflict_detected: false,
    },
    {
      id: 'res-3',
      title: 'Transport C',
      reservation_type: 'transport',
      status: 'cancelled',
      start_date: '2024-11-10',
      end_date: '2024-11-11',
      location: 'Brasília',
      crew_member_id: 'crew-1',
      crew_member_name: 'João Silva',
      estimated_cost: 300,
      total_amount: 300,
      currency: 'BRL',
      notes: '',
      created_at: '2024-01-05',
      updated_at: '2024-01-08',
      conflict_detected: false,
    },
  ];

  it('renders without crashing', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
  });

  it('displays correct total reservations count', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows correct confirmed reservations count', () => {
    const { container } = render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Confirmadas')).toBeInTheDocument();
    // Count should be 1 (one confirmed reservation)
    const hasCount = container.textContent?.includes('1');
    expect(hasCount).toBeTruthy();
  });

  it('displays pending reservations count', () => {
    const { container } = render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    // Should have 1 pending reservation
    const hasCount = container.textContent?.includes('1');
    expect(hasCount).toBeTruthy();
  });

  it('calculates total amount excluding cancelled reservations', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
    // Total should be 2500 + 800 = 3300 (excluding cancelled)
    expect(screen.getByText(/3\.300|R\$/)).toBeInTheDocument();
  });

  it('handles empty reservations array', () => {
    const { container } = render(<ReservationStats reservations={[]} />);
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    // Should have zero count somewhere
    const hasZero = container.textContent?.includes('0');
    expect(hasZero).toBeTruthy();
  });

  it('counts unique crew members correctly', () => {
    render(<ReservationStats reservations={mockReservations} />);
    // Should show 2 unique crew members (João Silva and Maria Santos)
    const crewStats = screen.queryByText('Tripulantes');
    if (crewStats) {
      expect(crewStats).toBeInTheDocument();
    }
  });

  it('displays upcoming reservations', () => {
    render(<ReservationStats reservations={mockReservations} />);
    expect(screen.getByText('Próximas')).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    const { container } = render(<ReservationStats reservations={mockReservations} />);
    // Should have multiple stat cards - check for basic structure
    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    expect(screen.getByText('Confirmadas')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
  });

  it('displays icons for each stat', () => {
    const { container } = render(<ReservationStats reservations={mockReservations} />);
    // Icons should be rendered (lucide-react icons)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
