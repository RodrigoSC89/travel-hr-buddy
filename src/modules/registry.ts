/**
 * Module Registry - PATCH 68.0
 * Centralized registry for all application modules
 * 
 * This registry provides:
 * - Single source of truth for module definitions
 * - Metadata for each module (name, category, status)
 * - Dependency tracking
 * - Lazy loading configuration
 */

export type ModuleStatus = 'active' | 'deprecated' | 'beta' | 'experimental';

export type ModuleCategory =
  | 'core'
  | 'operations'
  | 'compliance'
  | 'intelligence'
  | 'emergency'
  | 'logistics'
  | 'planning'
  | 'hr'
  | 'maintenance'
  | 'connectivity'
  | 'workspace'
  | 'assistants'
  | 'finance'
  | 'documents'
  | 'configuration'
  | 'features';

export interface ModuleDefinition {
  /** Unique module identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Module category */
  category: ModuleCategory;
  
  /** Import path relative to src/ */
  path: string;
  
  /** Brief description */
  description: string;
  
  /** Current status */
  status: ModuleStatus;
  
  /** Module dependencies (module IDs) */
  dependencies?: string[];
  
  /** Whether to lazy load (default: true) */
  lazy?: boolean;
  
  /** Route path if applicable */
  route?: string;
  
  /** Icon name (Lucide React) */
  icon?: string;
  
  /** Required permissions */
  permissions?: string[];
  
  /** Version */
  version?: string;
}

/**
 * Central Module Registry
 * All application modules must be registered here
 */
