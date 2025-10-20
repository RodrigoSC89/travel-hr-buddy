/**
 * ControlHub Tests
 * 
 * Tests for the ControlHub component and BridgeLink event system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BridgeLink } from '@/core/BridgeLink';
import ControlHub from '@/pages/ControlHub';

describe('ControlHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Control Hub title', () => {
    render(<ControlHub />);
    expect(screen.getByText(/Nautilus Control Hub/i)).toBeInTheDocument();
  });

  it('should display telemetry status', () => {
    render(<ControlHub />);
    expect(screen.getByText(/Telemetria em Tempo Real/i)).toBeInTheDocument();
  });

  it('should show active status badge', () => {
    render(<ControlHub />);
    expect(screen.getByText('ATIVO')).toBeInTheDocument();
  });
});

describe('BridgeLink Event System', () => {
  it('should emit events', () => {
    const mockListener = vi.fn();
    const unsubscribe = BridgeLink.on('test:event', mockListener);
    
    BridgeLink.emit('test:event', { message: 'Test message' });
    
    expect(mockListener).toHaveBeenCalled();
    unsubscribe();
  });

  it('should pass event data correctly', () => {
    const mockListener = vi.fn();
    const testData = { message: 'Test message', value: 42 };
    const unsubscribe = BridgeLink.on('test:event', mockListener);
    
    BridgeLink.emit('test:event', testData);
    
    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'test:event',
        data: testData,
      })
    );
    unsubscribe();
  });

  it('should unsubscribe correctly', () => {
    const mockListener = vi.fn();
    const unsubscribe = BridgeLink.on('test:event', mockListener);
    
    BridgeLink.emit('test:event', { message: 'First' });
    unsubscribe();
    BridgeLink.emit('test:event', { message: 'Second' });
    
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  it('should handle once subscription', () => {
    const mockListener = vi.fn();
    BridgeLink.once('test:event', mockListener);
    
    BridgeLink.emit('test:event', { message: 'First' });
    BridgeLink.emit('test:event', { message: 'Second' });
    
    expect(mockListener).toHaveBeenCalledTimes(1);
  });
});
