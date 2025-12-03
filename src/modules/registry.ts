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
    path: "pages/Dashboard",
    description: "Main application dashboard - Route handled directly by App.tsx",
    status: "active",
    completeness: "100%",
    // route removed - defined directly in App.tsx to avoid conflict
    icon: "LayoutDashboard",
    lazy: true,
  },

  // REMOVED: core.shared - Deprecated (PATCH 176.2)

  "core.system-watchdog": {
    id: "core.system-watchdog",
    name: "System Watchdog",
    category: "core",
    path: "modules/system-watchdog/SystemWatchdog",
    description: "Autonomous system monitoring with AI-based error detection and auto-healing capabilities",
    status: "active",
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
    path: "modules/logs-center/LogsCenter",
    description: "PATCH 94.0 - Centralized technical logs with filtering, AI-powered audit and PDF export capabilities",
    status: "active",
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
    path: "pages/CrewManagement",
    description: "Manage crew members and assignments - Active with Supabase integration and demo data",
    status: "active",
    completeness: "100%",
    route: "/crew",
    icon: "Users",
    lazy: true,
  },

  "operations.fleet": {
    id: "operations.fleet",
    name: "Fleet Management",
    category: "operations",
    path: "modules/fleet",
    description: "PATCH 191.0 - Unified fleet management with vessel tracking, maintenance scheduling, crew assignments, and route management. Integrated with Supabase tables: vessels, maintenance, routes, crew_assignments",
    status: "active", // PATCH 191.0 – Consolidated from operations/fleet and operations/maritime-system
    completeness: "100%",
    route: "/fleet",
    icon: "Ship",
    lazy: true,
    version: "191.0",
  },

  // REMOVED: operations.performance - Use operations.dashboard (PATCH 176.2)
  // REMOVED: operations.crew-wellbeing - Integrated into operations.crew (PATCH 176.2)

  "operations.maritime-system": {
    id: "operations.maritime-system",
    name: "Maritime Operations",
    category: "operations",
    path: "pages/Maritime",
    description: "PATCH 191.0 - Maritime-specific operations: checklists, certifications, IoT sensors, predictive maintenance, and crew rotation. Built on top of unified fleet management (operations.fleet)",
    status: "active", // PATCH 191.0 – Specialized maritime operations using fleet as base
    completeness: "100%",
    route: "/maritime",
    icon: "Anchor",
    lazy: true,
    version: "191.0",
    dependencies: ["operations.fleet"],
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

  // REMOVED: compliance.reports - Merged into compliance.hub (PATCH 176.2)
  // REMOVED: compliance.audit-center - Use compliance-hub (PATCH 176.2)

  "compliance.hub": {
    id: "compliance.hub",
    name: "Compliance Hub",
    category: "compliance",
    path: "pages/compliance/ComplianceHub",
    description: "Unified compliance management - AI-powered audits, checklists, risk assessment, and regulatory documentation",
    status: "active",
    completeness: "100%",
    route: "/compliance-hub",
    icon: "Shield",
    lazy: true,
  },

  "intelligence.ai-insights": {
    id: "intelligence.ai-insights",
    name: "AI Insights Dashboard",
    category: "intelligence",
    path: "pages/AIAssistant",
    description: "AI-powered insights, analytics, logs, alerts, and failure analysis",
    status: "active",
    completeness: "100%",
    route: "/ai-insights",
    icon: "Brain",
    lazy: true,
  },

  // REMOVED: intelligence.analytics - Use operations.dashboard (PATCH 176.2)

  "intelligence.automation": {
    id: "intelligence.automation",
    name: "Automation Hub",
    category: "intelligence",
    path: "pages/AutomationHub",
    description: "Intelligent automation workflows and process optimization",
    status: "active",
    completeness: "100%",
    route: "/automation",
    icon: "Zap",
    lazy: true,
  },

  // REMOVED: emergency.response - Merged into compliance.hub (PATCH 176.2)
  // REMOVED: emergency.mission-control - Use operations.mission-control (PATCH 176.2)
  // REMOVED: emergency.mission-logs - Use core.logs-center (PATCH 176.2)
  // REMOVED: emergency.risk-management - Use compliance-hub (PATCH 176.2)
  // REMOVED: logistics.hub - Merged into operations.fleet (PATCH 176.2)
  // REMOVED: logistics.fuel-optimizer - Integrated into operations.fleet (PATCH 176.2)
  // REMOVED: logistics.satellite-tracker - Use operations.fleet tracking (PATCH 176.2)
  // REMOVED: planning.voyage - Merged into operations.fleet (PATCH 176.2)

  "hr.training": {
    id: "hr.training",
    name: "Training Academy",
    category: "hr",
    path: "pages/TrainingAcademy",
    description: "Training and certification management with AI-powered learning paths",
    status: "active",
    completeness: "100%",
    route: "/training-academy",
    icon: "GraduationCap",
    lazy: true,
  },

  "hr.peo-dp": {
    id: "hr.peo-dp",
    name: "PEO-DP",
    category: "hr",
    path: "modules/hr/peo-dp/PEODPPanel",
    description: "PEO-DP system integration",
    status: "active",
    completeness: "100%",
    route: "/peo-dp",
    icon: "Shield",
    lazy: true,
  },

  // REMOVED: hr.employee-portal - Integrated into operations.crew (PATCH 176.2)

  "maintenance.planner": {
    id: "maintenance.planner",
    name: "Maintenance Planner",
    category: "maintenance",
    path: "modules/maintenance-planner",
    description: "Plan and track maintenance",
    status: "active",
    completeness: "100%",
    route: "/maintenance-planner",
    icon: "Wrench",
    lazy: true,
  },

  "operations.mission-logs": {
    id: "operations.mission-logs",
    name: "Mission Logs",
    category: "operations",
    path: "pages/MissionLogsPage",
    description: "Track and manage mission operations logs",
    status: "active",
    completeness: "100%",
    route: "/mission-logs",
    icon: "FileText",
    lazy: true,
  },

  "maintenance.mmi": {
    id: "maintenance.mmi",
    name: "MMI - Manutenção Industrial",
    category: "maintenance",
    path: "pages/MMI",
    description: "Sistema completo de gestão de manutenção com IA para forecasts e ordens de serviço",
    status: "active",
    completeness: "100%",
    route: "/mmi",
    icon: "Wrench",
    lazy: true,
  },

  "connectivity.channel-manager": {
    id: "connectivity.channel-manager",
    name: "Channel Manager",
    category: "connectivity",
    path: "pages/ChannelManager",
    description: "Manage communication channels and connectivity status",
    status: "active",
    completeness: "100%",
    route: "/channel-manager",
    icon: "Radio",
    lazy: true,
  },

  "connectivity.api-gateway": {
    id: "connectivity.api-gateway",
    name: "API Gateway",
    category: "connectivity",
    path: "pages/APIGateway",
    description: "API gateway management and monitoring",
    status: "active",
    completeness: "100%",
    route: "/api-gateway",
    icon: "Plug",
    lazy: true,
  },

  "connectivity.notifications": {
    id: "connectivity.notifications",
    name: "Notifications Center",
    category: "connectivity",
    path: "pages/NotificationsCenter",
    description: "Centralized notification management and alerts",
    status: "active",
    completeness: "100%",
    route: "/notifications-center",
    icon: "Bell",
    lazy: true,
  },

  // REMOVED: connectivity.communication - Duplicate of "communication" module (pages/Communication) - PATCH 176.1

  "connectivity.integrations-hub": {
    id: "connectivity.integrations-hub",
    name: "Integrations Hub",
    category: "connectivity",
    path: "pages/Integrations",
    description: "Advanced integrations management with OAuth, webhooks, and plugins",
    status: "active",
    completeness: "100%",
    route: "/integrations-hub",
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
    path: "modules/document-hub/components/DocumentsAI",
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
    path: "modules/document-hub/templates",
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

  // REMOVED: config.settings - No implementation (PATCH 176.2)

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

  // REMOVED: features.checklists - Use compliance-hub (PATCH 176.2)

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

  // REMOVED: features.travel - Duplicate of "travel" module (pages/Travel) - PATCH 176.1

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
    path: "pages/WeatherDashboard",
    description: "Weather monitoring, forecasting, climate and environmental risk analysis",
    status: "active",
    completeness: "100%",
    route: "/weather-dashboard",
    icon: "Cloud",
    lazy: true,
  },

  "logistics.fuel-optimizer": {
    id: "logistics.fuel-optimizer",
    name: "Fuel Optimizer",
    category: "logistics",
    path: "pages/FuelOptimizerPage",
    description: "Fuel consumption optimization and monitoring",
    status: "active",
    completeness: "100%",
    route: "/fuel-optimizer",
    icon: "Fuel",
    lazy: true,
  },

  "logistics.satellite-tracker": {
    id: "logistics.satellite-tracker",
    name: "Satellite Tracker",
    category: "logistics",
    path: "pages/satellite-live",
    description: "Real-time satellite tracking and communication",
    status: "active",
    completeness: "100%",
    route: "/satellite-tracker",
    icon: "Satellite",
    lazy: true,
  },

  "planning.voyage": {
    id: "planning.voyage",
    name: "Voyage Planner",
    category: "planning",
    path: "modules/planning/voyage-planner",
    description: "Plan and optimize voyage routes",
    status: "active",
    completeness: "100%",
    route: "/voyage-planner",
    icon: "Navigation",
    lazy: true,
  },

  "emergency.emergency-response": {
    id: "emergency.emergency-response",
    name: "Emergency Response",
    category: "emergency",
    path: "pages/EmergencyResponse",
    description: "Emergency response management and coordination",
    status: "active",
    completeness: "100%",
    route: "/emergency-response",
    icon: "AlertTriangle",
    lazy: true,
  },

  "features.optimization": {
    id: "features.optimization",
    name: "Optimization",
    category: "features",
    path: "pages/Optimization",
    description: "System optimization and performance tuning",
    status: "active",
    completeness: "100%",
    route: "/optimization",
    icon: "Gauge",
    lazy: true,
  },

  "features.mobile-optimization": {
    id: "features.mobile-optimization",
    name: "Mobile Optimization",
    category: "features",
    path: "pages/MobileOptimization",
    description: "Mobile performance optimization center",
    status: "active",
    completeness: "100%",
    route: "/mobile-optimization",
    icon: "Smartphone",
    lazy: true,
  },

  "core.system-monitor": {
    id: "core.system-monitor",
    name: "System Monitor",
    category: "core",
    path: "pages/SystemMonitor",
    description: "Real-time system performance monitoring",
    status: "active",
    completeness: "100%",
    route: "/system-monitor",
    icon: "Monitor",
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
  },

  "operations.auto-sub": {
    id: "operations.auto-sub",
    name: "AutoSub Mission Planner",
    category: "operations",
    path: "modules/auto-sub",
    description: "PATCH 184.0 - Autonomous mission planning system with area definition, environmental parameters, automated waypoint generation, and real-time feedback loop",
    status: "active",
    completeness: "100%",
    route: "/auto-sub",
    icon: "Bot",
    lazy: true,
    version: "184.0",
  },

  "intelligence.deep-risk-ai": {
    id: "intelligence.deep-risk-ai",
    name: "Deep Sea Risk Analysis AI",
    category: "intelligence",
    path: "modules/deep-risk-ai",
    description: "PATCH 185.0 - AI-powered deep sea risk analysis with multi-factor scoring (pressure, temperature, sonar), predictive insights, and JSON report export",
    status: "active",
    completeness: "100%",
    route: "/deep-risk-ai",
    icon: "Brain",
    lazy: true,
    version: "185.0",
  },

  // PATCH 486-489: New Maritime System Enhancements
  "connectivity.communication-center": {
    id: "connectivity.communication-center",
    name: "Communication Center",
    category: "connectivity",
    path: "modules/communication-center",
    description: "PATCH 486.0 - Unified communication hub with real-time messaging, radio/satellite monitoring, and system status",
    status: "active",
    completeness: "100%",
    route: "/communication-center",
    icon: "Radio",
    lazy: true,
    version: "486.0",
  },

  "operations.drone-commander": {
    id: "operations.drone-commander",
    name: "Drone Commander",
    category: "operations",
    path: "modules/control/drone-commander",
    description: "PATCH 487.0 - UAV fleet control (disabled - module removed)",
    status: "deprecated",
    completeness: "deprecated",
    route: undefined,
    icon: "Drone",
    lazy: true,
    version: "487.0",
  },

  "documents.template-library": {
    id: "documents.template-library",
    name: "Template Library",
    category: "documents",
    path: "pages/admin/template-library",
    description: "PATCH 488.0 - Maritime document templates with type filtering, preview, and Supabase integration",
    status: "active",
    completeness: "100%",
    route: "/admin/templates/library",
    icon: "FileText",
    lazy: true,
    version: "488.0",
  },

  "planning.navigation-copilot-v2": {
    id: "planning.navigation-copilot-v2",
    name: "Navigation Copilot v2",
    category: "planning",
    path: "pages/admin/navigation-copilot-v2",
    description: "PATCH 489.0 - AI-powered navigation (module removed)",
    status: "deprecated",
    completeness: "deprecated",
    route: undefined,
    icon: "Navigation",
    lazy: true,
    version: "489.0",
  },

  "compliance.peotram": {
    id: "compliance.peotram",
    name: "PEOTRAM",
    category: "compliance",
    path: "pages/PEOTRAM",
    description: "Sistema de auditoria anual Petrobras com IA preditiva e análise de conformidade",
    status: "active",
    completeness: "100%",
    route: "/peotram",
    icon: "FileCheck",
    lazy: true,
  },

  "compliance.sgso": {
    id: "compliance.sgso",
    name: "SGSO",
    category: "compliance",
    path: "pages/SGSO",
    description: "PATCH 650 - Sistema de Gestão de Segurança Operacional - Compliance ANP Resolução 43/2007 com 17 práticas obrigatórias",
    status: "active",
    completeness: "100%",
    route: "/sgso",
    icon: "Shield",
    lazy: true,
    version: "650.0",
  },

  "compliance.imca-audit": {
    id: "compliance.imca-audit",
    name: "IMCA Audit",
    category: "compliance",
    path: "pages/IMCAAudit",
    description: "PATCH 650 - Sistema de auditoria IMCA com geração de relatórios e análise de conformidade",
    status: "active",
    completeness: "100%",
    route: "/imca-audit",
    icon: "FileCheck",
    lazy: true,
    version: "650.0",
  },

  "compliance.pre-ovid": {
    id: "compliance.pre-ovid",
    name: "Pre-OVID Inspection",
    category: "compliance",
    path: "pages/admin/pre-ovid-inspection",
    description: "PATCH 650 - Sistema de inspeção Pre-OVID com checklist inteligente, evidências e relatórios IA",
    status: "active",
    completeness: "100%",
    route: "/admin/pre-ovid",
    icon: "ClipboardCheck",
    lazy: true,
    version: "650.0",
  },

  "compliance.mlc-inspection": {
    id: "compliance.mlc-inspection",
    name: "MLC Inspection",
    category: "compliance",
    path: "modules/compliance/mlc-inspection",
    description: "Maritime Labour Convention 2006 Digital Inspection System",
    status: "active",
    completeness: "100%",
    route: "/mlc-inspection",
    icon: "Shield",
    lazy: true,
    version: "650.1",
  },

  // Travel & Logistics
  "travel": {
    id: "travel",
    name: "Travel Management",
    category: "operations",
    path: "pages/Travel",
    description: "Sistema integrado de gestão de viagens corporativas",
    status: "active",
    completeness: "100%",
    route: "/travel",
    icon: "Plane",
    lazy: true,
    version: "651.0",
  },

  // Communications
  "communication": {
    id: "communication",
    name: "Communication Hub",
    category: "operations",
    path: "pages/Communication",
    description: "Central de comunicação e mensagens",
    status: "active",
    completeness: "100%",
    route: "/communication",
    icon: "MessageSquare",
    lazy: true,
    version: "651.0",
  },

  // Analytics
  "analytics": {
    id: "analytics",
    name: "Analytics Dashboard",
    category: "features",
    path: "pages/Analytics",
    description: "Dashboard de análise de dados e métricas",
    status: "active",
    completeness: "100%",
    route: "/analytics",
    icon: "BarChart3",
    lazy: true,
    version: "651.0",
  },

  // Reports
  "reports": {
    id: "reports",
    name: "Reports Center",
    category: "operations",
    path: "pages/Reports",
    description: "Central de geração e gestão de relatórios",
    status: "active",
    completeness: "100%",
    route: "/reports",
    icon: "FileText",
    lazy: true,
    version: "651.0",
  },

  // Integrations
  "integrations": {
    id: "integrations",
    name: "Integrations Hub",
    category: "configuration",
    path: "pages/Integrations",
    description: "Hub de integrações e APIs externas",
    status: "active",
    completeness: "100%",
    route: "/integrations",
    icon: "Globe",
    lazy: true,
    version: "651.0",
  },

  // PATCH 658 - Admin & QA Routes (Previously Missing)
  "qa.preview-validation": {
    id: "qa.preview-validation",
    name: "QA Preview Dashboard",
    category: "configuration",
    path: "pages/qa/PreviewValidationDashboard",
    description: "PATCH 658 - Dashboard de validação QA para preview de componentes",
    status: "active",
    completeness: "100%",
    route: "/qa/preview",
    icon: "Shield",
    lazy: true,
    version: "658.0",
  },

  "admin.api-tester": {
    id: "admin.api-tester",
    name: "API Tester",
    category: "configuration",
    path: "pages/admin/api-tester",
    description: "PATCH 658 - Testador de APIs e endpoints",
    status: "active",
    completeness: "100%",
    route: "/admin/api-tester",
    icon: "Terminal",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.wall": {
    id: "admin.wall",
    name: "Admin Wall",
    category: "configuration",
    path: "pages/admin/wall",
    description: "PATCH 658 - Admin Wall CI/CD monitoring panel",
    status: "active",
    completeness: "100%",
    route: "/admin/wall",
    icon: "Monitor",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.checklists": {
    id: "admin.checklists",
    name: "Admin Checklists",
    category: "configuration",
    path: "pages/admin/checklists",
    description: "PATCH 658 - Gestão admin de checklists inteligentes",
    status: "active",
    completeness: "100%",
    route: "/admin/checklists",
    icon: "CheckSquare",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.checklists-dashboard": {
    id: "admin.checklists-dashboard",
    name: "Admin Checklists Dashboard",
    category: "configuration",
    path: "pages/admin/checklists-dashboard",
    description: "PATCH 658 - Dashboard de checklists do admin",
    status: "active",
    completeness: "100%",
    route: "/admin/checklists/dashboard",
    icon: "LayoutDashboard",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.lighthouse-dashboard": {
    id: "admin.lighthouse-dashboard",
    name: "Lighthouse Dashboard",
    category: "configuration",
    path: "pages/admin/LighthouseDashboard",
    description: "PATCH 658 - Dashboard de métricas Lighthouse",
    status: "active",
    completeness: "100%",
    route: "/admin/lighthouse-dashboard",
    icon: "Zap",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.ci-history": {
    id: "admin.ci-history",
    name: "CI History",
    category: "configuration",
    path: "pages/admin/ci-history",
    description: "PATCH 658 - Histórico de builds e CI/CD",
    status: "active",
    completeness: "100%",
    route: "/admin/ci-history",
    icon: "History",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.sgso-history": {
    id: "admin.sgso-history",
    name: "SGSO History",
    category: "compliance",
    path: "pages/admin/sgso/history",
    description: "PATCH 658 - Histórico de auditorias SGSO",
    status: "active",
    completeness: "100%",
    route: "/admin/sgso/history",
    icon: "History",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.control-center": {
    id: "admin.control-center",
    name: "Control Center",
    category: "configuration",
    path: "pages/admin/ControlCenter",
    description: "PATCH 658 - Centro de controle administrativo",
    status: "active",
    completeness: "100%",
    route: "/admin/control-center",
    icon: "Settings",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.performance": {
    id: "admin.performance",
    name: "Performance Dashboard",
    category: "configuration",
    path: "pages/admin/performance",
    description: "PATCH 658 - Dashboard de performance e métricas",
    status: "active",
    completeness: "100%",
    route: "/admin/performance",
    icon: "Activity",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },

  "admin.errors": {
    id: "admin.errors",
    name: "Error Tracking Dashboard",
    category: "configuration",
    path: "pages/admin/errors",
    description: "PATCH 658 - Dashboard de tracking de erros",
    status: "active",
    completeness: "100%",
    route: "/admin/errors",
    icon: "AlertTriangle",
    lazy: true,
    version: "658.0",
    permissions: ["admin"],
  },
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
