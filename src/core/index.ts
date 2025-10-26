/**
 * Core Module Exports
 * 
 * Exporta módulos centrais do sistema:
 * - BridgeLink: Sistema de eventos inter-módulos
 * - MQTTClient: Cliente MQTT com auto-reconexão
 * - AdaptiveUI: Motor de reconfiguração adaptativa de UI (PATCH 222)
 * - CognitiveClone: Gerenciamento de clones cognitivos (PATCH 221)
 * - InstanceController: Controle de instâncias espelhadas (PATCH 225)
 * 
 * @module core
 */

export { BridgeLink, type BridgeLinkEvent, type BridgeLinkEventType } from "./BridgeLink";
export { MQTTClient } from "./MQTTClient";
export * from "./adaptiveUI";
export * from "./clones";
export * from "./mirrors";
