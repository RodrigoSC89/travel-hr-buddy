/**
 * Tests for BridgeLink communication system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BridgeLink } from '@/core/BridgeLink';

describe('BridgeLink Communication System', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    vi.clearAllMocks();
  });

  it('should emit events', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const eventSpy = vi.spyOn(window, 'dispatchEvent');

    BridgeLink.emit('test:event', { message: 'Hello' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '📡 Emitting event: test:event',
      { message: 'Hello' }
    );
    expect(eventSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    eventSpy.mockRestore();
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    const unsubscribe = BridgeLink.on('test:event', callback);

    BridgeLink.emit('test:event', { data: 'test' });

    expect(callback).toHaveBeenCalledWith({ data: 'test' });

    unsubscribe();
  });

  it('should unsubscribe from events', () => {
    const callback = vi.fn();
    const unsubscribe = BridgeLink.on('test:event', callback);

    // Emit before unsubscribe
    BridgeLink.emit('test:event', { data: 'first' });
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubscribe();

    // Emit after unsubscribe
    BridgeLink.emit('test:event', { data: 'second' });
    expect(callback).toHaveBeenCalledTimes(1); // Should not increase
  });

  it('should handle multiple subscribers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    BridgeLink.on('test:event', callback1);
    BridgeLink.on('test:event', callback2);

    BridgeLink.emit('test:event', { data: 'broadcast' });

    expect(callback1).toHaveBeenCalledWith({ data: 'broadcast' });
    expect(callback2).toHaveBeenCalledWith({ data: 'broadcast' });
  });

  it('should handle events with no data', () => {
    const callback = vi.fn();
    BridgeLink.on('test:event', callback);

    BridgeLink.emit('test:event');

    expect(callback).toHaveBeenCalledWith(undefined);
  });

  it('should handle different event types independently', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    BridgeLink.on('event:one', callback1);
    BridgeLink.on('event:two', callback2);

    BridgeLink.emit('event:one', { data: 'one' });

    expect(callback1).toHaveBeenCalledWith({ data: 'one' });
    expect(callback2).not.toHaveBeenCalled();
  });
});
