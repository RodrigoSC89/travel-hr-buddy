/**
 * Tests for ControlHub page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ControlHub from '@/pages/ControlHub';
import { BridgeLink } from '@/core/BridgeLink';

describe('ControlHub Component', () => {
  it('should render control hub title', () => {
    render(<ControlHub />);
    
    expect(screen.getByText(/Nautilus Control Hub/i)).toBeInTheDocument();
  });

  it('should show waiting message when no events', () => {
    render(<ControlHub />);
    
    expect(screen.getByText(/Aguardando eventos/i)).toBeInTheDocument();
  });

  it('should display events when emitted', async () => {
    render(<ControlHub />);
    
    // Emit a test event
    BridgeLink.emit('nautilus:event', {
      message: 'Test event occurred',
      module: 'MMI'
    });

    await waitFor(() => {
      expect(screen.getByText(/Test event occurred/i)).toBeInTheDocument();
    });
  });

  it('should display module name when provided', async () => {
    render(<ControlHub />);
    
    BridgeLink.emit('nautilus:event', {
      message: 'Job completed',
      module: 'DP Intelligence'
    });

    await waitFor(() => {
      expect(screen.getByText(/DP Intelligence/i)).toBeInTheDocument();
    });
  });

  it('should display timestamp for each event', async () => {
    render(<ControlHub />);
    
    BridgeLink.emit('nautilus:event', {
      message: 'Test event'
    });

    await waitFor(() => {
      // Should contain an ISO timestamp pattern
      const logElement = screen.getByText(/Test event/i).parentElement;
      expect(logElement?.textContent).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  it('should accumulate multiple events', async () => {
    render(<ControlHub />);
    
    BridgeLink.emit('nautilus:event', { message: 'Event 1' });
    BridgeLink.emit('nautilus:event', { message: 'Event 2' });
    BridgeLink.emit('nautilus:event', { message: 'Event 3' });

    await waitFor(() => {
      expect(screen.getByText(/Event 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Event 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Event 3/i)).toBeInTheDocument();
    });
  });

  it('should clean up event listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<ControlHub />);
    
    expect(addEventListenerSpy).toHaveBeenCalled();
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalled();
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
