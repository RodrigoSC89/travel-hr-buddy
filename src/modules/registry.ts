/**
 * Module Registry - PATCH 83.0 Auto-Generated
 * Last updated: 2025-10-24T01:17:32.278Z
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
  id: string;
  name: string;
  category: ModuleCategory;
  path: string;
  description: string;
  status: ModuleStatus;
  dependencies?: string[];
  lazy?: boolean;
  route?: string;
  icon?: string;
  permissions?: string[];
  version?: string;
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
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

'operations.dashboard': {
    id: 'operations.dashboard',
    name: 'Operations Dashboard',
    category: 'operations',
    path: 'modules/operations/operations-dashboard',
    description: 'Consolidated operations dashboard - Fleet, crew, performance, and operational metrics with real-time monitoring',
    status: 'active',
    route: '/operations-dashboard',
    icon: 'Ship',
    lazy: true,
  },

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

'intelligence.ai-insights': {
    id: 'intelligence.ai-insights',
    name: 'AI Insights Dashboard',
    category: 'intelligence',
    path: 'modules/intelligence/ai-insights',
    description: 'AI-powered insights, analytics, logs, alerts, and failure analysis with GPT-4o',
    status: 'active',
    route: '/ai-insights',
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

'documents.hub': {
    id: 'documents.hub',
    name: 'Document Hub',
    category: 'documents',
    path: 'modules/document-hub',
    description: 'PATCH 91.1 - Central hub for document management with AI integration',
    status: 'active',
    route: '/dashboard/document-hub',
    icon: 'FolderOpen',
    lazy: true,
    version: '91.1',
  },

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
    description: 'Weather monitoring, forecasting, climate and environmental risk analysis',
    status: 'active',
    route: '/weather-dashboard',
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

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.registry': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.registry',
    name: 'Registry',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/registry',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.loader': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.loader',
    name: 'Loader',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/loader',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.risk-audit.TacticalRiskPanel': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.risk-audit.TacticalRiskPanel',
    name: 'TacticalRiskPanel',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/risk-audit/TacticalRiskPanel',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.useForecast': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.useForecast',
    name: 'UseForecast',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/forecast/useForecast',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/forecast/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.ForecastEngine': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.forecast.ForecastEngine',
    name: 'ForecastEngine',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/forecast/ForecastEngine',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.useAIAdvisor': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.useAIAdvisor',
    name: 'UseAIAdvisor',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/ai/useAIAdvisor',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/ai/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.AdaptiveAI': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.ai.AdaptiveAI',
    name: 'AdaptiveAI',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/ai/AdaptiveAI',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.types.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.types.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/types/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.vaultLLM': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.vaultLLM',
    name: 'VaultLLM',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/services/vaultLLM',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.semanticSearch': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.semanticSearch',
    name: 'SemanticSearch',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/services/semanticSearch',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.fileIndexer': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.services.fileIndexer',
    name: 'FileIndexer',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/services/fileIndexer',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.components.VaultCore': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.vault_ai.components.VaultCore',
    name: 'VaultCore',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/vault_ai/components/VaultCore',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.planning.mmi.MaintenanceIntelligence': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.planning.mmi.MaintenanceIntelligence',
    name: 'MaintenanceIntelligence',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/planning/mmi/MaintenanceIntelligence',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.planning.fmea.FMEAExpert': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.planning.fmea.FMEAExpert',
    name: 'FMEAExpert',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/planning/fmea/FMEAExpert',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.operations.feedback.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.operations.feedback.index',
    name: 'Index',
    category: 'operations',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/operations/feedback/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.intelligence.dp-intelligence.DPIntelligenceCenter': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.intelligence.dp-intelligence.DPIntelligenceCenter',
    name: 'DPIntelligenceCenter',
    category: 'intelligence',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/intelligence/dp-intelligence/DPIntelligenceCenter',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.core.overview.SystemOverview': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.core.overview.SystemOverview',
    name: 'SystemOverview',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/core/overview/SystemOverview',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.core.help-center.HelpCenter': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.core.help-center.HelpCenter',
    name: 'HelpCenter',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/core/help-center/HelpCenter',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.forecast-global.ForecastConsole': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.forecast-global.ForecastConsole',
    name: 'ForecastConsole',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/forecast-global/ForecastConsole',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.types': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.types',
    name: 'Types',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/types',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_ui': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_ui',
    name: 'Hub_ui',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_ui',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_sync': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_sync',
    name: 'Hub_sync',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_sync',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_monitor': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_monitor',
    name: 'Hub_monitor',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_monitor',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_core': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_core',
    name: 'Hub_core',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_core',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_cache': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_cache',
    name: 'Hub_cache',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_cache',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_bridge': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.hub_bridge',
    name: 'Hub_bridge',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/hub_bridge',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.ControlHubPanel': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.control-hub.ControlHubPanel',
    name: 'ControlHubPanel',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/control-hub/ControlHubPanel',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.types': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.types',
    name: 'Types',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/types',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.index': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.index',
    name: 'Index',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/index',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.BridgeLinkDashboard': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.BridgeLinkDashboard',
    name: 'BridgeLinkDashboard',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/BridgeLinkDashboard',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.compliance.sgso.SGSOSystem': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.compliance.sgso.SGSOSystem',
    name: 'SGSOSystem',
    category: 'compliance',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/compliance/sgso/SGSOSystem',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.services.bridge-link-api': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.services.bridge-link-api',
    name: 'Bridge Link Api',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/services/bridge-link-api',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.hooks.useBridgeLinkData': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.hooks.useBridgeLinkData',
    name: 'UseBridgeLinkData',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/hooks/useBridgeLinkData',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.RiskAlertPanel': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.RiskAlertPanel',
    name: 'RiskAlertPanel',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/components/RiskAlertPanel',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.LiveDecisionMap': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.LiveDecisionMap',
    name: 'LiveDecisionMap',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/components/LiveDecisionMap',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  },

'.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.DPStatusCard': {
    id: '.home.runner.work.travel-hr-buddy.travel-hr-buddy.src.modules.control.bridgelink.components.DPStatusCard',
    name: 'DPStatusCard',
    category: 'features',
    path: '/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/control/bridgelink/components/DPStatusCard',
    description: 'Auto-generated module entry',
    status: 'active',
    lazy: true,
  }
};

export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[id];
}

export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === 'active');
}

export function getRoutableModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.route);
}

export function hasModuleAccess(module: ModuleDefinition, userPermissions: string[]): boolean {
  if (!module.permissions || module.permissions.length === 0) return true;
  return module.permissions.some(p => userPermissions.includes(p));
}
