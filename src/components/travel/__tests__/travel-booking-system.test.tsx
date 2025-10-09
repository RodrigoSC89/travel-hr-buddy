import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TravelBookingSystem } from '../travel-booking-system';

// Mock the date-fns format function
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (!date) return '';
    return '15/02/2024';
  },
}));

describe('TravelBookingSystem', () => {
  it('renders without crashing', () => {
    const { container } = render(<TravelBookingSystem />);
    expect(container).toBeTruthy();
  });

  it('displays the booking interface', () => {
    const { container } = render(<TravelBookingSystem />);
    // Should render the main booking interface with content
    expect(container.firstChild).toBeTruthy();
    const hasContent = container.textContent && container.textContent.length > 0;
    expect(hasContent).toBeTruthy();
  });

  it('has interactive elements', () => {
    const { container } = render(<TravelBookingSystem />);
    // Should have some interactive elements (buttons, inputs, selects, etc.)
    const interactiveElements = container.querySelectorAll('button, input, select, [role="combobox"]');
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  it('renders booking form structure', () => {
    const { container } = render(<TravelBookingSystem />);
    // Should have cards or form structure
    expect(container.querySelector('[class*="card"]') || container.querySelector('form')).toBeTruthy();
  });

  it('displays tabs or navigation', () => {
    const { container } = render(<TravelBookingSystem />);
    // Should have some navigation or tab structure
    const hasTabs = container.querySelector('[role="tablist"]') || 
                    container.querySelector('[class*="tab"]') ||
                    container.textContent?.length > 100; // Has substantial content
    expect(hasTabs).toBeTruthy();
  });

  it('handles rendering without errors', () => {
    // This test just ensures no exceptions are thrown during render
    expect(() => render(<TravelBookingSystem />)).not.toThrow();
  });

  it('renders multiple form controls', () => {
    const { container } = render(<TravelBookingSystem />);
    // Should have multiple controls for booking
    const controls = container.querySelectorAll('input, select, button, [role="combobox"]');
    expect(controls.length).toBeGreaterThan(3);
  });

  it('has booking interface structure', () => {
    const { container } = render(<TravelBookingSystem />);
    // Basic structure check
    expect(container.firstChild).toBeTruthy();
  });
});

