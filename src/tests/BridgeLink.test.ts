/**
 * Tests for BridgeLink Event Bus
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BridgeLink } from '@/core/BridgeLink';

describe('BridgeLink Event Bus', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    vi.clearAllMocks();
  });

  it('should emit an event with data', () => {
    const eventSpy = vi.fn();
    
    // Subscribe to event
    const unsubscribe = BridgeLink.on('test:event', eventSpy);
    
    // Emit event
    BridgeLink.emit('test:event', { message: 'Hello World' });
    
    // Verify event was received
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { message: 'Hello World' },
        timestamp: expect.any(String),
      })
    );
    
    unsubscribe();
  });

  it('should handle multiple subscribers', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    
    const unsub1 = BridgeLink.on('multi:event', spy1);
    const unsub2 = BridgeLink.on('multi:event', spy2);
    
    BridgeLink.emit('multi:event', { value: 42 });
    
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    
    unsub1();
    unsub2();
  });

  it('should unsubscribe correctly', () => {
    const eventSpy = vi.fn();
    
    const unsubscribe = BridgeLink.on('unsub:event', eventSpy);
    
    BridgeLink.emit('unsub:event', { first: true });
    expect(eventSpy).toHaveBeenCalledTimes(1);
    
    // Unsubscribe
    unsubscribe();
    
    // Emit again - should not be called
    BridgeLink.emit('unsub:event', { second: true });
    expect(eventSpy).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('should handle once() subscription', () => {
    const onceSpy = vi.fn();
    
    BridgeLink.once('once:event', onceSpy);
    
    // Emit multiple times
    BridgeLink.emit('once:event', { count: 1 });
    BridgeLink.emit('once:event', { count: 2 });
    BridgeLink.emit('once:event', { count: 3 });
    
    // Should only be called once
    expect(onceSpy).toHaveBeenCalledTimes(1);
    expect(onceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { count: 1 },
      })
    );
  });

  it('should include timestamp in events', () => {
    const eventSpy = vi.fn();
    
    const unsubscribe = BridgeLink.on('time:event', eventSpy);
    
    BridgeLink.emit('time:event', { test: true });
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    );
    
    // Verify timestamp is a valid ISO string
    const timestamp = eventSpy.mock.calls[0][0].timestamp;
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
    
    unsubscribe();
  });

  it('should extract source from event data', () => {
    const eventSpy = vi.fn();
    
    const unsubscribe = BridgeLink.on('source:event', eventSpy);
    
    BridgeLink.emit('source:event', { 
      message: 'Test',
      source: 'TestModule' 
    });
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'TestModule',
      })
    );
    
    unsubscribe();
  });

  it('should emit events without data', () => {
    const eventSpy = vi.fn();
    
    const unsubscribe = BridgeLink.on('empty:event', eventSpy);
    
    BridgeLink.emit('empty:event');
    
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: undefined,
        timestamp: expect.any(String),
      })
    );
    
    unsubscribe();
  });

  it('should handle unsubscribe from once() before event fires', () => {
    const onceSpy = vi.fn();
    
    const unsubscribe = BridgeLink.once('cancel:event', onceSpy);
    
    // Unsubscribe before emitting
    unsubscribe();
    
    BridgeLink.emit('cancel:event', { test: true });
    
    // Should not be called
    expect(onceSpy).not.toHaveBeenCalled();
  });
});
