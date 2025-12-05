/**
 * Plugin System - PATCH 960
 * Sistema modular para expansão futura
 */

import { logger } from '@/lib/logger';
import { ComponentType, lazy, LazyExoticComponent } from 'react';

// Plugin types
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  dependencies?: string[];
  permissions?: PluginPermission[];
  routes?: PluginRoute[];
  menuItems?: PluginMenuItem[];
  aiCapabilities?: PluginAICapability[];
  offlineSupport: boolean;
  minSystemVersion: string;
}

export type PluginCategory = 
  | 'fleet' 
  | 'crew' 
  | 'maintenance' 
  | 'safety' 
  | 'compliance' 
  | 'analytics' 
  | 'communication'
  | 'integration'
  | 'ai'
  | 'utility';

export type PluginPermission = 
  | 'read:fleet'
  | 'write:fleet'
  | 'read:crew'
  | 'write:crew'
  | 'read:documents'
  | 'write:documents'
  | 'read:reports'
  | 'write:reports'
  | 'admin'
  | 'ai:query'
  | 'offline:storage';

export interface PluginRoute {
  path: string;
  component: string;
  title: string;
  icon?: string;
  requiredPermissions?: PluginPermission[];
}

export interface PluginMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: string;
  position: 'sidebar' | 'header' | 'tools';
  order?: number;
}

export interface PluginAICapability {
  intentPattern: RegExp;
  handler: string;
  description: string;
  examples: string[];
}

export interface PluginInstance {
  manifest: PluginManifest;
  status: 'active' | 'inactive' | 'error' | 'loading';
  loadedAt?: Date;
  error?: string;
  component?: LazyExoticComponent<ComponentType<any>>;
}

// Plugin API that plugins can use
export interface PluginAPI {
  // Data access
  getData: <T>(table: string, filters?: Record<string, any>) => Promise<T[]>;
  saveData: <T>(table: string, data: T) => Promise<void>;
  
  // UI
  showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  showDialog: (config: { title: string; content: string; actions?: any[] }) => void;
  
  // AI
  queryAI: (prompt: string, context?: string) => Promise<string>;
  
  // Storage
  getLocalStorage: <T>(key: string) => T | null;
  setLocalStorage: <T>(key: string, value: T) => void;
  
  // Navigation
  navigate: (path: string) => void;
  
  // Events
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
}

// Plugin Registry
class PluginRegistry {
  private plugins: Map<string, PluginInstance> = new Map();
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private hooks: Map<string, ((data: any) => any)[]> = new Map();

