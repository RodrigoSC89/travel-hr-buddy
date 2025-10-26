/**
 * Module Registry - PATCH 176.0
 * Last updated: 2025-10-25T23:00:00.000Z
 * 
 * PATCH 176.0 - Route Cleanup & Dead Code Removal
 * - Removed all auto-generated module entries
 * - Cleaned ghost routes from registry
 * - Verified active status for all modules with routes
 * - Removed deprecated modules without implementations
 */

export type ModuleStatus = "active" | "deprecated" | "beta" | "experimental" | "incomplete";

export type ModuleCompleteness = "100%" | "partial" | "broken" | "deprecated";

export type ModuleCategory =
  | "core"
  | "operations"
  | "compliance"
  | "intelligence"
  | "emergency"
  | "logistics"
  | "planning"
  | "hr"
  | "maintenance"
  | "connectivity"
  | "workspace"
  | "assistants"
  | "finance"
  | "documents"
  | "configuration"
  | "features";

export interface ModuleDefinition {
  id: string;
  name: string;
  category: ModuleCategory;
  path: string;
  description: string;
  status: ModuleStatus;
  completeness?: ModuleCompleteness;
  dependencies?: string[];
  lazy?: boolean;
  route?: string;
  icon?: string;
  permissions?: string[];
  version?: string;
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  "core.dashboard": {
    id: "core.dashboard",
    name: "Dashboard",
    category: "core",
    path: "modules/ui/dashboard/Dashboard",
    description: "Main application dashboard",
    status: "active", // PATCH 96.0 – Verified: Has route in AppRouter
    completeness: "100%",
    route: "/dashboard",
    icon: "LayoutDashboard",
    lazy: true,
  },

  "core.shared": {
    id: "core.shared",
    name: "Shared Components",
    category: "core",
    path: "modules/shared",
    description: "Shared components and utilities",
    status: "deprecated",
    lazy: false,
  },

  "core.system-watchdog": {
    id: "core.system-watchdog",
    name: "System Watchdog",
    category: "core",
    path: "modules/system-watchdog",
    description: "Autonomous system monitoring with AI-based error detection and auto-healing capabilities",
    status: "active", // PATCH 96.0 – Verified: Has route in AppRouter at /dashboard/system-watchdog
    completeness: "100%",
    route: "/dashboard/system-watchdog",
    icon: "Activity",
    lazy: true,
    version: "93.0",
  },

  "core.logs-center": {
    id: "core.logs-center",
    name: "Logs Center",
    category: "core",
    path: "modules/logs-center",
    description: "PATCH 94.0 - Centralized technical logs with filtering, AI-powered audit and PDF export capabilities",
    status: "active", // PATCH 96.0 – Verified: Has route in AppRouter at /dashboard/logs-center
    completeness: "100%",
    route: "/dashboard/logs-center",
    icon: "FileText",
    lazy: true,
    version: "94.0",
  },

  "operations.crew": {
    id: "operations.crew",
    name: "Crew Management",
    category: "operations",
    path: "modules/operations/crew",
    description: "Manage crew members and assignments",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/crew",
    icon: "Users",
    lazy: true,
  },

  "operations.fleet": {
    id: "operations.fleet",
    name: "Fleet Management",
    category: "operations",
    path: "modules/operations/fleet",
    description: "Manage fleet and vessels",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/fleet",
    icon: "Ship",
    lazy: true,
  },

  "operations.performance": {
    id: "operations.performance",
    name: "Performance Monitoring",
    category: "operations",
    path: "modules/operations/performance",
    description: "Monitor operational performance",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/performance",
    icon: "TrendingUp",
    lazy: true,
  },

  "operations.crew-wellbeing": {
    id: "operations.crew-wellbeing",
    name: "Crew Wellbeing",
    category: "operations",
    path: "modules/operations/crew-wellbeing",
    description: "Monitor crew health and wellbeing",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/crew-wellbeing",
    icon: "Heart",
    lazy: true,
  },