export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  // ===== CORE MODULES =====
  'core.dashboard': {
    id: 'core.dashboard',
    name: 'Dashboard',
    category: 'core',
    path: 'modules/ui/dashboard/Dashboard',
    description: 'Main application dashboard',
    status: 'active',
    route: '/dashboard',
    icon: 'LayoutDashboard',
    lazy: true,
  },

  'core.shared': {
    id: 'core.shared',
    name: 'Shared Components',
    category: 'core',
    path: 'modules/shared',
    description: 'Shared components and utilities',
    status: 'deprecated',
    lazy: false,
  },

  // ===== OPERATIONS =====
  'operations.crew': {
    id: 'operations.crew',
    name: 'Crew Management',
    category: 'operations',
    path: 'modules/operations/crew',
    description: 'Manage crew members and assignments',
    status: 'active',
    route: '/crew',
    icon: 'Users',
    lazy: true,
  },

  'operations.fleet': {
    id: 'operations.fleet',
    name: 'Fleet Management',
    category: 'operations',
    path: 'modules/operations/fleet',
    description: 'Manage fleet and vessels',
    status: 'active',
    route: '/fleet',
    icon: 'Ship',
    lazy: true,
  },

  'operations.performance': {
    id: 'operations.performance',
    name: 'Performance Monitoring',
    category: 'operations',
    path: 'modules/operations/performance',
    description: 'Monitor operational performance',
    status: 'active',
    route: '/performance',
    icon: 'TrendingUp',
    lazy: true,
  },

  'operations.crew-wellbeing': {
    id: 'operations.crew-wellbeing',
    name: 'Crew Wellbeing',
    category: 'operations',
    path: 'modules/operations/crew-wellbeing',
    description: 'Monitor crew health and wellbeing',
    status: 'active',
    route: '/crew-wellbeing',
    icon: 'Heart',
    lazy: true,
  },

  'operations.maritime-system': {
    id: 'operations.maritime-system',
    name: 'Maritime System',
    category: 'operations',
    path: 'modules/operations/maritime-system/MaritimeSystem',
    description: 'Maritime operations management',
    status: 'active',
    route: '/maritime',
    icon: 'Ship',
    lazy: true,
  },

  // ===== COMPLIANCE =====
  'compliance.reports': {
    id: 'compliance.reports',
    name: 'Compliance Reports',
    category: 'compliance',
    path: 'modules/compliance/reports',
    description: 'Generate compliance reports',
    status: 'active',
    route: '/compliance/reports',
    icon: 'FileText',
    lazy: true,
  },

  'compliance.audit-center': {
    id: 'compliance.audit-center',
    name: 'Audit Center',
    category: 'compliance',
    path: 'modules/compliance/audit-center',
    description: 'Manage audits and inspections',
    status: 'active',
    route: '/compliance/audit',
    icon: 'ClipboardCheck',
    lazy: true,
  },

  'compliance.hub': {
    id: 'compliance.hub',
    name: 'Compliance Hub',
    category: 'compliance',
    path: 'modules/compliance/compliance-hub',
    description: 'Central compliance management',
    status: 'active',
    route: '/compliance/hub',
    icon: 'Shield',
    lazy: true,
  },

  // ===== INTELLIGENCE =====
  'intelligence.ai-insights': {
    id: 'intelligence.ai-insights',
    name: 'AI Insights',
    category: 'intelligence',
    path: 'modules/intelligence/ai-insights',
    description: 'AI-powered insights and analytics',
    status: 'active',
    route: '/intelligence/insights',
    icon: 'Brain',
    lazy: true,
  },

  'intelligence.analytics': {
    id: 'intelligence.analytics',
    name: 'Analytics Core',
    category: 'intelligence',
    path: 'modules/intelligence/analytics-core',
    description: 'Core analytics engine',
    status: 'active',
    route: '/intelligence/analytics',
    icon: 'BarChart3',
    lazy: true,
  },

  'intelligence.automation': {
    id: 'intelligence.automation',
    name: 'Automation',
    category: 'intelligence',
    path: 'modules/intelligence/automation',
    description: 'Intelligent automation workflows',
    status: 'active',
    route: '/intelligence/automation',
    icon: 'Zap',
    lazy: true,
  },

  // ===== EMERGENCY =====
  'emergency.response': {
    id: 'emergency.response',
    name: 'Emergency Response',
    category: 'emergency',
    path: 'modules/emergency/emergency-response',
    description: 'Emergency response management',
    status: 'active',
    route: '/emergency/response',
    icon: 'AlertTriangle',
    lazy: true,
  },

  'emergency.mission-control': {
    id: 'emergency.mission-control',
    name: 'Mission Control',
    category: 'emergency',
    path: 'modules/emergency/mission-control',
    description: 'Mission control center',
    status: 'active',
    route: '/emergency/mission-control',
    icon: 'Radio',
    lazy: true,
  },

  'emergency.mission-logs': {
    id: 'emergency.mission-logs',
    name: 'Mission Logs',
    category: 'emergency',
    path: 'modules/emergency/mission-logs',
    description: 'Mission logging and tracking',
    status: 'active',
    route: '/emergency/logs',
    icon: 'BookOpen',
    lazy: true,
  },

  'emergency.risk-management': {
    id: 'emergency.risk-management',
    name: 'Risk Management',
    category: 'emergency',
    path: 'modules/emergency/risk-management',
    description: 'Risk assessment and management',
    status: 'active',
    route: '/emergency/risk',
    icon: 'AlertCircle',
    lazy: true,
  },

  // ===== LOGISTICS =====
  'logistics.hub': {
    id: 'logistics.hub',
    name: 'Logistics Hub',
    category: 'logistics',
    path: 'modules/logistics/logistics-hub',
    description: 'Central logistics management',
    status: 'active',
    route: '/logistics/hub',
    icon: 'Package',
    lazy: true,
  },

  'logistics.fuel-optimizer': {
    id: 'logistics.fuel-optimizer',
    name: 'Fuel Optimizer',
    category: 'logistics',
    path: 'modules/logistics/fuel-optimizer',
    description: 'Optimize fuel consumption',
    status: 'active',
    route: '/logistics/fuel',
    icon: 'Droplet',
    lazy: true,
  },

  'logistics.satellite-tracker': {
    id: 'logistics.satellite-tracker',
    name: 'Satellite Tracker',
    category: 'logistics',
    path: 'modules/logistics/satellite-tracker',
    description: 'Track vessels via satellite',
    status: 'active',
    route: '/logistics/tracker',
    icon: 'Satellite',
    lazy: true,
  },

  // ===== PLANNING =====
  'planning.voyage': {
    id: 'planning.voyage',
    name: 'Voyage Planner',
    category: 'planning',
    path: 'modules/planning/voyage-planner',
    description: 'Plan and optimize voyages',
    status: 'active',
    route: '/planning/voyage',
    icon: 'Map',
    lazy: true,
  },

  'hr.training': {
    id: 'hr.training',
    name: 'Training Academy',
    category: 'hr',
    path: 'modules/hr/training-academy',
    description: 'Training and certification management',
    status: 'active',
    route: '/training-academy',
    icon: 'GraduationCap',
    lazy: true,
  },

  'hr.peo-dp': {
    id: 'hr.peo-dp',
    name: 'PEO-DP',
    category: 'hr',
    path: 'modules/hr/peo-dp',
    description: 'PEO-DP system integration',
    status: 'active',
    route: '/peo-dp',
    icon: 'Shield',
    lazy: true,
  },

  'hr.employee-portal': {
    id: 'hr.employee-portal',
    name: 'Employee Portal',
    category: 'hr',
    path: 'modules/hr/employee-portal',
    description: 'Employee self-service portal',
    status: 'active',
    route: '/portal',
    icon: 'User',
    lazy: true,
  },

  // ===== MAINTENANCE =====
  'maintenance.planner': {
    id: 'maintenance.planner',
    name: 'Maintenance Planner',
    category: 'maintenance',
    path: 'modules/maintenance-planner',
    description: 'Plan and track maintenance',
    status: 'active',
    route: '/maintenance/planner',
    icon: 'Wrench',
    lazy: true,
  },

  'connectivity.channel-manager': {
    id: 'connectivity.channel-manager',
    name: 'Channel Manager',
    category: 'connectivity',
    path: 'modules/connectivity/channel-manager',
    description: 'Manage communication channels',
    status: 'active',
    route: '/channel-manager',
    icon: 'Radio',
    lazy: true,
  },

  'connectivity.api-gateway': {
    id: 'connectivity.api-gateway',
    name: 'API Gateway',
    category: 'connectivity',
    path: 'modules/connectivity/api-gateway',
    description: 'API gateway and integration',
    status: 'active',
    route: '/api-gateway',
    icon: 'Plug',
    lazy: true,
  },

  'connectivity.notifications': {
    id: 'connectivity.notifications',
    name: 'Notifications Center',
    category: 'connectivity',
    path: 'modules/connectivity/notifications-center',
    description: 'Notification management',
    status: 'active',
    route: '/notifications-center',
    icon: 'Bell',
    lazy: true,
  },

  'connectivity.communication': {
    id: 'connectivity.communication',
    name: 'Communication',
    category: 'connectivity',
    path: 'modules/connectivity/communication',
    description: 'Communication hub',
    status: 'active',
    route: '/communication',
    icon: 'MessageSquare',
    lazy: true,
  },

  'connectivity.integrations-hub': {
    id: 'connectivity.integrations-hub',
    name: 'Integrations Hub',
    category: 'connectivity',
    path: 'modules/connectivity/integrations-hub',
    description: 'Integrations management',
    status: 'active',
    route: '/intelligence',
    icon: 'Plug',
    lazy: true,
  },

  // ===== WORKSPACE =====
  'workspace.realtime': {
    id: 'workspace.realtime',
    name: 'Real-Time Workspace',
    category: 'workspace',
    path: 'modules/workspace/real-time-workspace',
    description: 'Collaborative workspace',
    status: 'active',
    route: '/real-time-workspace',
    icon: 'Users',
    lazy: true,
  },

  'workspace.collaboration': {
    id: 'workspace.collaboration',
    name: 'Collaboration',
    category: 'workspace',
    path: 'modules/workspace/collaboration',
    description: 'Team collaboration tools',
    status: 'active',
    route: '/collaboration',
    icon: 'Users',
    lazy: true,
  },

  // ===== ASSISTANTS =====
  'assistants.voice': {
    id: 'assistants.voice',
    name: 'Voice Assistant',
    category: 'assistants',
    path: 'modules/assistants/voice-assistant',
    description: 'Voice-powered assistant',
    status: 'active',
    route: '/assistant/voice',
    icon: 'Mic',
    lazy: true,
  },

  // ===== FINANCE =====
  'finance.hub': {
    id: 'finance.hub',
    name: 'Finance Hub',
    category: 'finance',
    path: 'modules/finance-hub',
    description: 'Financial management hub',
    status: 'active',
    route: '/finance',
    icon: 'DollarSign',
    lazy: true,
  },

  // ===== DOCUMENTS =====
  'documents.ai': {
    id: 'documents.ai',
    name: 'AI Documents',
    category: 'documents',
    path: 'modules/documents/documents-ai/DocumentsAI',
    description: 'AI-powered document management',
    status: 'active',
    route: '/documents',
    icon: 'FileText',
    lazy: true,
  },

  'documents.incident-reports': {
    id: 'documents.incident-reports',
    name: 'Incident Reports',
    category: 'documents',
    path: 'modules/incident-reports',
    description: 'Incident reporting system',
    status: 'active',
    route: '/incident-reports',
    icon: 'AlertOctagon',
    lazy: true,
  },

  'documents.templates': {
    id: 'documents.templates',
    name: 'Templates',
    category: 'documents',
    path: 'modules/documents/templates',
    description: 'Document templates',
    status: 'active',
    route: '/templates',
    icon: 'FileCode',
    lazy: true,
  },

  // ===== CONFIGURATION =====
  'config.settings': {
    id: 'config.settings',
    name: 'Settings',
    category: 'configuration',
    path: 'modules/configuration/settings',
    description: 'Application settings (placeholder - no implementation)',
    status: 'deprecated',
    route: '/settings',
    icon: 'Settings',
    lazy: true,
  },

  'config.user-management': {
    id: 'config.user-management',
    name: 'User Management',
    category: 'configuration',
    path: 'modules/user-management',
    description: 'Manage users and permissions',
    status: 'active',
    route: '/users',
    icon: 'UserCog',
    permissions: ['admin'],
    lazy: true,
  },

  // ===== FEATURES =====
  'features.price-alerts': {
    id: 'features.price-alerts',
    name: 'Price Alerts',
    category: 'features',
    path: 'modules/features/price-alerts',
    description: 'Price monitoring and alerts',
    status: 'active',
    route: '/price-alerts',
    icon: 'Bell',
    lazy: true,
  },

  'features.checklists': {
    id: 'features.checklists',
    name: 'Smart Checklists',
    category: 'features',
    path: 'modules/features/checklists',
    description: 'Intelligent checklist system',
    status: 'active',
    route: '/checklists',
    icon: 'CheckSquare',
    lazy: true,
  },

  'features.reservations': {
    id: 'features.reservations',
    name: 'Reservations',
    category: 'features',
    path: 'modules/features/reservations',
    description: 'Reservation management',
    status: 'active',
    route: '/reservations',
    icon: 'Calendar',
    lazy: true,
  },

  'features.travel': {
    id: 'features.travel',
    name: 'Travel',
    category: 'features',
    path: 'modules/features/travel',
    description: 'Travel management',
    status: 'active',
    route: '/travel',
    icon: 'Plane',
    lazy: true,
  },



  'features.vault-ai': {
    id: 'features.vault-ai',
    name: 'Vault AI',
    category: 'features',
    path: 'modules/vault_ai/pages/VaultAIPage',
    description: 'AI-powered secure vault',
    status: 'active',
    route: '/vault',
    icon: 'Lock',
    lazy: true,
  },

  'features.weather': {
    id: 'features.weather',
    name: 'Weather Dashboard',
    category: 'features',
    path: 'modules/weather-dashboard',
    description: 'Weather monitoring and forecasting',
    status: 'active',
    route: '/weather',
    icon: 'Cloud',
    lazy: true,
  },

  'features.task-automation': {
    id: 'features.task-automation',
    name: 'Task Automation',
    category: 'features',
    path: 'modules/task-automation',
    description: 'Automated task management',
    status: 'active',
    route: '/tasks/automation',
    icon: 'Zap',
    lazy: true,
  },

  'features.project-timeline': {
    id: 'features.project-timeline',
    name: 'Project Timeline',
    category: 'features',
    path: 'modules/project-timeline',
    description: 'Project timeline management',
    status: 'active',
    route: '/projects/timeline',
    icon: 'Calendar',
    lazy: true,
  },

  'intelligence.smart-workflow': {
    id: 'intelligence.smart-workflow',
    name: 'Smart Workflow',
    category: 'intelligence',
    path: 'modules/intelligence/smart-workflow',
    description: 'Intelligent workflow automation',
    status: 'active',
    route: '/workflow',
    icon: 'GitBranch',
    lazy: true,
  },
};

/**
 * Get module by ID
 */
export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[id];
}

/**
 * Get all modules by category
 */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

/**
 * Get all active modules
 */
export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === 'active');
}

/**
 * Get all modules with routes
 */
export function getRoutableModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.route);
}

/**
 * Check if user has access to module
 */
export function hasModuleAccess(module: ModuleDefinition, userPermissions: string[]): boolean {
  if (!module.permissions || module.permissions.length === 0) return true;
  return module.permissions.some(p => userPermissions.includes(p));
}