  /**
   * Register a plugin
   */
  async register(manifest: PluginManifest): Promise<boolean> {
    try {
      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid plugin manifest');
      }

      // Check dependencies
      if (manifest.dependencies) {
        for (const dep of manifest.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Missing dependency: ${dep}`);
          }
        }
      }

      // Create plugin instance
      const instance: PluginInstance = {
        manifest,
        status: 'loading',
        loadedAt: new Date(),
      };

      this.plugins.set(manifest.id, instance);

      // Initialize plugin
      await this.initializePlugin(manifest.id);

      logger.info('[PluginSystem] Plugin registered', { id: manifest.id, name: manifest.name });
      return true;
    } catch (error) {
      logger.error('[PluginSystem] Failed to register plugin', { id: manifest.id, error });
      
      const instance = this.plugins.get(manifest.id);
      if (instance) {
        instance.status = 'error';
        instance.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      return false;
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }

    // Check if other plugins depend on this one
    for (const [id, p] of this.plugins) {
      if (p.manifest.dependencies?.includes(pluginId)) {
        logger.warn('[PluginSystem] Cannot unregister: other plugins depend on it', { 
          pluginId, 
          dependent: id 
        });
        return false;
      }
    }

    this.plugins.delete(pluginId);
    logger.info('[PluginSystem] Plugin unregistered', { id: pluginId });
    return true;
  }

  /**
   * Get all registered plugins
   */
  getAll(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   */
  get(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get plugins by category
   */
  getByCategory(category: PluginCategory): PluginInstance[] {
    return this.getAll().filter(p => p.manifest.category === category);
  }

  /**
   * Get active plugins
   */
  getActive(): PluginInstance[] {
    return this.getAll().filter(p => p.status === 'active');
  }

  /**
   * Enable/disable plugin
   */
  setEnabled(pluginId: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }

    plugin.status = enabled ? 'active' : 'inactive';
    
    this.emit('plugin:statusChanged', { pluginId, enabled });
    return true;
  }

  /**
   * Get all menu items from active plugins
   */
  getMenuItems(position: PluginMenuItem['position']): PluginMenuItem[] {
    const items: PluginMenuItem[] = [];
    
    for (const plugin of this.getActive()) {
      if (plugin.manifest.menuItems) {
        items.push(
          ...plugin.manifest.menuItems.filter(item => item.position === position)
        );
      }
    }
    
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Get all routes from active plugins
   */
  getRoutes(): Array<PluginRoute & { pluginId: string }> {
    const routes: Array<PluginRoute & { pluginId: string }> = [];
    
    for (const plugin of this.getActive()) {
      if (plugin.manifest.routes) {
        routes.push(
          ...plugin.manifest.routes.map(route => ({
            ...route,
            pluginId: plugin.manifest.id,
          }))
        );
      }
    }
    
    return routes;
  }

  /**
   * Register event handler
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)!.add(callback);
    
    return () => {
      this.eventHandlers.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event
   */
  emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[PluginSystem] Event handler error', { event, error });
        }
      });
    }
  }

  /**
   * Register hook
   */
  addHook(hookName: string, callback: (data: any) => any): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName)!.push(callback);
  }

  /**
   * Execute hook
   */
  async executeHook<T>(hookName: string, data: T): Promise<T> {
    const callbacks = this.hooks.get(hookName);
    
    if (!callbacks) {
      return data;
    }

    let result = data;
    
    for (const callback of callbacks) {
      try {
        result = await callback(result);
      } catch (error) {
        logger.error('[PluginSystem] Hook execution error', { hookName, error });
      }
    }
    
    return result;
  }

  private validateManifest(manifest: PluginManifest): boolean {
    const requiredFields = ['id', 'name', 'version', 'category', 'offlineSupport', 'minSystemVersion'];
    
    for (const field of requiredFields) {
      if (!(field in manifest)) {
        logger.error('[PluginSystem] Missing required field in manifest', { field });
        return false;
      }
    }
    
    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      logger.error('[PluginSystem] Invalid version format', { version: manifest.version });
      return false;
    }
    
    return true;
  }

  private async initializePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    // Mark as active
    plugin.status = 'active';
    
    // Emit event
    this.emit('plugin:loaded', { pluginId, manifest: plugin.manifest });
  }
}

export const pluginRegistry = new PluginRegistry();

// Built-in core plugins
export const CORE_PLUGINS: PluginManifest[] = [
  {
    id: 'core.fleet',
    name: 'Gestão de Frota',
    version: '1.0.0',
    description: 'Módulo principal de gestão de embarcações',
    author: 'Nautilus',
    category: 'fleet',
    offlineSupport: true,
    minSystemVersion: '1.0.0',
    permissions: ['read:fleet', 'write:fleet'],
  },
  {
    id: 'core.crew',
    name: 'Gestão de Tripulação',
    version: '1.0.0',
    description: 'Módulo de gestão de tripulação e certificações',
    author: 'Nautilus',
    category: 'crew',
    offlineSupport: true,
    minSystemVersion: '1.0.0',
    permissions: ['read:crew', 'write:crew'],
  },
  {
    id: 'core.maintenance',
    name: 'Manutenção',
    version: '1.0.0',
    description: 'Módulo de manutenção preventiva e corretiva',
    author: 'Nautilus',
    category: 'maintenance',
    offlineSupport: true,
    minSystemVersion: '1.0.0',
    permissions: ['read:fleet', 'write:fleet'],
  },
  {
    id: 'core.ai',
    name: 'IA Assistente',
    version: '1.0.0',
    description: 'Módulo de inteligência artificial embarcada',
    author: 'Nautilus',
    category: 'ai',
    offlineSupport: true,
    minSystemVersion: '1.0.0',
    permissions: ['ai:query'],
  },
];

// Initialize core plugins
export function initializePluginSystem(): void {
  for (const manifest of CORE_PLUGINS) {
    pluginRegistry.register(manifest);
  }
  
  logger.info('[PluginSystem] Core plugins initialized', { count: CORE_PLUGINS.length });
}
