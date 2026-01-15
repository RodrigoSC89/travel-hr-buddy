/**
 * Nautilus Comms - Módulo Unificado de Comunicações
 * PATCH UNIFY-3.0 - Fusão dos módulos de Comunicação
 * 
 * Módulos fundidos:
 * - communication → Nautilus Comms
 * - communication-center → Nautilus Comms
 * (satcom mantido separado para conectividade específica)
 */

// Re-export do CommunicationCenter como módulo unificado
export { CommunicationCenter as default } from "@/modules/communication-center";
