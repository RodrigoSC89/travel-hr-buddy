/**
 * PATCH 189.0 - Mission Recovery Engine
 * 
 * Automatic recovery system for mission failures and connection losses
 * Features:
 * - State persistence during failures
 * - Auto-recovery on connection restore
 * - Rollback support for failed operations
 * - Mission continuity management
 */

import { offlineStorage } from './offline-storage';
import { networkDetector } from './networkDetector';
import { structuredLogger } from '@/lib/logger/structured-logger';
import { supabase } from '@/integrations/supabase/client';

export interface MissionState {
  missionId: string;
  status: 'active' | 'paused' | 'failed' | 'completed';
  progress: number;
  currentStep: number;
  totalSteps: number;
  data: Record<string, unknown>;
  checkpoints: MissionCheckpoint[];
  startedAt: Date;
  lastUpdated: Date;
  error?: {
    message: string;
    timestamp: Date;
    recoverable: boolean;
  };
}

export interface MissionCheckpoint {
  step: number;
  timestamp: Date;
  data: Record<string, unknown>;
  status: 'completed' | 'failed';
}

export interface RecoveryOptions {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackToLocal?: boolean;
}

class MissionRecoveryEngine {
  private activeMissions: Map<string, MissionState> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private readonly CHECKPOINT_INTERVAL = 30000; // 30 seconds
  private checkpointIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeNetworkListener();
  }

  /**
   * Initialize network status listener for auto-recovery
   */
  private initializeNetworkListener(): void {
    networkDetector.addListener((isOnline) => {
      if (isOnline) {
        this.attemptRecoveryForAllMissions();
      }
    });
  }

  /**
   * Start a new mission with recovery support
   */
  async startMission(
    missionId: string,
    totalSteps: number,
    initialData: Record<string, unknown>
  ): Promise<void> {
    const state: MissionState = {
      missionId,
      status: 'active',
      progress: 0,
      currentStep: 0,
      totalSteps,
      data: initialData,
      checkpoints: [],
      startedAt: new Date(),
      lastUpdated: new Date(),
    };

    this.activeMissions.set(missionId, state);
    await this.persistState(missionId, state);

    // Start auto-checkpointing
    this.startAutoCheckpointing(missionId);

    structuredLogger.info('Mission started with recovery support', { missionId });
  }

  /**
   * Update mission progress
   */
  async updateMissionProgress(
    missionId: string,
    step: number,
    data: Record<string, unknown>
  ): Promise<void> {
    const state = this.activeMissions.get(missionId);
    if (!state) {
      throw new Error(`Mission ${missionId} not found`);
    }

    state.currentStep = step;
    state.progress = (step / state.totalSteps) * 100;
    state.data = { ...state.data, ...data };
    state.lastUpdated = new Date();

    await this.persistState(missionId, state);

    structuredLogger.debug('Mission progress updated', {
      missionId,
      step,
      progress: state.progress,
    });
  }

  /**
   * Create a checkpoint
   */
  async createCheckpoint(missionId: string): Promise<void> {
    const state = this.activeMissions.get(missionId);
    if (!state) return;

    const checkpoint: MissionCheckpoint = {
      step: state.currentStep,
      timestamp: new Date(),
      data: { ...state.data },
      status: 'completed',
    };

    state.checkpoints.push(checkpoint);
    await this.persistState(missionId, state);

    structuredLogger.debug('Mission checkpoint created', {
      missionId,
      step: checkpoint.step,
    });
  }

  /**
   * Handle mission failure
   */
  async handleMissionFailure(
    missionId: string,
    error: Error,
    recoverable: boolean = true
  ): Promise<void> {
    const state = this.activeMissions.get(missionId);
    if (!state) return;

    state.status = 'failed';
    state.error = {
      message: error.message,
      timestamp: new Date(),
      recoverable,
    };

    await this.persistState(missionId, state);

    structuredLogger.error('Mission failed', error, {
      missionId,
      recoverable,
    });

    // Attempt recovery if recoverable
    if (recoverable) {
      await this.attemptRecovery(missionId);
    }
  }

  /**
   * Attempt to recover a failed mission
   */
  async attemptRecovery(
    missionId: string,
    options: RecoveryOptions = {}
  ): Promise<boolean> {
    const {
      autoRetry = true,
      maxRetries = 3,
      retryDelay = 5000,
      fallbackToLocal = true,
    } = options;

    const state = this.activeMissions.get(missionId);
    if (!state || !state.error?.recoverable) {
      return false;
    }

    // Check retry attempts
    const attempts = this.recoveryAttempts.get(missionId) || 0;
    if (attempts >= maxRetries) {
      structuredLogger.warn('Max recovery attempts reached', { missionId });
      return false;
    }

    this.recoveryAttempts.set(missionId, attempts + 1);

    structuredLogger.info('Attempting mission recovery', {
      missionId,
      attempt: attempts + 1,
      maxRetries,
    });

    try {
      // Check network connectivity
      const isOnline = await networkDetector.isOnline();

      if (!isOnline && fallbackToLocal) {
        // Continue in offline mode
        state.status = 'active';
        state.error = undefined;
        await this.persistState(missionId, state);
        
        structuredLogger.info('Mission recovered in offline mode', { missionId });
        return true;
      }

      if (!isOnline && !fallbackToLocal) {
        // Wait for connection and retry
        if (autoRetry) {
          setTimeout(() => this.attemptRecovery(missionId, options), retryDelay);
        }
        return false;
      }

      // Online - restore from last checkpoint
      const lastCheckpoint = state.checkpoints[state.checkpoints.length - 1];
      if (lastCheckpoint) {
        state.currentStep = lastCheckpoint.step;
        state.data = lastCheckpoint.data;
        state.progress = (lastCheckpoint.step / state.totalSteps) * 100;
      }

      state.status = 'active';
      state.error = undefined;
      await this.persistState(missionId, state);

      // Sync with backend
      await this.syncMissionState(missionId, state);

      structuredLogger.info('Mission recovered successfully', { missionId });
      return true;
    } catch (error) {
      structuredLogger.error('Mission recovery failed', error as Error, { missionId });
      
      if (autoRetry) {
        setTimeout(() => this.attemptRecovery(missionId, options), retryDelay);
      }
      
      return false;
    }
  }

  /**
   * Attempt recovery for all failed missions
   */
  private async attemptRecoveryForAllMissions(): Promise<void> {
    const failedMissions = Array.from(this.activeMissions.entries())
      .filter(([_, state]) => state.status === 'failed' && state.error?.recoverable);

    structuredLogger.info('Attempting recovery for all failed missions', {
      count: failedMissions.length,
    });

    for (const [missionId] of failedMissions) {
      await this.attemptRecovery(missionId);
    }
  }

  /**
   * Complete a mission
   */
  async completeMission(missionId: string): Promise<void> {
    const state = this.activeMissions.get(missionId);
    if (!state) return;

    state.status = 'completed';
    state.progress = 100;
    state.currentStep = state.totalSteps;
    await this.persistState(missionId, state);

    // Stop auto-checkpointing
    this.stopAutoCheckpointing(missionId);

    // Sync final state
    await this.syncMissionState(missionId, state);

    // Clean up
    this.activeMissions.delete(missionId);
    this.recoveryAttempts.delete(missionId);

    structuredLogger.info('Mission completed', { missionId });
  }

  /**
   * Restore missions from storage on app start
   */
  async restoreMissions(): Promise<void> {
    try {
      const cached = await offlineStorage.adapter.getAll<MissionState>('missions');
      
      for (const entry of cached) {
        const state = entry.value;
        
        // Only restore active or failed recoverable missions
        if (
          state.status === 'active' ||
          (state.status === 'failed' && state.error?.recoverable)
        ) {
          this.activeMissions.set(state.missionId, state);
          
          if (state.status === 'active') {
            this.startAutoCheckpointing(state.missionId);
          }
        }
      }

      structuredLogger.info('Missions restored from storage', {
        count: this.activeMissions.size,
      });

      // Attempt recovery for failed missions if online
      const isOnline = await networkDetector.isOnline();
      if (isOnline) {
        await this.attemptRecoveryForAllMissions();
      }
    } catch (error) {
      structuredLogger.error('Failed to restore missions', error as Error);
    }
  }

  /**
   * Persist mission state to storage
   */
  private async persistState(missionId: string, state: MissionState): Promise<void> {
    try {
      await offlineStorage.cacheMission(missionId, state);
    } catch (error) {
      structuredLogger.error('Failed to persist mission state', error as Error, { missionId });
    }
  }

  /**
   * Sync mission state with backend
   */
  private async syncMissionState(missionId: string, state: MissionState): Promise<void> {
    try {
      const { error } = await supabase
        .from('missions')
        .upsert({
          id: missionId,
          status: state.status,
          progress: state.progress,
          current_step: state.currentStep,
          total_steps: state.totalSteps,
          data: state.data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      structuredLogger.debug('Mission state synced', { missionId });
    } catch (error) {
      structuredLogger.error('Failed to sync mission state', error as Error, { missionId });
      throw error;
    }
  }

  /**
   * Start auto-checkpointing for a mission
   */
  private startAutoCheckpointing(missionId: string): void {
    const interval = setInterval(() => {
      this.createCheckpoint(missionId);
    }, this.CHECKPOINT_INTERVAL);

    this.checkpointIntervals.set(missionId, interval);
  }

  /**
   * Stop auto-checkpointing for a mission
   */
  private stopAutoCheckpointing(missionId: string): void {
    const interval = this.checkpointIntervals.get(missionId);
    if (interval) {
      clearInterval(interval);
      this.checkpointIntervals.delete(missionId);
    }
  }

  /**
   * Get mission state
   */
  getMissionState(missionId: string): MissionState | undefined {
    return this.activeMissions.get(missionId);
  }

  /**
   * Get all active missions
   */
  getActiveMissions(): MissionState[] {
    return Array.from(this.activeMissions.values());
  }
}

// Export singleton instance
export const missionRecoveryEngine = new MissionRecoveryEngine();
