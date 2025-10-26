/**
 * Core Module Exports
 * 
 * Exporta módulos centrais do sistema:
 * - BridgeLink: Sistema de eventos inter-módulos
 * - MQTTClient: Cliente MQTT com auto-reconexão
 * - Context Mesh: Sistema de contexto compartilhado (PATCH 216-220)
 * 
 * @module core
 */

export { BridgeLink, type BridgeLinkEvent, type BridgeLinkEventType } from "./BridgeLink";
export { MQTTClient } from "./MQTTClient";

// PATCH 216-220: Collective Intelligence System Exports
export { contextMesh } from './context/contextMesh';
export type { ContextType, SyncStatus, ContextMessage, ContextSubscription } from './context/contextMesh';

/**
 * Initialize all collective intelligence systems
 */
export async function initializeCollectiveIntelligence(): Promise<void> {
  const { contextMesh } = await import('./context/contextMesh');
  const { distributedDecisionCore } = await import('../ai/distributedDecisionCore');
  const { consciousCore } = await import('../ai/consciousCore');
  const { collectiveLoopEngine } = await import('../ai/feedback/collectiveLoop');

  await contextMesh.initialize();
  await distributedDecisionCore.initialize();
  await consciousCore.initialize();
  await collectiveLoopEngine.initialize();

  // Start monitoring and processing
  consciousCore.startMonitoring();
  collectiveLoopEngine.startProcessing();
}

/**
 * Shutdown all collective intelligence systems
 */
export function shutdownCollectiveIntelligence(): void {
  const { contextMesh } = require('./context/contextMesh');
  const { consciousCore } = require('../ai/consciousCore');
  const { collectiveLoopEngine } = require('../ai/feedback/collectiveLoop');

  consciousCore.stopMonitoring();
  collectiveLoopEngine.stopProcessing();
  contextMesh.shutdown();
}