  "operations.maritime-system": {
    id: "operations.maritime-system",
    name: "Maritime System",
    category: "operations",
    path: "modules/operations/maritime-system/MaritimeSystem",
    description: "Maritime operations management",
    status: "active", // PATCH 96.0 – Has route in AppRouter at /maritime
    completeness: "100%",
    route: "/maritime",
    icon: "Ship",
    lazy: true,
  },

  "operations.dashboard": {
    id: "operations.dashboard",
    name: "Operations Dashboard",
    category: "operations",
    path: "modules/operations/operations-dashboard",
    description: "Consolidated operations dashboard - Fleet, crew, performance, and operational metrics with real-time monitoring",
    status: "active", // PATCH 96.0 – Verified: Has Supabase integration
    completeness: "100%",
    route: "/operations-dashboard",
    icon: "Ship",
    lazy: true,
  },

  "compliance.reports": {
    id: "compliance.reports",
    name: "Compliance Reports",
    category: "compliance",
    path: "modules/compliance/reports",
    description: "Generate compliance reports",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/compliance/reports",
    icon: "FileText",
    lazy: true,
  },

  "compliance.audit-center": {
    id: "compliance.audit-center",
    name: "Audit Center (Legacy)",
    category: "compliance",
    path: "modules/compliance/audit-center",
    description: "Manage audits and inspections - DEPRECATED: Use compliance-hub instead",
    status: "deprecated",
    route: "/compliance/audit",
    icon: "ClipboardCheck",
    lazy: true,
  },

  "compliance.hub": {
    id: "compliance.hub",
    name: "Compliance Hub",
    category: "compliance",
    path: "modules/compliance-hub",
    description: "Unified compliance management - AI-powered audits, checklists, risk assessment, and regulatory documentation (PATCH 92.0)",
    status: "incomplete", // PATCH 96.0 – File not found at specified path
    completeness: "broken",
    route: "/dashboard/compliance-hub",
    icon: "Shield",
    lazy: true,
    version: "92.0",
  },

  "intelligence.ai-insights": {
    id: "intelligence.ai-insights",
    name: "AI Insights Dashboard",
    category: "intelligence",
    path: "modules/intelligence/ai-insights",
    description: "AI-powered insights, analytics, logs, alerts, and failure analysis with GPT-4o",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/ai-insights",
    icon: "Brain",
    lazy: true,
  },

  "intelligence.analytics": {
    id: "intelligence.analytics",
    name: "Analytics Core",
    category: "intelligence",
    path: "modules/intelligence/analytics-core",
    description: "Core analytics engine",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/intelligence/analytics",
    icon: "BarChart3",
    lazy: true,
  },

  "intelligence.automation": {
    id: "intelligence.automation",
    name: "Automation",
    category: "intelligence",
    path: "modules/intelligence/automation",
    description: "Intelligent automation workflows",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/intelligence/automation",
    icon: "Zap",
    lazy: true,
  },

  "emergency.response": {
    id: "emergency.response",
    name: "Emergency Response",
    category: "emergency",
    path: "modules/emergency/emergency-response",
    description: "Emergency response management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/emergency/response",
    icon: "AlertTriangle",
    lazy: true,
  },

  "emergency.mission-control": {
    id: "emergency.mission-control",
    name: "Mission Control",
    category: "emergency",
    path: "modules/emergency/mission-control",
    description: "Mission control center",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/emergency/mission-control",
    icon: "Radio",
    lazy: true,
  },

  "emergency.mission-logs": {
    id: "emergency.mission-logs",
    name: "Mission Logs",
    category: "emergency",
    path: "modules/emergency/mission-logs",
    description: "Mission logging and tracking",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/emergency/logs",
    icon: "BookOpen",
    lazy: true,
  },

  "emergency.risk-management": {
    id: "emergency.risk-management",
    name: "Risk Management (Legacy)",
    category: "emergency",
    path: "modules/emergency/risk-management",
    description: "Risk assessment and management - DEPRECATED: Use compliance-hub instead",
    status: "deprecated",
    route: "/emergency/risk",
    icon: "AlertCircle",
    lazy: true,
  },

