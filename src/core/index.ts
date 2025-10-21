/**
 * Core Module Exports
 * 
 * Exporta módulos centrais do sistema:
 * - BridgeLink: Sistema de eventos inter-módulos
 * - MQTTClient: Cliente MQTT com auto-reconexão
 * 
 * @module core
 */

export { BridgeLink, type BridgeLinkEvent, type BridgeLinkEventType } from "./BridgeLink";
export { MQTTClient } from "./MQTTClient";
