/**
 * Tests for ControlHub core orchestration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/lib/utils/logger', () => ({
  Logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe('ControlHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export ControlHub class and singleton', async () => {
    const { ControlHub, controlHub } = await import('@/modules/control/control-hub');
    expect(ControlHub).toBeDefined();
    expect(controlHub).toBeDefined();
    expect(controlHub).toBeInstanceOf(ControlHub);
  });

  it('should initialize and track state', async () => {
    const { ControlHub } = await import('@/modules/control/control-hub');
    const hub = new ControlHub();
    
    expect(hub.isInitialized()).toBe(false);
    await hub.iniciar();
    expect(hub.isInitialized()).toBe(true);
    
    // Cleanup
    hub.parar();
    expect(hub.isInitialized()).toBe(false);
  });

  it('should return state with all expected fields', async () => {
    const { ControlHub } = await import('@/modules/control/control-hub');
    const hub = new ControlHub();
    
    const state = hub.getState();
    expect(state).toHaveProperty('modules');
    expect(state).toHaveProperty('connectionQuality');
    expect(state).toHaveProperty('cacheSize');
    expect(state).toHaveProperty('systemHealth');
  });

  it('should return health check result', async () => {
    const { ControlHub } = await import('@/modules/control/control-hub');
    const hub = new ControlHub();
    
    const health = await hub.getHealth();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('modules');
    expect(health).toHaveProperty('uptime');
  });

  it('should not initialize twice', async () => {
    const { ControlHub } = await import('@/modules/control/control-hub');
    const hub = new ControlHub();
    
    await hub.iniciar();
    await hub.iniciar(); // Should log warning, not throw
    expect(hub.isInitialized()).toBe(true);
    
    hub.parar();
  });
});
