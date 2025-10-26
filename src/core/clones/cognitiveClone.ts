/**
 * Cognitive Clone Manager - PATCH 221
 * 
 * Sistema de clonagem cognitiva para instâncias Nautilus
 * Permite criar snapshots do sistema com estado de módulos e contexto LLM
 * 
 * @module core/clones/cognitiveClone
 */

import { supabase } from '@/integrations/supabase/client';

export interface ModuleState {
  moduleId: string;
  moduleName: string;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  version: string;
}

export interface LLMContext {
  conversationHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
}

export interface CognitiveSnapshot {
  id: string;
  name: string;
  description?: string;
  timestamp: number;
  version: string;
  modules: ModuleState[];
  llmContext: LLMContext;
  metadata: {
    createdBy: string;
    environment: string;
    nautilusVersion: string;
    tags?: string[];
  };
}

export interface CloneInstance {
  id: string;
  snapshotId: string;
  name: string;
  environment: 'local' | 'remote' | 'edge';
  status: 'active' | 'paused' | 'stopped' | 'error';
  createdAt: number;
  lastSync?: number;
  userId: string;
}

export interface CloneExportData {
  snapshot: CognitiveSnapshot;
  format: 'json' | 'binary';
  checksum: string;
  exportedAt: number;
}

class CognitiveCloneManager {
  private readonly STORAGE_PREFIX = 'nautilus_clone_';
  private readonly VERSION = '1.0.0';

  /**
   * Cria um snapshot do estado atual do sistema
   */
  async createSnapshot(
    name: string,
    modules: ModuleState[],
    llmContext: LLMContext,
    userId: string,
    description?: string,
    tags?: string[]
  ): Promise<CognitiveSnapshot> {
    const snapshot: CognitiveSnapshot = {
      id: this.generateId(),
      name,
      description,
      timestamp: Date.now(),
      version: this.VERSION,
      modules,
      llmContext,
      metadata: {
        createdBy: userId,
        environment: this.detectEnvironment(),
        nautilusVersion: this.VERSION,
        tags
      }
    };

    // Persistir no Supabase
    const { error } = await supabase
      .from('clone_registry')
      .insert({
        id: snapshot.id,
        name: snapshot.name,
        description: snapshot.description,
        snapshot_data: snapshot,
        user_id: userId,
        created_at: new Date(snapshot.timestamp).toISOString()
      });

    if (error) {
      console.error('[CognitiveClone] Failed to persist snapshot:', error);
      throw new Error(`Failed to create snapshot: ${error.message}`);
    }

    // Também salvar localmente para acesso offline
    this.saveToLocalStorage(snapshot.id, snapshot);

    console.log(`[CognitiveClone] Snapshot created: ${snapshot.id}`);
    return snapshot;
  }

  /**
   * Cria uma instância clone a partir de um snapshot
   */
  async cloneInstance(
    snapshotId: string,
    environment: 'local' | 'remote' | 'edge',
    userId: string,
    name?: string
  ): Promise<CloneInstance> {
    // Buscar snapshot
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    const clone: CloneInstance = {
      id: this.generateId(),
      snapshotId,
      name: name || `${snapshot.name}-clone`,
      environment,
      status: 'active',
      createdAt: Date.now(),
      userId
    };

    // Registrar clone no Supabase
    const { error } = await supabase
      .from('clone_registry')
      .insert({
        id: clone.id,
        name: clone.name,
        snapshot_data: { cloneOf: snapshotId, ...clone },
        user_id: userId,
        created_at: new Date(clone.createdAt).toISOString()
      });

    if (error) {
      console.error('[CognitiveClone] Failed to register clone:', error);
      throw new Error(`Failed to create clone: ${error.message}`);
    }

    console.log(`[CognitiveClone] Clone created: ${clone.id} from snapshot ${snapshotId}`);
    return clone;
  }

  /**
   * Recupera um snapshot do sistema
   */
  async getSnapshot(snapshotId: string): Promise<CognitiveSnapshot | null> {
    // Tentar buscar do localStorage primeiro (offline)
    const localSnapshot = this.getFromLocalStorage(snapshotId);
    if (localSnapshot) {
      return localSnapshot;
    }

    // Buscar do Supabase
    const { data, error } = await supabase
      .from('clone_registry')
      .select('snapshot_data')
      .eq('id', snapshotId)
      .single();

    if (error || !data) {
      console.error('[CognitiveClone] Snapshot not found:', snapshotId);
      return null;
    }

    const snapshot = data.snapshot_data as CognitiveSnapshot;
    // Cachear localmente
    this.saveToLocalStorage(snapshotId, snapshot);
    
    return snapshot;
  }

