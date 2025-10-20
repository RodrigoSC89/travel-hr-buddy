import { describe, it, expect, beforeEach } from 'vitest';
import { BridgeLink, BridgeLinkEvent } from '@/core/BridgeLink';
import { NautilusAI } from '@/ai/nautilus-core';

describe('Nautilus Core Alpha', () => {
  beforeEach(() => {
    // Clear event log before each test
    BridgeLink.clearEventLog();
  });

  describe('BridgeLink Event Bus', () => {
    it('should emit and receive events', () => {
      let receivedEvent: BridgeLinkEvent | null = null;

      // Subscribe to test event
      const unsubscribe = BridgeLink.on('system:module:loaded', (event) => {
        receivedEvent = event;
      });

      // Emit event
      BridgeLink.emit('system:module:loaded', 'TestModule', {
        test: 'data'
      });

      // Verify event was received
      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent?.type).toBe('system:module:loaded');
      expect(receivedEvent?.source).toBe('TestModule');
      expect(receivedEvent?.data.test).toBe('data');

      unsubscribe();
    });

    it('should maintain event log', () => {
      BridgeLink.emit('system:module:loaded', 'TestModule1', { id: 1 });
      BridgeLink.emit('system:module:loaded', 'TestModule2', { id: 2 });

      const log = BridgeLink.getEventLog();
      expect(log.length).toBeGreaterThanOrEqual(2);
    });

    it('should provide stats', () => {
      const stats = BridgeLink.getStats();
      expect(stats).toHaveProperty('totalListeners');
      expect(stats).toHaveProperty('eventTypes');
      expect(stats).toHaveProperty('logSize');
    });

    it('should unsubscribe correctly', () => {
      let callCount = 0;
      const handler = () => callCount++;

      const unsubscribe = BridgeLink.on('system:module:loaded', handler);
      
      BridgeLink.emit('system:module:loaded', 'Test', {});
      expect(callCount).toBe(1);

      unsubscribe();
      BridgeLink.emit('system:module:loaded', 'Test', {});
      expect(callCount).toBe(1); // Should not increase
    });
  });

  describe('Nautilus AI Core', () => {
    it('should be instantiated as singleton', () => {
      expect(NautilusAI).toBeDefined();
      expect(NautilusAI.isReady()).toBeDefined();
    });

    it('should load model', async () => {
      const result = await NautilusAI.loadModel();
      expect(result).toBe(true);
      expect(NautilusAI.isReady()).toBe(true);
    });

    it('should analyze input and return result', async () => {
      const result = await NautilusAI.analyze('Test input data');
      
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
      expect(result.metadata).toBeDefined();
    });

    it('should classify input', async () => {
      const categories = ['Category A', 'Category B', 'Category C'];
      const result = await NautilusAI.classify('Test input', categories);

      expect(result.category).toBeDefined();
      expect(categories).toContain(result.category);
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should predict based on historical data', async () => {
      const historicalData = [10, 12, 14, 16, 18];
      const predictions = await NautilusAI.predict(historicalData);

      expect(predictions).toHaveLength(3);
      expect(predictions.every(p => typeof p === 'number')).toBe(true);
    });

    it('should emit BridgeLink events on analysis', async () => {
      let aiEventReceived = false;

      const unsubscribe = BridgeLink.on('ai:analysis:complete', () => {
        aiEventReceived = true;
      });

      await NautilusAI.analyze('Test data');

      expect(aiEventReceived).toBe(true);
      unsubscribe();
    });
  });
});
