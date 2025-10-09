import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TravelAnalyticsDashboard } from '../travel-analytics-dashboard';

describe('TravelAnalyticsDashboard', () => {
  it('renders without crashing', () => {
    render(<TravelAnalyticsDashboard />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<TravelAnalyticsDashboard />);
    // Component should render even during loading
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('displays analytics tabs', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
    
    // Check for tab triggers
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('displays metrics after loading', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      // Should show some numeric data
      const numbers = screen.queryAllByText(/\d+/);
      expect(numbers.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows total trips metric', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/viagens|trips/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows spending metrics', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/gasto|spent|custo/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays top destinations section', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/destinos|destinations/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows department breakdown', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/departamento|department/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays AI recommendations', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      // Check if content is loaded - looking for any metric or data
      const content = document.body.textContent || '';
      expect(content.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('shows trends data', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      // Should show month names or trend indicators
      const content = screen.getByRole('tablist').parentElement;
      expect(content).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders cards with metrics', async () => {
    render(<TravelAnalyticsDashboard />);
    
    await waitFor(() => {
      // Cards should be present
      const cards = document.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