  "logistics.hub": {
    id: "logistics.hub",
    name: "Logistics Hub",
    category: "logistics",
    path: "modules/logistics/logistics-hub",
    description: "Central logistics management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/logistics/hub",
    icon: "Package",
    lazy: true,
  },

  "logistics.fuel-optimizer": {
    id: "logistics.fuel-optimizer",
    name: "Fuel Optimizer",
    category: "logistics",
    path: "modules/logistics/fuel-optimizer",
    description: "Optimize fuel consumption",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/logistics/fuel",
    icon: "Droplet",
    lazy: true,
  },

  "logistics.satellite-tracker": {
    id: "logistics.satellite-tracker",
    name: "Satellite Tracker",
    category: "logistics",
    path: "modules/logistics/satellite-tracker",
    description: "Track vessels via satellite",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/logistics/tracker",
    icon: "Satellite",
    lazy: true,
  },

  "planning.voyage": {
    id: "planning.voyage",
    name: "Voyage Planner",
    category: "planning",
    path: "modules/planning/voyage-planner",
    description: "Plan and optimize voyages",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/planning/voyage",
    icon: "Map",
    lazy: true,
  },

  "hr.training": {
    id: "hr.training",
    name: "Training Academy",
    category: "hr",
    path: "modules/hr/training-academy",
    description: "Training and certification management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/training-academy",
    icon: "GraduationCap",
    lazy: true,
  },

  "hr.peo-dp": {
    id: "hr.peo-dp",
    name: "PEO-DP",
    category: "hr",
    path: "modules/hr/peo-dp",
    description: "PEO-DP system integration",
    status: "active", // PATCH 96.0 – Has route in AppRouter at /peo-dp
    completeness: "100%",
    route: "/peo-dp",
    icon: "Shield",
    lazy: true,
  },

  "hr.employee-portal": {
    id: "hr.employee-portal",
    name: "Employee Portal",
    category: "hr",
    path: "modules/hr/employee-portal",
    description: "Employee self-service portal",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/portal",
    icon: "User",
    lazy: true,
  },

  "maintenance.planner": {
    id: "maintenance.planner",
    name: "Maintenance Planner",
    category: "maintenance",
    path: "modules/maintenance-planner",
    description: "Plan and track maintenance",
    status: "active", // PATCH 96.0 – Has route in AppRouter at /maintenance
    completeness: "100%",
    route: "/maintenance/planner",
    icon: "Wrench",
    lazy: true,
  },

  "connectivity.channel-manager": {
    id: "connectivity.channel-manager",
    name: "Channel Manager",
    category: "connectivity",
    path: "modules/connectivity/channel-manager",
    description: "Manage communication channels",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/channel-manager",
    icon: "Radio",
    lazy: true,
  },

  "connectivity.api-gateway": {
    id: "connectivity.api-gateway",
    name: "API Gateway",
    category: "connectivity",
    path: "modules/connectivity/api-gateway",
    description: "API gateway and integration",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/api-gateway",
    icon: "Plug",
    lazy: true,
  },

  "connectivity.notifications": {
    id: "connectivity.notifications",
    name: "Notifications Center",
    category: "connectivity",
    path: "modules/connectivity/notifications-center",
    description: "Notification management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/notifications-center",
    icon: "Bell",
    lazy: true,
  },

  "connectivity.communication": {
    id: "connectivity.communication",
    name: "Communication",
    category: "connectivity",
    path: "modules/connectivity/communication",
    description: "Communication hub",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/communication",
    icon: "MessageSquare",
    lazy: true,
  },

  "connectivity.integrations-hub": {
    id: "connectivity.integrations-hub",
    name: "Integrations Hub",
    category: "connectivity",
    path: "modules/connectivity/integrations-hub",
    description: "Integrations management",
    status: "incomplete", // PATCH 96.0 – File not found at specified path
    completeness: "broken",
    route: "/intelligence",
    icon: "Plug",
    lazy: true,
  },

