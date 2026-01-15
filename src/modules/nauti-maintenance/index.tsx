/**
 * Nautilus Maintenance - Módulo Unificado de Manutenção
 * PATCH UNIFY-2.0 - Fusão dos módulos de Manutenção
 * 
 * Módulos fundidos:
 * - maintenance-planner → Nautilus Maintenance
 * - intelligent-maintenance → Nautilus Maintenance
 * - mmi → Nautilus Maintenance
 * - mmi-tasks → Nautilus Maintenance
 * - mmi-forecast → Nautilus Maintenance
 * - mmi-history → Nautilus Maintenance
 * - mmi-jobs-panel → Nautilus Maintenance
 * - mmi-dashboard → Nautilus Maintenance
 */

// Re-export do MaintenancePlanner como módulo unificado
export { default } from "@/modules/maintenance-planner";
