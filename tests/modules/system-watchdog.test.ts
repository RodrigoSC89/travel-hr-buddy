/**
 * PATCH 93.0 - System Watchdog Tests
 * Tests for autonomous monitoring and auto-healing capabilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { watchdogService } from '@/modules/system-watchdog/watchdog-service';

describe('System Watchdog Service', () => {
  beforeEach(() => {
    // Clear events before each test
    watchdogService.clearEvents();
  });

  afterEach(() => {
    // Stop service after each test
    watchdogService.stop();
  });

  describe('Service Lifecycle', () => {
    it('should start and stop monitoring', () => {
      watchdogService.start();
      const status = watchdogService.getStatus();
      expect(status.isRunning).toBe(true);

      watchdogService.stop();
      const stoppedStatus = watchdogService.getStatus();
      expect(stoppedStatus.isRunning).toBe(false);
    });

    it('should track service status', () => {
      const status = watchdogService.getStatus();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('totalEvents');
      expect(status).toHaveProperty('recentErrors');
      expect(status).toHaveProperty('lastCheck');
    });
  });

  describe('Health Checks', () => {
    it('should perform Supabase health check', async () => {
      const result = await watchdogService.checkSupabase();
      expect(result).toHaveProperty('service', 'supabase');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toMatch(/^(online|offline|degraded)$/);
    });

    it('should perform AI service health check', async () => {
      const result = await watchdogService.checkAIService();
      expect(result).toHaveProperty('service', 'ai-service');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });

    it('should perform routing health check', async () => {
      const result = await watchdogService.checkRouting();
      expect(result).toHaveProperty('service', 'routing');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });

    it('should run full health check on all services', async () => {
      const results = await watchdogService.runFullHealthCheck();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Should check at least Supabase, AI, and Routing
      const services = results.map(r => r.service);
      expect(services).toContain('supabase');
      expect(services).toContain('ai-service');
      expect(services).toContain('routing');
    });

    it('should measure latency for health checks', async () => {
      const result = await watchdogService.checkSupabase();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Auto-Healing Actions', () => {
    it('should restart a module', async () => {
      const result = await watchdogService.autoRestartModule('test-module');
      expect(typeof result).toBe('boolean');
      
      // Check that an event was logged
      const events = watchdogService.getRecentEvents(10);
      const restartEvent = events.find(e => 
        e.message.includes('test-module') && e.service === 'auto-heal'
      );
      expect(restartEvent).toBeDefined();
    });

    it('should clear cache for a specific module', async () => {
      const result = await watchdogService.clearCache('test-module');
      expect(typeof result).toBe('boolean');
      
      // Check that an event was logged
      const events = watchdogService.getRecentEvents(10);
      const cacheEvent = events.find(e => 
        e.message.includes('Cache cleared') && e.service === 'auto-heal'
      );
      expect(cacheEvent).toBeDefined();
    });

    it('should clear all cache when no module specified', async () => {
      const result = await watchdogService.clearCache();
      expect(typeof result).toBe('boolean');
      
      const events = watchdogService.getRecentEvents(10);
      const cacheEvent = events.find(e => 
        e.message.includes('Cache cleared') && e.service === 'auto-heal'
      );
      expect(cacheEvent).toBeDefined();
    });

    it('should rebuild a route', async () => {
      // Mock window.location.href to prevent actual navigation in tests
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      const result = await watchdogService.rebuildRoute('/test-route');
      expect(typeof result).toBe('boolean');

      // Restore original location
      window.location = originalLocation;
    });
  });

  describe('AI Diagnosis', () => {
    it('should run AI-powered diagnosis', async () => {
      const diagnosis = await watchdogService.runDiagnosis();
      expect(typeof diagnosis).toBe('string');
      expect(diagnosis.length).toBeGreaterThan(0);
    });

    it('should log diagnosis events', async () => {
      await watchdogService.runDiagnosis();
      
      const events = watchdogService.getRecentEvents(10);
      const diagnosisEvent = events.find(e => e.service === 'diagnosis');
      expect(diagnosisEvent).toBeDefined();
    });
  });

  describe('Event Management', () => {
    it('should retrieve recent events', () => {
      const events = watchdogService.getRecentEvents(5);
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeLessThanOrEqual(5);
    });

    it('should retrieve all events', () => {
      const events = watchdogService.getAllEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should clear all events', () => {
      watchdogService.clearEvents();
      const events = watchdogService.getAllEvents();
      expect(events.length).toBe(0);
    });

    it('should limit event history', async () => {
      // Generate more than max events
      for (let i = 0; i < 150; i++) {
        await watchdogService.clearCache(`test-module-${i}`);
      }
      
      const events = watchdogService.getAllEvents();
      expect(events.length).toBeLessThanOrEqual(100);
    });

    it('should order events by timestamp (newest first)', async () => {
      await watchdogService.clearCache('module-1');
      await new Promise(resolve => setTimeout(resolve, 10));
      await watchdogService.clearCache('module-2');
      
      const events = watchdogService.getRecentEvents(2);
      if (events.length >= 2) {
        expect(events[0].timestamp.getTime()).toBeGreaterThanOrEqual(
          events[1].timestamp.getTime()
        );
      }
    });
  });

  describe('Health Check Results', () => {
    it('should include required properties in health check results', async () => {
      const result = await watchdogService.checkSupabase();
      
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should categorize status correctly', async () => {
      const result = await watchdogService.checkSupabase();
      expect(['online', 'offline', 'degraded']).toContain(result.status);
    });
  });

  describe('Event Properties', () => {
    it('should create events with proper structure', async () => {
      await watchdogService.clearCache('test-module');
      
      const events = watchdogService.getRecentEvents(1);
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('service');
      expect(event).toHaveProperty('message');
      expect(event).toHaveProperty('timestamp');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should categorize event types correctly', async () => {
      await watchdogService.clearCache('test');
      
      const events = watchdogService.getRecentEvents(1);
      const event = events[0];
      expect(['error', 'warning', 'info', 'success']).toContain(event.type);
    });
  });
});
