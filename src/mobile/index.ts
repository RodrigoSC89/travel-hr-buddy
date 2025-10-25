/**
 * Nautilus One Mobile App - Main Export
 * Patches 161.0 - 165.0
 */

// PATCH 161.0 - Mobile MVP
export { sqliteStorage } from './services/sqlite-storage';
export { OfflineChecklist } from './components/OfflineChecklist';
export { MissionDashboardComponent } from './components/MissionDashboard';
export type { 
  MobileChecklist, 
  ChecklistItem, 
  MissionDashboard,
  SyncQueueItem,
  OfflineConfig,
  MobileAppState 
} from './types';

// PATCH 162.0 - SmartSync Engine
export { syncQueue } from './services/syncQueue';
export { networkDetector } from './services/networkDetector';
export { useSyncManager } from './hooks/useSyncManager';

// PATCH 165.0 - Mobile AI Core
export { mobileAICore } from './ai';
export { localMemory } from './ai/localMemory';
export { intentParser } from './ai/intentParser';
export { VoiceInterface } from './components/VoiceInterface';
export type { Intent } from './ai/intentParser';