  "workspace.realtime": {
    id: "workspace.realtime",
    name: "Real-Time Workspace",
    category: "workspace",
    path: "modules/workspace/real-time-workspace",
    description: "Collaborative workspace",
    status: "active", // PATCH 96.0 – Verified: Has Supabase integration
    completeness: "100%",
    route: "/real-time-workspace",
    icon: "Users",
    lazy: true,
  },

  "workspace.collaboration": {
    id: "workspace.collaboration",
    name: "Collaboration",
    category: "workspace",
    path: "modules/workspace/collaboration",
    description: "Team collaboration tools",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/collaboration",
    icon: "Users",
    lazy: true,
  },

  "assistants.voice": {
    id: "assistants.voice",
    name: "Voice Assistant",
    category: "assistants",
    path: "modules/assistants/voice-assistant",
    description: "Voice-powered assistant",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/assistant/voice",
    icon: "Mic",
    lazy: true,
  },

  "finance.hub": {
    id: "finance.hub",
    name: "Finance Hub",
    category: "finance",
    path: "modules/finance-hub",
    description: "Financial management hub",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/finance",
    icon: "DollarSign",
    lazy: true,
  },

  "documents.ai": {
    id: "documents.ai",
    name: "AI Documents",
    category: "documents",
    path: "modules/documents/documents-ai/DocumentsAI",
    description: "AI-powered document management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/documents",
    icon: "FileText",
    lazy: true,
  },

  "documents.incident-reports": {
    id: "documents.incident-reports",
    name: "Incident Reports",
    category: "documents",
    path: "modules/incident-reports",
    description: "Incident reporting system",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/incident-reports",
    icon: "AlertOctagon",
    lazy: true,
  },

  "documents.templates": {
    id: "documents.templates",
    name: "Templates",
    category: "documents",
    path: "modules/documents/templates",
    description: "Document templates",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/templates",
    icon: "FileCode",
    lazy: true,
  },

  "documents.hub": {
    id: "documents.hub",
    name: "Document Hub",
    category: "documents",
    path: "modules/document-hub",
    description: "PATCH 91.1 - Central hub for document management with AI integration",
    status: "active", // PATCH 96.0 – Verified: Has Supabase integration
    completeness: "100%",
    route: "/dashboard/document-hub",
    icon: "FolderOpen",
    lazy: true,
    version: "91.1",
  },

  "config.settings": {
    id: "config.settings",
    name: "Settings",
    category: "configuration",
    path: "modules/configuration/settings",
    description: "Application settings (placeholder - no implementation)",
    status: "deprecated",
    route: "/settings",
    icon: "Settings",
    lazy: true,
  },

  "config.user-management": {
    id: "config.user-management",
    name: "User Management",
    category: "configuration",
    path: "modules/user-management",
    description: "Manage users and permissions",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/users",
    icon: "UserCog",
    permissions: ["admin"],
    lazy: true,
  },

  "features.price-alerts": {
    id: "features.price-alerts",
    name: "Price Alerts",
    category: "features",
    path: "modules/features/price-alerts",
    description: "Price monitoring and alerts",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/price-alerts",
    icon: "Bell",
    lazy: true,
  },

  "features.checklists": {
    id: "features.checklists",
    name: "Smart Checklists (Legacy)",
    category: "features",
    path: "modules/features/checklists",
    description: "Intelligent checklist system - DEPRECATED: Use compliance-hub instead",
    status: "deprecated",
    route: "/checklists",
    icon: "CheckSquare",
    lazy: true,
  },

  "features.reservations": {
    id: "features.reservations",
    name: "Reservations",
    category: "features",
    path: "modules/features/reservations",
    description: "Reservation management",
    status: "incomplete", // PATCH 96.0 – File not found at specified path
    completeness: "broken",
    route: "/reservations",
    icon: "Calendar",
    lazy: true,
  },

