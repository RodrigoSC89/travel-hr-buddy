/**
 * Nautilus Voyage - Módulo Unificado de Viagem e Rotas
 * PATCH UNIFY-3.0 - Fusão dos módulos de Viagem/Rotas
 * 
 * Módulos fundidos:
 * - voyage-planner → Nautilus Voyage
 * - route-cost-analysis → Nautilus Voyage
 * - resource-availability → Nautilus Voyage
 */

// Re-export do VoyagePlanner como módulo unificado
export { default } from "@/modules/voyage-planner";
