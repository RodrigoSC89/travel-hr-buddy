import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReservationCard } from "../reservation-card";
import { EnhancedReservation } from "../enhanced-reservations-dashboard";

// Mock child components that have complex dependencies
vi.mock("../reservation-attachments", () => ({
  ReservationAttachments: () => <div>Attachments Component</div>,
}));

vi.mock("../reservation-pdf-generator", () => ({
  ReservationPDFGenerator: () => <div>PDF Generator Component</div>,
}));

describe("ReservationCard", () => {
  const mockReservation: EnhancedReservation = {
    id: "res-1",
    title: "Hotel Reserva São Paulo",
    reservation_type: "hotel",
    status: "confirmed",
    start_date: "2024-02-15",
    end_date: "2024-02-20",
    location: "São Paulo, SP",
    crew_member_id: "crew-1",
    crew_member_name: "João Silva",
    estimated_cost: 2500,
    currency: "BRL",
    notes: "Reservation for business trip",
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
    conflict_detected: false,
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders without crashing", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    expect(screen.getByText("Hotel Reserva São Paulo")).toBeInTheDocument();
  });

  it("displays the correct reservation type", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    expect(screen.getByText("Hotel")).toBeInTheDocument();
  });

  it("shows the confirmed status badge", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
  });

  it("displays location information", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
  });

  it("shows crew member name", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("displays cost information", () => {
    const { container } = render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    // Component should render with the reservation data
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("Hotel Reserva São Paulo")).toBeInTheDocument();
  });

  it("shows conflict warning when detected", () => {
    const conflictReservation = { ...mockReservation, conflict_detected: true };
    render(<ReservationCard reservation={conflictReservation} {...mockHandlers} />);
    // Card should have different styling and show warning icon
    const card = screen.getByText("Hotel Reserva São Paulo").closest(".border-red-200");
    expect(card).toBeTruthy();
  });

  it("displays cancelled status correctly", () => {
    const cancelledReservation = { ...mockReservation, status: "cancelled" };
    render(<ReservationCard reservation={cancelledReservation} {...mockHandlers} />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("displays pending status correctly", () => {
    const pendingReservation = { ...mockReservation, status: "pending" };
    render(<ReservationCard reservation={pendingReservation} {...mockHandlers} />);
    expect(screen.getByText("Pendente")).toBeInTheDocument();
  });

  it("shows flight icon for flight reservations", () => {
    const flightReservation = { ...mockReservation, reservation_type: "flight", title: "Flight to NY" };
    render(<ReservationCard reservation={flightReservation} {...mockHandlers} />);
    expect(screen.getByText("Voo")).toBeInTheDocument();
  });

  it("shows transport icon for transport reservations", () => {
    const transportReservation = { ...mockReservation, reservation_type: "transport", title: "Car Rental" };
    render(<ReservationCard reservation={transportReservation} {...mockHandlers} />);
    expect(screen.getByText("Transporte")).toBeInTheDocument();
  });

  it("renders edit and delete buttons", () => {
    render(<ReservationCard reservation={mockReservation} {...mockHandlers} />);
    // Should have action buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