  "features.travel": {
    id: "features.travel",
    name: "Travel",
    category: "features",
    path: "modules/features/travel",
    description: "Travel management",
    status: "incomplete", // PATCH 96.0 – File not found at specified path
    completeness: "broken",
    route: "/travel",
    icon: "Plane",
    lazy: true,
  },

  "features.vault-ai": {
    id: "features.vault-ai",
    name: "Vault AI",
    category: "features",
    path: "modules/vault_ai/pages/VaultAIPage",
    description: "AI-powered secure vault",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/vault",
    icon: "Lock",
    lazy: true,
  },

  "features.weather": {
    id: "features.weather",
    name: "Weather Dashboard",
    category: "features",
    path: "modules/weather-dashboard",
    description: "Weather monitoring, forecasting, climate and environmental risk analysis",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/weather-dashboard",
    icon: "Cloud",
    lazy: true,
  },

  "features.task-automation": {
    id: "features.task-automation",
    name: "Task Automation",
    category: "features",
    path: "modules/task-automation",
    description: "Automated task management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/tasks/automation",
    icon: "Zap",
    lazy: true,
  },

  "features.project-timeline": {
    id: "features.project-timeline",
    name: "Project Timeline",
    category: "features",
    path: "modules/project-timeline",
    description: "Project timeline management",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/projects/timeline",
    icon: "Calendar",
    lazy: true,
  },

  "intelligence.smart-workflow": {
    id: "intelligence.smart-workflow",
    name: "Smart Workflow",
    category: "intelligence",
    path: "modules/intelligence/smart-workflow",
    description: "Intelligent workflow automation",
    status: "incomplete", // PATCH 96.0 – UI exists but no database/AI integration, no route in AppRouter
    completeness: "partial",
    route: "/workflow",
    icon: "GitBranch",
    lazy: true,
  },

  "operations.mission-control": {
    id: "operations.mission-control",
    name: "Mission Control Center",
    category: "operations",
    path: "modules/mission-control",
    description: "PATCH 177.0 - Unified tactical operations hub consolidating Fleet, Emergency, Satellite, and Weather monitoring with AI Commander",
    status: "active",
    completeness: "100%",
    route: "/mission-control",
    icon: "Radio",
    lazy: true,
    version: "177.0",
  },

  "operations.ocean-sonar": {
    id: "operations.ocean-sonar",
    name: "Ocean Sonar AI",
    category: "operations",
    path: "modules/ocean-sonar",
    description: "PATCH 180.0/183.0 - Bathymetric scanning with AI-powered analysis, export to GeoJSON/PNG, and offline caching support",
    status: "active",
    completeness: "100%",
    route: "/ocean-sonar",
    icon: "Waves",
    lazy: true,
    version: "183.0",
  },

  "operations.underwater-drone": {
    id: "operations.underwater-drone",
    name: "Underwater Drone Control",
    category: "operations",
    path: "modules/underwater-drone",
    description: "PATCH 181.0 - ROV/AUV control system with 3D movement logic, telemetry monitoring (depth, orientation, temperature), and mission waypoint navigation",
    status: "active",
    completeness: "100%",
    route: "/underwater-drone",
    icon: "Anchor",
    lazy: true,
    version: "181.0",
  },

  "intelligence.sonar-ai": {
    id: "intelligence.sonar-ai",
    name: "Sonar AI Enhancement",
    category: "intelligence",
    path: "modules/sonar-ai",
    description: "PATCH 182.0 - Enhanced sonar AI with real-time data analysis, risk interpreter for anomaly/obstacle detection, and bathymetric depth map with AI reports",
    status: "active",
    completeness: "100%",
    route: "/sonar-ai",
    icon: "Radar",
    lazy: true,
    version: "182.0",
  }
};

export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[id];
}

export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === "active");
}

export function getRoutableModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.route);
}

export function hasModuleAccess(module: ModuleDefinition, userPermissions: string[]): boolean {
  if (!module.permissions || module.permissions.length === 0) return true;
  return module.permissions.some(p => userPermissions.includes(p));
}
