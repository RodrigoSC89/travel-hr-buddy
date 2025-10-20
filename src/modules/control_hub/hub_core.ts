import { HubState, HealthStatus, SyncResult } from './types';
import { hubCache } from './hub_cache';
import { hubBridge } from './hub_bridge';
import { hubMonitor } from './hub_monitor';
import { hubSync } from './hub_sync';
import hubConfig from './hub_config.json';

/**
 * Núcleo do Nautilus Control Hub.
 * Orquestra módulos embarcados, cache offline e sincronização via BridgeLink.
 */
export class ControlHub {
  private config = hubConfig;
  private initialized = false;

  /**
   * Inicializa o Control Hub
   */
  async iniciar(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Control Hub já está inicializado');
      return;
    }

    console.log('\n🔱 Nautilus Control Hub iniciado.');
    
    // Verifica conexão inicial
    await hubBridge.checkConnection();
    
    // Inicia sincronização automática se habilitado
    if (this.config.featureFlags.realtimeSync) {
      hubSync.startAutoSync();
    }

    this.initialized = true;
  }

  /**
   * Para o Control Hub
   */
  parar(): void {
    if (!this.initialized) {
      return;
    }

    console.log('⏹️  Parando Control Hub...');
    hubSync.stopAutoSync();
    this.initialized = false;
  }

  /**
   * Obtém estado atual do sistema
   */
  getState(): HubState {
    const connection = hubBridge.getStatus();
    const cacheStats = hubCache.getStats();
    const modules = hubMonitor.getAllStatuses();
    const syncInfo = hubSync.getLastSyncInfo();

    return {
      isOnline: connection.isConnected,
      pendingRecords: cacheStats.pending,
      lastSync: syncInfo.lastSync,
      cacheSize: cacheStats.size,
      modules,
    };
  }

  /**
   * Sincroniza dados com BridgeLink
   */
  async sincronizar(): Promise<SyncResult> {
    return hubSync.sincronizar();
  }

  /**
   * Força sincronização imediata
   */
  async forceSyncronizar(): Promise<SyncResult> {
    return hubSync.forceSync();
  }

  /**
   * Salva dados no cache offline
   */
  salvarOffline(dados: any, module: string): void {
    if (!this.config.featureFlags.offlineCache) {
      console.warn('⚠️  Cache offline está desabilitado');
      return;
    }

    hubCache.salvar(dados, module);
  }

  /**
   * Obtém saúde do sistema
   */
  async getHealth(): Promise<HealthStatus> {
    const connection = await hubBridge.checkConnection();
    const cacheStats = hubCache.getStats();
    const moduleStatuses = hubMonitor.getAllStatuses();
    const systemHealth = hubMonitor.checkSystemHealth();
    const syncInfo = hubSync.getLastSyncInfo();

    return {
      status: systemHealth.status,
      uptime: Math.floor(process.uptime ? process.uptime() : 0),
      modules: Object.values(moduleStatuses),
      cache: {
        size: cacheStats.size,
        pending: cacheStats.pending,
        capacity: this.config.cacheSizeLimit,
      },
      connectivity: {
        online: connection.isConnected,
        quality: connection.quality,
        lastSync: syncInfo.lastSync,
      },
    };
  }

  /**
   * Obtém status dos módulos
   */
  getModuleStatuses(): Record<string, any> {
    return hubMonitor.getAllStatuses();
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return hubCache.getStats();
  }

  /**
   * Obtém configuração atual
   */
  getConfig() {
    return this.config;
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    hubCache.clear();
  }

  /**
   * Verifica se está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Registra erro em um módulo
   */
  registerError(moduleKey: string, error: string): void {
    hubMonitor.registerError(moduleKey, error);
  }

  /**
   * Dashboard simplificado no console
   */
  exibirDashboard(): void {
    const state = this.getState();
    
    console.log('\n📊 Painel Global de Operações');
    console.log('═'.repeat(50));
    
    Object.entries(state.modules).forEach(([key, module]) => {
      const icon = this.getStatusIcon(module.status);
      const perf = module.performance ? ` (${module.performance}% precisão)` : '';
      console.log(` ${icon} ${module.name}: ${module.status}${perf}`);
    });
    
    console.log('\n📡 Conectividade');
    console.log(` - Status: ${state.isOnline ? '🌐 Conectado' : '📴 Offline'}`);
    console.log(` - Pendentes: ${state.pendingRecords} registros`);
    if (state.lastSync) {
      console.log(` - Última Sync: ${state.lastSync.toLocaleString()}`);
    }
    
    console.log('\n💾 Cache');
    const cacheStats = this.getCacheStats();
    console.log(` - Uso: ${cacheStats.usagePercent}% (${this.formatBytes(cacheStats.size)})`);
    console.log(` - Total: ${cacheStats.total} entradas`);
    console.log(` - Pendentes: ${cacheStats.pending}`);
    
    console.log('═'.repeat(50));
  }

  /**
   * Obtém ícone de status
   */
  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'OK': '✅',
      'Online': '🌐',
      'Offline': '📴',
      'Em verificação': '⚙️',
      'Auditoria OK': '✅',
      'Desvio detectado': '⚠️',
      'Error': '❌',
    };
    return icons[status] || '❓';
  }

  /**
   * Formata bytes para formato legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Instância singleton
export const controlHub = new ControlHub();
