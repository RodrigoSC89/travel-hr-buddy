/**
 * Mirror Instance Controller - PATCH 225
 * 
 * Orquestração e sincronização de instâncias Nautilus distribuídas
 * Controla múltiplos clones em campo com heartbeat e telemetria
 * 
 * @module core/mirrors/instanceController
 */

import { supabase } from '@/integrations/supabase/client';

export type SyncOperation = 'push' | 'pull' | 'bidirectional';
export type InstanceStatus = 'online' | 'offline' | 'syncing' | 'error';
export type SyncPriority = 'low' | 'normal' | 'high' | 'critical';

export interface MirrorInstance {
  id: string;
  name: string;
  environment: string;
  status: InstanceStatus;
  lastHeartbeat: number;
  lastSync?: number;
  syncProgress?: number; // 0-100
  location?: {
    lat: number;
    lon: number;
    description: string;
  };
  metadata: {
    version: string;
    uptime: number;
    cloneOf?: string;
  };
}

export interface SyncConfig {
  operation: SyncOperation;
  priority: SyncPriority;
  selective?: {
    modules?: string[];
    dataSince?: number;
    dataTypes?: string[];
  };
  options?: {
    compress?: boolean;
    encrypt?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
  };
}

export interface SyncResult {
  success: boolean;
  sourceId: string;
  targetId: string;
  operation: SyncOperation;
  itemsSynced: number;
  bytesTransferred: number;
  duration: number;
  errors?: string[];
  timestamp: number;
}

export interface HeartbeatData {
  instanceId: string;
  timestamp: number;
  status: InstanceStatus;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: {
      latency: number;
      bandwidth: number;
    };
  };
  activeModules: string[];
}

export interface TelemetryData {
  instanceId: string;
  period: {
    start: number;
    end: number;
  };
  aggregates: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    uniqueUsers: number;
  };
  events: Array<{
    type: string;
    count: number;
    severity?: string;
  }>;
}

class InstanceController {
  private instances: Map<string, MirrorInstance> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private telemetryInterval?: NodeJS.Timeout;
  private syncQueue: Array<{ sourceId: string; targetId: string; config: SyncConfig }> = [];
  private readonly HEARTBEAT_TIMEOUT = 60000; // 1 minuto
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 segundos

  /**
   * Inicializa o controller
   */
  async initialize(): Promise<void> {
    console.log('[InstanceController] Initializing...');
    
    // Carregar instâncias existentes
    await this.loadInstances();
    
    // Iniciar monitoramento
    this.startHeartbeatMonitoring();
    this.startTelemetryCollection();
    
    console.log('[InstanceController] Initialized');
  }

  /**
   * Registra uma nova instância
   */
  async registerInstance(instance: Omit<MirrorInstance, 'lastHeartbeat'>): Promise<MirrorInstance> {
    const newInstance: MirrorInstance = {
      ...instance,
      lastHeartbeat: Date.now(),
      status: 'online'
    };

    this.instances.set(instance.id, newInstance);

    // Persistir no Supabase
    await supabase.from('clone_registry').insert({
      id: instance.id,
      name: instance.name,
      snapshot_data: { type: 'mirror_instance', ...newInstance },
      created_at: new Date().toISOString()
    });

    console.log(`[InstanceController] Instance registered: ${instance.id}`);
    return newInstance;
  }

  /**
   * Lista todas as instâncias ativas
   */
  listInstances(filter?: { status?: InstanceStatus; environment?: string }): MirrorInstance[] {
    let instances = Array.from(this.instances.values());

    if (filter?.status) {
      instances = instances.filter(i => i.status === filter.status);
    }

    if (filter?.environment) {
      instances = instances.filter(i => i.environment === filter.environment);
    }

    return instances;
  }

  /**
   * Obtém detalhes de uma instância específica
   */
  getInstance(instanceId: string): MirrorInstance | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Obtém status de sincronização
   */
  getSyncStatus(instanceId: string): {
    lastSync?: number;
    syncProgress?: number;
    queuePosition?: number;
  } {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return {};
    }

