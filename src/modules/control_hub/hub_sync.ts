import { SyncResult } from './types';
import { hubCache } from './hub_cache';
import { hubBridge } from './hub_bridge';
import hubConfig from './hub_config.json';

export class HubSync {
  private config = hubConfig;
  private syncInProgress = false;
  private lastSyncTime?: Date;
  private autoSyncInterval?: NodeJS.Timeout;

  /**
   * Sincroniza dados com BridgeLink
   */
  async sincronizar(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        recordsSent: 0,
        errors: ['Sincronização já em andamento'],
        timestamp: new Date(),
      };
    }

    this.syncInProgress = true;
    console.log('\n🌐 Tentando sincronização com BridgeLink...');

    try {
      // Verifica conexão
      const connection = await hubBridge.checkConnection();
      
      if (!connection.isConnected) {
        console.log('⚠️  Sem conexão com BridgeLink. Dados mantidos no cache.');
        return {
          success: false,
          recordsSent: 0,
          errors: ['Sem conexão com BridgeLink'],
          timestamp: new Date(),
        };
      }

      // Obtém dados pendentes
      const pending = hubCache.getPending();
      
      if (pending.length === 0) {
        console.log('✅ Nenhum dado pendente.');
        this.lastSyncTime = new Date();
        return {
          success: true,
          recordsSent: 0,
          errors: [],
          timestamp: new Date(),
        };
      }

      // Envia dados com retry
      const errors: string[] = [];
      const successIds: string[] = [];

      for (const entry of pending) {
        const result = await hubBridge.sendWithRetry(entry.data);
        
        if (result.success) {
          successIds.push(entry.id);
        } else {
          errors.push(`Falha ao enviar ${entry.id}: ${result.error}`);
        }
      }

      // Marca como sincronizado
      if (successIds.length > 0) {
        hubCache.markAsSynchronized(successIds);
      }

      this.lastSyncTime = new Date();
      console.log(`📤 ${successIds.length} registros enviados em ${this.lastSyncTime.toLocaleString()}`);
      
      if (errors.length > 0) {
        console.warn(`⚠️  ${errors.length} erros durante sincronização`);
      }

      return {
        success: successIds.length > 0,
        recordsSent: successIds.length,
        errors,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro durante sincronização:', error);
      return {
        success: false,
        recordsSent: 0,
        errors: [errorMessage],
        timestamp: new Date(),
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Inicia sincronização automática
   */
  startAutoSync(): void {
    if (this.autoSyncInterval) {
      console.log('⚠️  Auto-sync já está ativo');
      return;
    }

    console.log(`🔄 Iniciando sincronização automática a cada ${this.config.syncInterval}s`);
    
    this.autoSyncInterval = setInterval(() => {
      this.sincronizar();
    }, this.config.syncInterval * 1000);
  }

  /**
   * Para sincronização automática
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = undefined;
      console.log('⏹️  Sincronização automática parada');
    }
  }

  /**
   * Obtém informações sobre a última sincronização
   */
  getLastSyncInfo(): { lastSync?: Date; pending: number; isInProgress: boolean } {
    const pending = hubCache.getPending();
    return {
      lastSync: this.lastSyncTime,
      pending: pending.length,
      isInProgress: this.syncInProgress,
    };
  }

  /**
   * Força sincronização imediata
   */
  async forceSync(): Promise<SyncResult> {
    console.log('🔄 Sincronização forçada');
    return this.sincronizar();
  }
}

export const hubSync = new HubSync();
