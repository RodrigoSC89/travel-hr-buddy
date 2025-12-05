/**
 * Local Permissions System - PATCH 950
 * Offline-first access control
 */

import { localCrypto } from '@/lib/security/local-crypto';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1-100, higher = more privileges
  permissions: string[]; // Permission IDs
  isSystem: boolean;
}

export interface UserPermissions {
  userId: string;
  roleId: string;
  customPermissions: string[];
  deniedPermissions: string[];
  validUntil?: Date;
  lastSynced?: Date;
  offlineHash?: string;
}

// Built-in permissions
const PERMISSIONS: Permission[] = [
  // Fleet Module
  { id: 'fleet.read', name: 'Visualizar Frota', description: 'Ver embarcações e status', module: 'fleet', actions: ['read'] },
  { id: 'fleet.write', name: 'Editar Frota', description: 'Modificar dados de embarcações', module: 'fleet', actions: ['write'] },
  { id: 'fleet.admin', name: 'Administrar Frota', description: 'Gerenciamento completo', module: 'fleet', actions: ['read', 'write', 'delete', 'admin'] },
  
  // Maintenance Module
  { id: 'maintenance.read', name: 'Ver Manutenção', description: 'Visualizar tarefas e histórico', module: 'maintenance', actions: ['read'] },
  { id: 'maintenance.write', name: 'Registrar Manutenção', description: 'Criar e editar tarefas', module: 'maintenance', actions: ['write'] },
  { id: 'maintenance.approve', name: 'Aprovar Manutenção', description: 'Aprovar ordens de serviço', module: 'maintenance', actions: ['admin'] },
  
  // Crew Module
  { id: 'crew.read', name: 'Ver Tripulação', description: 'Visualizar dados da tripulação', module: 'crew', actions: ['read'] },
  { id: 'crew.write', name: 'Editar Tripulação', description: 'Modificar dados e escalas', module: 'crew', actions: ['write'] },
  { id: 'crew.admin', name: 'Administrar RH', description: 'Gerenciamento completo de RH', module: 'crew', actions: ['read', 'write', 'delete', 'admin'] },
  
  // Reports Module
  { id: 'reports.read', name: 'Ver Relatórios', description: 'Visualizar relatórios', module: 'reports', actions: ['read'] },
  { id: 'reports.create', name: 'Criar Relatórios', description: 'Gerar novos relatórios', module: 'reports', actions: ['write'] },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Exportar em PDF/Excel', module: 'reports', actions: ['write'] },
  
  // Settings Module
  { id: 'settings.read', name: 'Ver Configurações', description: 'Visualizar configurações', module: 'settings', actions: ['read'] },
  { id: 'settings.write', name: 'Alterar Configurações', description: 'Modificar configurações', module: 'settings', actions: ['write'] },
  { id: 'settings.admin', name: 'Administrar Sistema', description: 'Acesso total ao sistema', module: 'settings', actions: ['read', 'write', 'delete', 'admin'] },
  
  // AI Module
  { id: 'ai.use', name: 'Usar IA', description: 'Interagir com assistente IA', module: 'ai', actions: ['read'] },
  { id: 'ai.configure', name: 'Configurar IA', description: 'Personalizar comportamento da IA', module: 'ai', actions: ['write'] },
];

// Built-in roles
const ROLES: Role[] = [
  {
    id: 'operator',
    name: 'Operador',
    description: 'Acesso básico para operações diárias',
    level: 20,
    permissions: ['fleet.read', 'maintenance.read', 'maintenance.write', 'crew.read', 'reports.read', 'ai.use'],
    isSystem: true
  },
  {
    id: 'technician',
    name: 'Técnico',
    description: 'Acesso para manutenção e suporte técnico',
    level: 40,
    permissions: ['fleet.read', 'fleet.write', 'maintenance.read', 'maintenance.write', 'crew.read', 'reports.read', 'reports.create', 'ai.use', 'settings.read'],
    isSystem: true
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Supervisão de operações e equipe',
    level: 60,
    permissions: ['fleet.read', 'fleet.write', 'maintenance.read', 'maintenance.write', 'maintenance.approve', 'crew.read', 'crew.write', 'reports.read', 'reports.create', 'reports.export', 'ai.use', 'settings.read'],
    isSystem: true
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Gerenciamento completo de operações',
    level: 80,
    permissions: ['fleet.admin', 'maintenance.read', 'maintenance.write', 'maintenance.approve', 'crew.admin', 'reports.read', 'reports.create', 'reports.export', 'ai.use', 'ai.configure', 'settings.read', 'settings.write'],
    isSystem: true
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    level: 100,
    permissions: PERMISSIONS.map(p => p.id),
    isSystem: true
  }
];

const STORAGE_KEY = 'nautilus_permissions';
const USER_PERMS_KEY = 'nautilus_user_permissions';

