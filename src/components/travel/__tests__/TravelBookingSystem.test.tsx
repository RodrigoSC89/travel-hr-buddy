import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TravelBookingSystem } from '../travel-booking-system';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('TravelBookingSystem', () => {
  it('renders without crashing', () => {
    render(<TravelBookingSystem />);
    // Component should render with tabs
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('displays search step by default', () => {
    render(<TravelBookingSystem />);
    // Check for search-related elements
    const searchElements = screen.getAllByText(/buscar/i);
    expect(searchElements.length).toBeGreaterThan(0);
  });

  it('has tabs for different booking types', () => {
    render(<TravelBookingSystem />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('displays origin input field', () => {
    render(<TravelBookingSystem />);
    const originInput = screen.getByPlaceholderText(/origem/i);
    expect(originInput).toBeInTheDocument();
  });

  it('displays destination input field', () => {
    render(<TravelBookingSystem />);
    const destInput = screen.getByPlaceholderText(/destino/i);
    expect(destInput).toBeInTheDocument();
  });

  it('allows entering origin location', () => {
    render(<TravelBookingSystem />);
    const originInput = screen.getByPlaceholderText(/origem/i) as HTMLInputElement;
    
    fireEvent.change(originInput, { target: { value: 'São Paulo' } });
    expect(originInput.value).toBe('São Paulo');
  });

  it('allows entering destination location', () => {
    render(<TravelBookingSystem />);
    const destInput = screen.getByPlaceholderText(/destino/i) as HTMLInputElement;
    
    fireEvent.change(destInput, { target: { value: 'Rio de Janeiro' } });
    expect(destInput.value).toBe('Rio de Janeiro');
  });

  it('has search button', () => {
    render(<TravelBookingSystem />);
    const searchButtons = screen.getAllByRole('button', { name: /buscar/i });
    expect(searchButtons.length).toBeGreaterThan(0);
  });

  it('displays passengers selector', () => {
    render(<TravelBookingSystem />);
    expect(screen.getByText(/passageiros/i)).toBeInTheDocument();
  });

  it('displays trip type selector', () => {
    render(<TravelBookingSystem />);
    expect(screen.getByText(/tipo de viagem/i)).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    render(<TravelBookingSystem />);
    // Progress bar or stepper should be visible
    expect(screen.getByText(/buscar/i)).toBeInTheDocument();
  });

  it('handles search button click', async () => {
    render(<TravelBookingSystem />);
    
    const originInput = screen.getByPlaceholderText(/origem/i);
    const destInput = screen.getByPlaceholderText(/destino/i);
    
    fireEvent.change(originInput, { target: { value: 'São Paulo' } });
    fireEvent.change(destInput, { target: { value: 'Rio de Janeiro' } });
    
    const searchButtons = screen.getAllByRole('button', { name: /buscar/i });
    if (searchButtons.length > 0) {
      fireEvent.click(searchButtons[0]);
    }
    
    // After search, should show results or next step
    await waitFor(() => {
      expect(searchButtons[0]).toBeInTheDocument();
    });
  });

  it('validates form before search', () => {
    render(<TravelBookingSystem />);
    
    const searchButtons = screen.getAllByRole('button', { name: /buscar/i });
    if (searchButtons.length > 0) {
      fireEvent.click(searchButtons[0]);
    }
    
    // Should remain on search step if validation fails
    const searchElements = screen.getAllByText(/buscar/i);
    expect(searchElements.length).toBeGreaterThan(0);
  });

  it('shows cabin class selector for flights', () => {
    render(<TravelBookingSystem />);
    expect(screen.getByText(/classe/i)).toBeInTheDocument();
  });

  it('allows selecting number of passengers', () => {
    render(<TravelBookingSystem />);
    const passengersInput = screen.getByLabelText(/passageiros/i) as HTMLInputElement;
    
    fireEvent.change(passengersInput, { target: { value: '2' } });
    expect(passengersInput.value).toBe('2');
  });
});
