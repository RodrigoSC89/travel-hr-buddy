/**
 * NAUTI ONE — RBAC (Role-Based Access Control)
 * Defines roles, permissions, and access utilities
 * 
 * ROLES are stored in Supabase `user_roles` table (NOT on profiles).
 * This file defines the client-side permission matrix.
 */

import { ROLE_HIERARCHY, type UserRole } from '@/config/sidebar-routes';

// ============================================
// MODULE ACCESS MATRIX
// ============================================

export interface ModulePermission {
  module: string;
  hub: string;
  allowedRoles: UserRole[];
  description: string;
}

export const MODULE_PERMISSIONS: ModulePermission[] = [
  // Command Hub — accessible by leadership
  { module: 'command', hub: 'Command', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager', 'supervisor'], description: 'Central Operacional' },
  { module: 'noc', hub: 'Command', allowedRoles: ['admin', 'manager', 'supervisor'], description: 'NOC 24/7 Monitoring' },
  { module: 'soc', hub: 'Command', allowedRoles: ['admin', 'manager'], description: 'SOC Security Center' },

  // Ops Hub — operations team
  { module: 'ops', hub: 'Ops', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager', 'supervisor', 'coordinator'], description: 'Operações' },
  { module: 'fleet', hub: 'Ops', allowedRoles: ['admin', 'manager', 'supervisor', 'coordinator'], description: 'Fleet Management' },
  { module: 'voyage', hub: 'Ops', allowedRoles: ['admin', 'manager', 'supervisor', 'coordinator'], description: 'Voyage Management' },
  { module: 'logistics', hub: 'Ops', allowedRoles: ['admin', 'manager', 'coordinator'], description: 'Logistics' },

  // Maintenance Hub
  { module: 'maintenance', hub: 'Maintenance', allowedRoles: ['admin', 'department_manager', 'manager', 'supervisor', 'coordinator'], description: 'Manutenção' },
  { module: 'predictive', hub: 'Maintenance', allowedRoles: ['admin', 'manager', 'supervisor'], description: 'Manutenção Preditiva' },

  // AI Hub — restricted
  { module: 'ai', hub: 'AI', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager'], description: 'AI Hub' },
  { module: 'ai-agents', hub: 'AI', allowedRoles: ['admin', 'manager'], description: 'AI Agents' },

  // Tracking Hub
  { module: 'tracking', hub: 'Tracking', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager', 'supervisor', 'coordinator'], description: 'Rastreamento' },

  // Compliance Hub — auditors + leadership
  { module: 'compliance', hub: 'Compliance', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager', 'auditor'], description: 'Compliance' },
  { module: 'audits', hub: 'Compliance', allowedRoles: ['admin', 'manager', 'auditor'], description: 'Auditorias' },

  // Workbench — broad access
  { module: 'documents', hub: 'Workbench', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager', 'supervisor', 'coordinator', 'hr_analyst', 'employee'], description: 'Documentos' },
  { module: 'people', hub: 'Workbench', allowedRoles: ['admin', 'hr_manager', 'hr_analyst', 'department_manager', 'manager'], description: 'People/HR' },
  { module: 'finance', hub: 'Workbench', allowedRoles: ['admin', 'hr_manager', 'department_manager', 'manager'], description: 'Finance' },
  { module: 'system', hub: 'Workbench', allowedRoles: ['admin'], description: 'System Administration' },

  // Settings — admin only
  { module: 'settings', hub: 'System', allowedRoles: ['admin'], description: 'Configurações do Sistema' },
];

/**
 * Check if a role has access to a module
 */
export function hasModuleAccess(userRole: UserRole, module: string): boolean {
  const permission = MODULE_PERMISSIONS.find(p => p.module === module);
  if (!permission) return true; // Unregistered modules default to accessible
  return permission.allowedRoles.includes(userRole);
}

/**
 * Check if a role meets the minimum level
 */
export function meetsMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

/**
 * Get all accessible modules for a role
 */
export function getAccessibleModules(userRole: UserRole): ModulePermission[] {
  return MODULE_PERMISSIONS.filter(p => p.allowedRoles.includes(userRole));
}

/**
 * Get role display name in PT-BR
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: 'Administrador',
    hr_manager: 'Gerente de RH',
    department_manager: 'Gerente de Departamento',
    manager: 'Gerente',
    supervisor: 'Supervisor',
    coordinator: 'Coordenador',
    hr_analyst: 'Analista de RH',
    auditor: 'Auditor',
    employee: 'Colaborador',
  };
  return names[role] || role;
}
