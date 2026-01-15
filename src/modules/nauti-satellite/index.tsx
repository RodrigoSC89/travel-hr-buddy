/**
 * Nautilus Satellite - Módulo Unificado de Satélite
 * PATCH UNIFY-3.0 - Fusão dos módulos de Satélite/Tracking
 * 
 * Módulos fundidos:
 * - satellite → Nautilus Satellite
 * - satellite-tracker → Nautilus Satellite
 */

// Re-export do SatelliteTracker como módulo unificado
export { default } from "@/modules/satellite/SatelliteTracker";