  /**
   * Lista todos os snapshots disponíveis
   */
  async listSnapshots(userId: string): Promise<CognitiveSnapshot[]> {
    const { data, error } = await supabase
      .from('clone_registry')
      .select('snapshot_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CognitiveClone] Failed to list snapshots:', error);
      return [];
    }

    return (data || []).map(row => row.snapshot_data as CognitiveSnapshot);
  }

  /**
   * Exporta um snapshot para uso offline
   */
  async exportSnapshot(snapshotId: string): Promise<CloneExportData> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    const exportData: CloneExportData = {
      snapshot,
      format: 'json',
      checksum: this.calculateChecksum(snapshot),
      exportedAt: Date.now()
    };

    return exportData;
  }

  /**
   * Importa um snapshot de um export
   */
  async importSnapshot(
    exportData: CloneExportData,
    userId: string
  ): Promise<CognitiveSnapshot> {
    // Validar checksum
    const calculatedChecksum = this.calculateChecksum(exportData.snapshot);
    if (calculatedChecksum !== exportData.checksum) {
      throw new Error('Invalid checksum - snapshot may be corrupted');
    }

    const snapshot = exportData.snapshot;
    
    // Gerar novo ID para evitar conflitos
    const importedSnapshot: CognitiveSnapshot = {
      ...snapshot,
      id: this.generateId(),
      metadata: {
        ...snapshot.metadata,
        createdBy: userId
      }
    };

    // Persistir
    const { error } = await supabase
      .from('clone_registry')
      .insert({
        id: importedSnapshot.id,
        name: `${importedSnapshot.name} (imported)`,
        description: importedSnapshot.description,
        snapshot_data: importedSnapshot,
        user_id: userId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('[CognitiveClone] Failed to import snapshot:', error);
      throw new Error(`Failed to import snapshot: ${error.message}`);
    }

    this.saveToLocalStorage(importedSnapshot.id, importedSnapshot);

    console.log(`[CognitiveClone] Snapshot imported: ${importedSnapshot.id}`);
    return importedSnapshot;
  }

  /**
   * Restaura o estado do sistema a partir de um snapshot
   */
  async restoreFromSnapshot(snapshotId: string): Promise<{
    success: boolean;
    modules: ModuleState[];
    llmContext: LLMContext;
  }> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    console.log(`[CognitiveClone] Restoring from snapshot: ${snapshotId}`);

    return {
      success: true,
      modules: snapshot.modules,
      llmContext: snapshot.llmContext
    };
  }

  /**
   * Remove um snapshot
   */
  async deleteSnapshot(snapshotId: string): Promise<void> {
    const { error } = await supabase
      .from('clone_registry')
      .delete()
      .eq('id', snapshotId);

    if (error) {
      console.error('[CognitiveClone] Failed to delete snapshot:', error);
      throw new Error(`Failed to delete snapshot: ${error.message}`);
    }

    this.removeFromLocalStorage(snapshotId);
    console.log(`[CognitiveClone] Snapshot deleted: ${snapshotId}`);
  }

  // Métodos auxiliares privados

  private generateId(): string {
    return `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectEnvironment(): string {
    if (typeof window === 'undefined') return 'server';
    if (window.location.hostname === 'localhost') return 'development';
    return 'production';
  }

  private calculateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private saveToLocalStorage(id: string, snapshot: CognitiveSnapshot): void {
    try {
      const key = `${this.STORAGE_PREFIX}${id}`;
      localStorage.setItem(key, JSON.stringify(snapshot));
    } catch (error) {
      console.warn('[CognitiveClone] Failed to save to localStorage:', error);
    }
  }

  private getFromLocalStorage(id: string): CognitiveSnapshot | null {
    try {
      const key = `${this.STORAGE_PREFIX}${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('[CognitiveClone] Failed to read from localStorage:', error);
      return null;
    }
  }

  private removeFromLocalStorage(id: string): void {
    try {
      const key = `${this.STORAGE_PREFIX}${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[CognitiveClone] Failed to remove from localStorage:', error);
    }
  }
}

// Singleton instance
export const cognitiveCloneManager = new CognitiveCloneManager();
