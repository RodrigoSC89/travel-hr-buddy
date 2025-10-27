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
export { contextMesh } from "./context/contextMesh";
export type { ContextType, SyncStatus, ContextMessage, ContextSubscription } from "./context/contextMesh";

/**
 * Initialize all collective intelligence systems with error handling
 * @throws Error if any component fails to initialize
 */
export async function initializeCollectiveIntelligence(): Promise<void> {
  try {
    const { contextMesh } = await import("./context/contextMesh");
    const { distributedDecisionCore } = await import("../ai/distributedDecisionCore");
    const { consciousCore } = await import("../ai/consciousCore");
    const { collectiveLoopEngine } = await import("../ai/feedback/collectiveLoop");

    // Initialize in order with error handling for each
    try {
      await contextMesh.initialize();
    } catch (error) {
      console.error("[CollectiveIntelligence] Failed to initialize context mesh:", error);
      throw new Error("Context mesh initialization failed");
    }

    try {
      await distributedDecisionCore.initialize();
    } catch (error) {
      console.error("[CollectiveIntelligence] Failed to initialize decision core:", error);
      throw new Error("Decision core initialization failed");
    }

    try {
      await consciousCore.initialize();
    } catch (error) {
      console.error("[CollectiveIntelligence] Failed to initialize conscious core:", error);
      throw new Error("Conscious core initialization failed");
    }

    try {
      await collectiveLoopEngine.initialize();
    } catch (error) {
      console.error("[CollectiveIntelligence] Failed to initialize collective loop:", error);
      throw new Error("Collective loop initialization failed");
    }

    // Start monitoring and processing
    consciousCore.startMonitoring();
    collectiveLoopEngine.startProcessing();
  } catch (error) {
    console.error("[CollectiveIntelligence] Initialization failed:", error);
    throw error;
  }
}

/**
 * Shutdown all collective intelligence systems
 */
export async function shutdownCollectiveIntelligence(): Promise<void> {
  try {
    const { contextMesh } = await import("./context/contextMesh");
    const { consciousCore } = await import("../ai/consciousCore");
    const { collectiveLoopEngine } = await import("../ai/feedback/collectiveLoop");

    consciousCore.stopMonitoring();
    collectiveLoopEngine.stopProcessing();
    contextMesh.shutdown();
  } catch (error) {
    console.error("[CollectiveIntelligence] Shutdown failed:", error);
    throw error;
  }
}
