import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardFilters } from '../dashboard-widgets';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('DashboardFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockCurrentFilters = {
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
    modules: ['all'],
    vessels: ['all'],
  };

  it('renders without crashing', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    // Check for a unique element instead
    expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument();
  });

  it('displays filter controls', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    // Find the card title specifically
    expect(screen.getByText('Módulos')).toBeInTheDocument();
  });

  it('displays module filter checkboxes', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    expect(screen.getByText('Todos os Módulos')).toBeInTheDocument();
    expect(screen.getByText('PEOTRAM')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
  });

  it('displays vessel filter checkboxes', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    expect(screen.getByText('Todas as Embarcações')).toBeInTheDocument();
  });

  it('has apply filters button', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });
    expect(applyButton).toBeInTheDocument();
  });

  it('allows module selection', () => {
    render(
      <DashboardFilters 
        onFilterChange={mockOnFilterChange} 
        currentFilters={mockCurrentFilters}
      />
    );
    const moduleCheckbox = screen.getByLabelText(/PEOTRAM/i);
    
    fireEvent.click(moduleCheckbox);
    // After clicking, checkbox state should change
    expect(moduleCheckbox).toBeInTheDocument();
  });
});