    const queuePosition = this.syncQueue.findIndex(
      item => item.sourceId === instanceId || item.targetId === instanceId
    );

    return {
      lastSync: instance.lastSync,
      syncProgress: instance.syncProgress,
      queuePosition: queuePosition >= 0 ? queuePosition : undefined
    };
  }

  /**
   * Sincroniza uma instância específica
   */
  async syncInstance(
    instanceId: string,
    targetId: string,
    config: SyncConfig
  ): Promise<SyncResult> {
    const startTime = Date.now();
    
    console.log(`[InstanceController] Syncing ${instanceId} → ${targetId} (${config.operation})`);

    const sourceInstance = this.instances.get(instanceId);
    const targetInstance = this.instances.get(targetId);

    if (!sourceInstance || !targetInstance) {
      throw new Error('Source or target instance not found');
    }

    // Marcar instâncias como syncing
    sourceInstance.status = 'syncing';
    targetInstance.status = 'syncing';

    try {
      // Executar sincronização
      const result = await this.performSync(sourceInstance, targetInstance, config);

      // Atualizar timestamps e progresso
      sourceInstance.lastSync = Date.now();
      targetInstance.lastSync = Date.now();
      sourceInstance.syncProgress = 100;
      targetInstance.syncProgress = 100;
      sourceInstance.status = 'online';
      targetInstance.status = 'online';

      // Auditar
      await this.auditSync(result);

      console.log(`[InstanceController] Sync complete: ${result.itemsSynced} items, ${result.duration}ms`);
      return result;

    } catch (error) {
      sourceInstance.status = 'error';
      targetInstance.status = 'error';

      const result: SyncResult = {
        success: false,
        sourceId: instanceId,
        targetId,
        operation: config.operation,
        itemsSynced: 0,
        bytesTransferred: 0,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };

      await this.auditSync(result);
      throw error;
    }
  }

  /**
   * Sincroniza todas as instâncias
   */
  async syncAll(sourceId: string, config?: SyncConfig): Promise<SyncResult[]> {
    const source = this.instances.get(sourceId);
    if (!source) {
      throw new Error(`Source instance not found: ${sourceId}`);
    }

    const targets = this.listInstances({ status: 'online' }).filter(i => i.id !== sourceId);
    const results: SyncResult[] = [];

    for (const target of targets) {
      try {
        const result = await this.syncInstance(
          sourceId,
          target.id,
          config || { operation: 'bidirectional', priority: 'normal' }
        );
        results.push(result);
      } catch (error) {
        console.error(`[InstanceController] Failed to sync with ${target.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Força push de dados para instância específica
   */
  async forcePush(sourceId: string, targetId: string, data?: unknown): Promise<SyncResult> {
    return this.syncInstance(sourceId, targetId, {
      operation: 'push',
      priority: 'high',
      options: {
        retryOnFailure: true,
        maxRetries: 3
      }
    });
  }

  /**
   * Força pull de dados de instância específica
   */
  async forcePull(sourceId: string, targetId: string): Promise<SyncResult> {
    return this.syncInstance(sourceId, targetId, {
      operation: 'pull',
      priority: 'high',
      options: {
        retryOnFailure: true,
        maxRetries: 3
      }
    });
  }

  /**
   * Processa heartbeat de uma instância
   */
  async processHeartbeat(data: HeartbeatData): Promise<void> {
    const instance = this.instances.get(data.instanceId);
    if (!instance) {
      console.warn(`[InstanceController] Heartbeat from unknown instance: ${data.instanceId}`);
      return;
    }

    instance.lastHeartbeat = data.timestamp;
    instance.status = data.status;
    instance.metadata.uptime = Date.now() - data.timestamp;

    // Verificar se a instância estava offline e agora voltou
    if (data.status === 'online') {
      console.log(`[InstanceController] Instance ${data.instanceId} is online`);
    }
  }

  /**
   * Coleta telemetria de uma instância
   */
  async collectTelemetry(data: TelemetryData): Promise<void> {
    console.log(`[InstanceController] Telemetry from ${data.instanceId}:`, {
      requests: data.aggregates.totalRequests,
      errorRate: data.aggregates.errorRate,
      avgTime: data.aggregates.avgResponseTime
    });

    // Armazenar telemetria no Supabase ou sistema de métricas
    // Por enquanto, apenas log
  }

  /**
   * Remove uma instância
   */
  async removeInstance(instanceId: string): Promise<void> {
    this.instances.delete(instanceId);
    
    await supabase
      .from('clone_registry')
      .delete()
      .eq('id', instanceId);

    console.log(`[InstanceController] Instance removed: ${instanceId}`);
  }

  // Métodos privados

  /**
   * Carrega instâncias do Supabase
   */
  private async loadInstances(): Promise<void> {
    const { data, error } = await supabase
      .from('clone_registry')
      .select('*')
      .like('snapshot_data', '%mirror_instance%');

    if (error) {
      console.error('[InstanceController] Failed to load instances:', error);
      return;
    }

    if (data) {
      for (const row of data) {
        const instanceData = row.snapshot_data as any;
        if (instanceData.type === 'mirror_instance') {
          const instance: MirrorInstance = instanceData;
          this.instances.set(instance.id, instance);
        }
      }
    }

    console.log(`[InstanceController] Loaded ${this.instances.size} instances`);
  }

  /**
   * Inicia monitoramento de heartbeat
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      for (const instance of this.instances.values()) {
        const timeSinceHeartbeat = now - instance.lastHeartbeat;
        
        if (timeSinceHeartbeat > this.HEARTBEAT_TIMEOUT) {
          if (instance.status !== 'offline') {
            console.warn(`[InstanceController] Instance ${instance.id} missed heartbeat`);
            instance.status = 'offline';
          }
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Inicia coleta de telemetria
   */
  private startTelemetryCollection(): void {
    this.telemetryInterval = setInterval(() => {
      // Agregar telemetria de todas as instâncias
      const summary = {
        total: this.instances.size,
        online: this.listInstances({ status: 'online' }).length,
        offline: this.listInstances({ status: 'offline' }).length,
        syncing: this.listInstances({ status: 'syncing' }).length,
        error: this.listInstances({ status: 'error' }).length
      };

      console.log('[InstanceController] Telemetry summary:', summary);
    }, 60000); // 1 minuto
  }

  /**
   * Executa sincronização entre instâncias
   */
  private async performSync(
    source: MirrorInstance,
    target: MirrorInstance,
    config: SyncConfig
  ): Promise<SyncResult> {
    const startTime = Date.now();

    // Simular sincronização
    await this.delay(100);

    const itemsSynced = Math.floor(Math.random() * 100) + 1;
    const bytesTransferred = itemsSynced * 1024;

    return {
      success: true,
      sourceId: source.id,
      targetId: target.id,
      operation: config.operation,
      itemsSynced,
      bytesTransferred,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    };
  }

  /**
   * Audita operação de sincronização
   */
  private async auditSync(result: SyncResult): Promise<void> {
    try {
      await supabase.from('clone_sync_log').insert({
        source_id: result.sourceId,
        target_id: result.targetId,
        operation: result.operation,
        status: result.success ? 'success' : 'failed',
        items_synced: result.itemsSynced,
        bytes_transferred: result.bytesTransferred,
        duration_ms: result.duration,
        errors: result.errors ? JSON.stringify(result.errors) : null,
        created_at: new Date(result.timestamp).toISOString()
      });
    } catch (error) {
      console.warn('[InstanceController] Failed to audit sync:', error);
    }
  }

  /**
   * Helper para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpa recursos
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
    }
    this.instances.clear();
    this.syncQueue = [];
  }
}

// Singleton instance
export const instanceController = new InstanceController();
