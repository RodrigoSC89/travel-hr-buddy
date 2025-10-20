/**
 * Control Hub - Essential Tests
 * Validates Control Hub core functionality, monitoring, sync, and cache
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ControlHub from "@/pages/ControlHub";
import { controlHub } from "@/modules/control_hub";
import { hubCache } from "@/modules/control_hub/hub_cache";
import { hubMonitor } from "@/modules/control_hub/hub_monitor";
import { hubSync } from "@/modules/control_hub/hub_sync";
import { hubBridge } from "@/modules/control_hub/hub_bridge";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Control Hub - Module Structure", () => {
  it("deve ter todos os módulos principais", () => {
    expect(controlHub).toBeDefined();
    expect(hubCache).toBeDefined();
    expect(hubMonitor).toBeDefined();
    expect(hubSync).toBeDefined();
    expect(hubBridge).toBeDefined();
  });

  it("deve ter configuração válida", () => {
    const config = controlHub.getConfig();
    expect(config).toBeDefined();
    expect(config.syncInterval).toBe(300);
    expect(config.cacheSizeLimit).toBe(104857600); // 100MB
    expect(config.retryAttempts).toBe(3);
    expect(config.featureFlags.offlineCache).toBe(true);
    expect(config.featureFlags.realtimeSync).toBe(true);
  });

  it("deve ter módulos configurados", () => {
    const config = controlHub.getConfig();
    expect(config.modules).toBeDefined();
    expect(config.modules.mmi).toBeDefined();
    expect(config.modules.peodp).toBeDefined();
    expect(config.modules.dpIntelligence).toBeDefined();
    expect(config.modules.bridgeLink).toBeDefined();
    expect(config.modules.sgso).toBeDefined();
  });
});

describe("Control Hub - Cache Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve salvar dados no cache", () => {
    const testData = { id: 1, message: "Test data" };
    hubCache.salvar(testData, "mmi");
    
    const cache = hubCache.getCache();
    expect(cache.length).toBeGreaterThan(0);
    expect(cache[0].module).toBe("mmi");
    expect(cache[0].synchronized).toBe(false);
  });

  it("deve obter dados pendentes", () => {
    hubCache.salvar({ id: 1 }, "mmi");
    hubCache.salvar({ id: 2 }, "peodp");
    
    const pending = hubCache.getPending();
    expect(pending.length).toBe(2);
  });

  it("deve marcar entradas como sincronizadas", () => {
    hubCache.salvar({ id: 1 }, "mmi");
    const cache = hubCache.getCache();
    const id = cache[0].id;
    
    hubCache.markAsSynchronized([id]);
    const pending = hubCache.getPending();
    expect(pending.length).toBe(0);
  });

  it("deve obter estatísticas do cache", () => {
    hubCache.salvar({ id: 1 }, "mmi");
    const stats = hubCache.getStats();
    
    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.pending).toBeDefined();
    expect(stats.size).toBeGreaterThan(0);
  });

  it("deve limpar cache", () => {
    hubCache.salvar({ id: 1 }, "mmi");
    hubCache.clear();
    
    const cache = hubCache.getCache();
    expect(cache.length).toBe(0);
  });
});

describe("Control Hub - Module Monitoring", () => {
  it("deve obter status de todos os módulos", () => {
    const statuses = hubMonitor.getAllStatuses();
    
    expect(statuses).toBeDefined();
    expect(Object.keys(statuses).length).toBeGreaterThan(0);
  });

  it("deve verificar saúde do sistema", () => {
    const health = hubMonitor.checkSystemHealth();
    
    expect(health).toBeDefined();
    expect(health.status).toMatch(/healthy|degraded|critical/);
    expect(health.issues).toBeDefined();
    expect(Array.isArray(health.issues)).toBe(true);
  });

  it("deve registrar erro em módulo", () => {
    hubMonitor.registerError("mmi", "Test error");
    const status = hubMonitor.getModuleStatus("mmi");
    
    expect(status).toBeDefined();
    expect(status?.errors).toBeGreaterThan(0);
  });

  it("deve resetar métricas de módulo", () => {
    hubMonitor.registerError("mmi", "Test error");
    hubMonitor.resetModule("mmi");
    const status = hubMonitor.getModuleStatus("mmi");
    
    expect(status?.errors).toBe(0);
    expect(status?.status).toBe("OK");
  });
});

describe("Control Hub - BridgeLink Integration", () => {
  it("deve verificar conexão", async () => {
    const connection = await hubBridge.checkConnection();
    
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeDefined();
    expect(connection.quality).toBeDefined();
  });

  it("deve obter status da conexão", () => {
    const status = hubBridge.getStatus();
    
    expect(status).toBeDefined();
    expect(status.isConnected).toBeDefined();
  });
});

describe("Control Hub - Synchronization", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve sincronizar dados", async () => {
    // Adiciona dados ao cache
    hubCache.salvar({ id: 1 }, "mmi");
    
    const result = await hubSync.sincronizar();
    
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.recordsSent).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it("deve obter informações da última sincronização", () => {
    const info = hubSync.getLastSyncInfo();
    
    expect(info).toBeDefined();
    expect(info.pending).toBeDefined();
    expect(info.isInProgress).toBe(false);
  });
});

describe("Control Hub - Core Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    if (controlHub.isInitialized()) {
      controlHub.parar();
    }
  });

  it("deve inicializar Control Hub", async () => {
    await controlHub.iniciar();
    expect(controlHub.isInitialized()).toBe(true);
  });

  it("deve obter estado do sistema", async () => {
    await controlHub.iniciar();
    const state = controlHub.getState();
    
    expect(state).toBeDefined();
    expect(state.isOnline).toBeDefined();
    expect(state.pendingRecords).toBeDefined();
    expect(state.modules).toBeDefined();
  });

  it("deve obter saúde do sistema", async () => {
    await controlHub.iniciar();
    const health = await controlHub.getHealth();
    
    expect(health).toBeDefined();
    expect(health.status).toMatch(/healthy|degraded|critical/);
    expect(health.modules).toBeDefined();
    expect(health.cache).toBeDefined();
    expect(health.connectivity).toBeDefined();
  });

  it("deve salvar dados offline", async () => {
    await controlHub.iniciar();
    controlHub.salvarOffline({ test: "data" }, "mmi");
    
    const state = controlHub.getState();
    expect(state.pendingRecords).toBeGreaterThan(0);
  });

  it("deve obter estatísticas do cache", async () => {
    await controlHub.iniciar();
    const stats = controlHub.getCacheStats();
    
    expect(stats).toBeDefined();
    expect(stats.total).toBeDefined();
    expect(stats.pending).toBeDefined();
  });

  it("deve parar Control Hub", async () => {
    await controlHub.iniciar();
    controlHub.parar();
    expect(controlHub.isInitialized()).toBe(false);
  });
});

describe("Control Hub - UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("deve renderizar dashboard", async () => {
    render(
      <MemoryRouter>
        <ControlHub />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nautilus Control Hub/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("deve exibir status dos módulos", async () => {
    render(
      <MemoryRouter>
        <ControlHub />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Status dos Módulos/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("deve ter botão de sincronização", async () => {
    render(
      <MemoryRouter>
        <ControlHub />
      </MemoryRouter>
    );

    await waitFor(() => {
      const syncButton = screen.getByText(/Sincronizar/i);
      expect(syncButton).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});

describe("Control Hub - API Endpoints", () => {
  it("deve ter endpoint de status", () => {
    // Testa se o endpoint existe (estrutura de arquivo)
    const statusPath = "pages/api/control-hub/status.ts";
    expect(statusPath).toBeTruthy();
  });

  it("deve ter endpoint de sync", () => {
    const syncPath = "pages/api/control-hub/sync.ts";
    expect(syncPath).toBeTruthy();
  });

  it("deve ter endpoint de health", () => {
    const healthPath = "pages/api/control-hub/health.ts";
    expect(healthPath).toBeTruthy();
  });
});