class LocalPermissionsSystem {
  private permissions: Permission[] = [...PERMISSIONS];
  private roles: Role[] = [...ROLES];
  private userPermissions: Map<string, UserPermissions> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load permissions from local storage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(USER_PERMS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([userId, perms]) => {
          this.userPermissions.set(userId, perms as UserPermissions);
        });
      }
    } catch (error) {
      console.warn('Failed to load permissions from storage:', error);
    }
  }

  /**
   * Save permissions to local storage
   */
  private saveToStorage(): void {
    try {
      const data: Record<string, UserPermissions> = {};
      this.userPermissions.forEach((perms, userId) => {
        data[userId] = perms;
      });
      localStorage.setItem(USER_PERMS_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save permissions to storage:', error);
    }
  }

  /**
   * Set current user
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Assign role to user
   */
  assignRole(userId: string, roleId: string): void {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    const existing = this.userPermissions.get(userId);
    const userPerms: UserPermissions = {
      userId,
      roleId,
      customPermissions: existing?.customPermissions || [],
      deniedPermissions: existing?.deniedPermissions || [],
      lastSynced: new Date()
    };

    // Generate offline hash for verification
    const hashData = JSON.stringify({ userId, roleId, perms: role.permissions });
    userPerms.offlineHash = btoa(hashData).slice(0, 32);

    this.userPermissions.set(userId, userPerms);
    this.saveToStorage();
  }

  /**
   * Grant custom permission to user
   */
  grantPermission(userId: string, permissionId: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) {
      throw new Error(`User permissions not found: ${userId}`);
    }

    if (!userPerms.customPermissions.includes(permissionId)) {
      userPerms.customPermissions.push(permissionId);
      // Remove from denied if present
      userPerms.deniedPermissions = userPerms.deniedPermissions.filter(p => p !== permissionId);
      this.saveToStorage();
    }
  }

  /**
   * Deny permission to user
   */
  denyPermission(userId: string, permissionId: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) {
      throw new Error(`User permissions not found: ${userId}`);
    }

    if (!userPerms.deniedPermissions.includes(permissionId)) {
      userPerms.deniedPermissions.push(permissionId);
      // Remove from custom if present
      userPerms.customPermissions = userPerms.customPermissions.filter(p => p !== permissionId);
      this.saveToStorage();
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permissionId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    // Check if explicitly denied
    if (userPerms.deniedPermissions.includes(permissionId)) {
      return false;
    }

    // Check custom permissions
    if (userPerms.customPermissions.includes(permissionId)) {
      return true;
    }

    // Check role permissions
    const role = this.roles.find(r => r.id === userPerms.roleId);
    if (!role) return false;

    return role.permissions.includes(permissionId);
  }

  /**
   * Check if current user has permission
   */
  can(permissionId: string): boolean {
    if (!this.currentUserId) return false;
    return this.hasPermission(this.currentUserId, permissionId);
  }

  /**
   * Check multiple permissions (any)
   */
  canAny(permissionIds: string[]): boolean {
    return permissionIds.some(p => this.can(p));
  }

  /**
   * Check multiple permissions (all)
   */
  canAll(permissionIds: string[]): boolean {
    return permissionIds.every(p => this.can(p));
  }

  /**
   * Get user's effective permissions
   */
  getEffectivePermissions(userId: string): string[] {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];

    const role = this.roles.find(r => r.id === userPerms.roleId);
    const rolePermissions = role?.permissions || [];

    // Combine role + custom, minus denied
    const allPermissions = new Set([...rolePermissions, ...userPerms.customPermissions]);
    userPerms.deniedPermissions.forEach(p => allPermissions.delete(p));

    return Array.from(allPermissions);
  }

  /**
   * Get user's role
   */
  getUserRole(userId: string): Role | undefined {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return undefined;
    return this.roles.find(r => r.id === userPerms.roleId);
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    return [...this.permissions];
  }

  /**
   * Get permissions by module
   */
  getPermissionsByModule(module: string): Permission[] {
    return this.permissions.filter(p => p.module === module);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return [...this.roles];
  }

  /**
   * Create custom role
   */
  createRole(role: Omit<Role, 'isSystem'>): void {
    if (this.roles.find(r => r.id === role.id)) {
      throw new Error(`Role already exists: ${role.id}`);
    }

    this.roles.push({ ...role, isSystem: false });
  }

  /**
   * Verify offline permissions integrity
   */
  verifyIntegrity(userId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms || !userPerms.offlineHash) return false;

    const role = this.roles.find(r => r.id === userPerms.roleId);
    if (!role) return false;

    const hashData = JSON.stringify({ 
      userId: userPerms.userId, 
      roleId: userPerms.roleId, 
      perms: role.permissions 
    });
    const expectedHash = btoa(hashData).slice(0, 32);

    return userPerms.offlineHash === expectedHash;
  }

  /**
   * Export permissions for sync
   */
  exportForSync(): {
    permissions: Permission[];
    roles: Role[];
    userPermissions: UserPermissions[];
  } {
    return {
      permissions: this.permissions.filter(p => !PERMISSIONS.find(bp => bp.id === p.id)),
      roles: this.roles.filter(r => !r.isSystem),
      userPermissions: Array.from(this.userPermissions.values())
    };
  }

  /**
   * Import permissions from sync
   */
  importFromSync(data: {
    permissions?: Permission[];
    roles?: Role[];
    userPermissions?: UserPermissions[];
  }): void {
    if (data.permissions) {
      data.permissions.forEach(p => {
        if (!this.permissions.find(ep => ep.id === p.id)) {
          this.permissions.push(p);
        }
      });
    }

    if (data.roles) {
      data.roles.forEach(r => {
        const existing = this.roles.findIndex(er => er.id === r.id);
        if (existing >= 0) {
          this.roles[existing] = { ...r, isSystem: false };
        } else {
          this.roles.push({ ...r, isSystem: false });
        }
      });
    }

    if (data.userPermissions) {
      data.userPermissions.forEach(up => {
        this.userPermissions.set(up.userId, up);
      });
      this.saveToStorage();
    }
  }

  /**
   * Check if user can escalate privileges
   */
  canEscalate(userId: string, targetRoleId: string): boolean {
    const userRole = this.getUserRole(userId);
    const targetRole = this.roles.find(r => r.id === targetRoleId);

    if (!userRole || !targetRole) return false;

    // Can only assign roles with lower or equal level
    return userRole.level >= targetRole.level;
  }
}

export const localPermissions = new LocalPermissionsSystem();
