/**
 * Module Registry - PATCH 177.0
 * Last updated: 2025-12-08T00:00:00.000Z
 * 
 * PATCH 177.0 - Repository Audit & Integration
 * - Full repository audit completed
 * - All orphan routes identified and integrated
 * - Registry synchronized with page structure
 * - All modules with active status have valid routes
 * - Added missing modules: telemetry, maritime-checklists, forecast-global
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
  redirectTo?: string; // For deprecated modules that redirect to a unified module
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  // PATCH UNIFY-DASHBOARD: Dashboard + Executive Dashboard fundidos em Command Center
  "core.command-center": {
    id: "core.command-center",
    name: "Command Center",
    category: "core",
    path: "pages/CommandCenter",
    description: "Dashboard unificado com visão executiva e operacional - KPIs, métricas de frota, compliance e atividades",
    status: "active",
    completeness: "100%",
    route: "/command-center",
    icon: "LayoutDashboard",
    lazy: true,
    version: "2.0.0",
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

  // PATCH 192.0: Unified Fleet Command Center (fusão de 3 módulos: Fleet, Fleet Dashboard, Fleet Tracking)
  "operations.fleet-command": {
    id: "operations.fleet-command",
    name: "Fleet Command Center",
    category: "operations",
    path: "pages/FleetCommandCenter",
    description: "PATCH 192.0 - Centro unificado de operações de frota: gestão de embarcações, rastreamento em tempo real, métricas operacionais, manutenção e analytics. Fusão de: operations.fleet, operations.fleet-dashboard, operations.fleet-tracking",
    status: "active",
    completeness: "100%",
    route: "/fleet-command",
    icon: "Ship",
    lazy: true,
    version: "192.0",
  },

  // DEPRECATED: Módulos antigos redirecionam para fleet-command
  "operations.fleet": {
    id: "operations.fleet",
    name: "Fleet Management",
    category: "operations",
    path: "pages/FleetCommandCenter",
    description: "DEPRECATED - Use operations.fleet-command. Redirects to Fleet Command Center.",
    status: "deprecated",
    completeness: "100%",
    route: "/fleet",
    icon: "Ship",
    lazy: true,
    version: "192.0",
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
    path: "pages/AIInsights",
    description: "AI-powered insights, analytics, logs, alerts, and failure analysis",
    status: "active",
    completeness: "100%",
    route: "/ai-insights",
    icon: "Brain",
    lazy: true,
  },

  "intelligence.ai-copilot": {
    id: "intelligence.ai-copilot",
    name: "AI Copilot",
    category: "intelligence",
    path: "pages/ai/AICopilot",
    description: "Processamento de linguagem natural com IA",
    status: "active",
    completeness: "100%",
    route: "/ai/copilot",
    icon: "MessageSquare",
    lazy: true,
  },

  "intelligence.document-analysis": {
    id: "intelligence.document-analysis",
    name: "Document Analysis",
    category: "intelligence",
    path: "pages/ai/DocumentAnalysis",
    description: "Análise de documentos com OCR e IA",
    status: "active",
    completeness: "100%",
    route: "/ai/document-analysis",
    icon: "FileText",
    lazy: true,
  },

  "intelligence.predictive-insights": {
    id: "intelligence.predictive-insights",
    name: "Predictive Insights",
    category: "intelligence",
    path: "pages/ai/PredictiveInsights",
    description: "Análise preditiva com IA",
    status: "active",
    completeness: "100%",
    route: "/ai/insights",
    icon: "BarChart3",
    lazy: true,
  },

  "intelligence.navigation-assistant": {
    id: "intelligence.navigation-assistant",
    name: "Navigation Assistant",
    category: "intelligence",
    path: "pages/ai/NavigationAssistant",
    description: "Assistente de navegação com IA",
    status: "active",
    completeness: "100%",
    route: "/ai/navigation",
    icon: "Navigation",
    lazy: true,
  },

  "intelligence.compliance-ai": {
    id: "intelligence.compliance-ai",
    name: "Compliance AI",
    category: "intelligence",
    path: "pages/ai/ComplianceAI",
    description: "Verificação de compliance marítimo com IA",
    status: "active",
    completeness: "100%",
    route: "/ai/compliance",
    icon: "CheckCircle",
    lazy: true,
  },

  "intelligence.security-monitoring": {
    id: "intelligence.security-monitoring",
    name: "Security Monitoring",
    category: "intelligence",
    path: "pages/SecurityMonitoring",
    description: "Monitoramento de segurança com IA",
    status: "active",
    completeness: "100%",
    route: "/security",
    icon: "Shield",
    lazy: true,
  },

  // DEPRECATED: core.executive-dashboard - Fundido em core.command-center (PATCH UNIFY-DASHBOARD)
  // Redirect automático para /command-center

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

  // REMOVED: hr.training - Merged into nautilus-academy (PATCH UNIFY-ACADEMY)

  "hr.nautilus-people": {
    id: "hr.nautilus-people",
    name: "Nautilus People Hub",
    category: "hr",
    path: "modules/nautilus-people",
    description: "Revolutionary HR management module with integrated LLM - Employee registry, recruitment pipeline, performance center, climate engagement, people analytics, onboarding, time & attendance, career development, and AI-powered HR chatbot",
    status: "active",
    completeness: "100%",
    route: "/nautilus-people",
    icon: "Users",
    lazy: true,
    version: "1.0.0",
  },

  "hr.peo-dp": {
    id: "hr.peo-dp",
    name: "PEO-DP",
    category: "hr",
    path: "pages/PEODP",
    description: "PEO-DP Complete Management - Includes Class Surveys, STCW Matrix, MLC Compliance, FMEA, Audits, and AI Analysis",
    status: "active",
    completeness: "100%",
    route: "/peo-dp",
    icon: "Anchor",
    lazy: true,
    version: "2.0.0",
  },

  // REMOVED: hr.employee-portal - Integrated into operations.crew (PATCH 176.2)

  // PATCH UNIFY-3.0: Unified Maintenance Command Center
  "maintenance.command": {
    id: "maintenance.command",
    name: "Maintenance Command Center",
    category: "maintenance",
    path: "pages/MaintenanceCommandCenter",
    description: "Centro de Comando Unificado de Manutenção Naval - Fusão de 8 módulos: Manutenção Inteligente, MMI, Tarefas, Forecast IA, Histórico, Painel de Jobs, Dashboard BI, e Maintenance Planner",
    status: "active",
    completeness: "100%",
    route: "/maintenance-command",
    icon: "Wrench",
    lazy: true,
    version: "600.0",
  },

  // DEPRECATED: Módulos fundidos no Maintenance Command Center
  "maintenance.intelligent": {
    id: "maintenance.intelligent",
    name: "Manutenção Inteligente",
    category: "maintenance",
    path: "modules/intelligent-maintenance",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/intelligent-maintenance",
    redirectTo: "/maintenance-command",
    icon: "Wrench",
    lazy: true,
    version: "501.0",
  },

  "maintenance.planner": {
    id: "maintenance.planner",
    name: "Maintenance Planner",
    category: "maintenance",
    path: "modules/maintenance-planner",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/maintenance-planner",
    redirectTo: "/maintenance-command",
    icon: "Wrench",
    lazy: true,
  },

  // PATCH UNIFY-8.0: Unified Mission Command Center
  "operations.mission-command": {
    id: "operations.mission-command",
    name: "Mission Command Center",
    category: "operations",
    path: "pages/MissionCommandCenter",
    description: "Centro de Comando Unificado de Missão - Fusão de Mission Logs e Mission Control com AI Commander, KPIs, e execução em tempo real",
    status: "active",
    completeness: "100%",
    route: "/mission-command",
    icon: "Radio",
    lazy: true,
    version: "800.0",
  },

  "operations.mission-logs": {
    id: "operations.mission-logs",
    name: "Mission Logs",
    category: "operations",
    path: "pages/MissionLogsPage",
    description: "DEPRECATED: Redirecionado para Mission Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mission-logs",
    redirectTo: "/mission-command",
    icon: "FileText",
    lazy: true,
  },

  "maintenance.mmi": {
    id: "maintenance.mmi",
    name: "MMI - Manutenção Industrial",
    category: "maintenance",
    path: "pages/MMI",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi",
    redirectTo: "/maintenance-command",
    icon: "Wrench",
    lazy: true,
  },

  "maintenance.mmi-tasks": {
    id: "maintenance.mmi-tasks",
    name: "MMI - Tarefas",
    category: "maintenance",
    path: "pages/MMITasks",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi-tasks",
    redirectTo: "/maintenance-command",
    icon: "ClipboardList",
    lazy: true,
  },

  "maintenance.mmi-forecast": {
    id: "maintenance.mmi-forecast",
    name: "MMI - Forecast",
    category: "maintenance",
    path: "pages/MMIForecastPage",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi-forecast",
    redirectTo: "/maintenance-command",
    icon: "Sparkles",
    lazy: true,
  },

  "maintenance.mmi-history": {
    id: "maintenance.mmi-history",
    name: "MMI - Histórico",
    category: "maintenance",
    path: "pages/MMIHistory",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi-history",
    redirectTo: "/maintenance-command",
    icon: "History",
    lazy: true,
  },

  "maintenance.mmi-jobs-panel": {
    id: "maintenance.mmi-jobs-panel",
    name: "MMI - Painel de Jobs",
    category: "maintenance",
    path: "pages/MMIJobsPanel",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi-jobs-panel",
    redirectTo: "/maintenance-command",
    icon: "BarChart3",
    lazy: true,
  },

  "maintenance.mmi-dashboard": {
    id: "maintenance.mmi-dashboard",
    name: "MMI - Dashboard BI",
    category: "maintenance",
    path: "pages/MMIDashboard",
    description: "DEPRECATED: Redirecionado para Maintenance Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mmi-dashboard",
    redirectTo: "/maintenance-command",
    icon: "LayoutDashboard",
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
    description: "Collaborative workspace with real-time features",
    status: "active",
    completeness: "100%",
    route: "/real-time-workspace",
    icon: "Users",
    lazy: true,
  },

  "workspace.collaboration": {
    id: "workspace.collaboration",
    name: "Collaboration",
    category: "workspace",
    path: "pages/Collaboration",
    description: "Team collaboration tools with real-time workspace",
    status: "active",
    completeness: "100%",
    route: "/collaboration",
    icon: "Users",
    lazy: true,
  },

  "assistants.voice": {
    id: "assistants.voice",
    name: "Voice Assistant",
    category: "assistants",
    path: "modules/assistants/voice-assistant",
    description: "Voice-powered assistant with speech recognition",
    status: "active",
    completeness: "100%",
    route: "/assistant/voice",
    icon: "Mic",
    lazy: true,
  },

  "finance.hub": {
    id: "finance.hub",
    name: "Finance Hub",
    category: "finance",
    path: "pages/FinanceHub",
    description: "Financial management hub with budgets, expenses and approvals",
    status: "active",
    completeness: "100%",
    route: "/finance",
    icon: "DollarSign",
    lazy: true,
  },

  "documents.ai": {
    id: "documents.ai",
    name: "AI Documents",
    category: "documents",
    path: "pages/Documents",
    description: "AI-powered document management with upload and search",
    status: "active",
    completeness: "100%",
    route: "/documents",
    icon: "FileText",
    lazy: true,
  },

  "documents.incident-reports": {
    id: "documents.incident-reports",
    name: "Incident Reports",
    category: "documents",
    path: "pages/DPIncidents",
    description: "DP Incident reporting and intelligence system",
    status: "active",
    completeness: "100%",
    route: "/incident-reports",
    icon: "AlertOctagon",
    lazy: true,
  },

  "documents.templates": {
    id: "documents.templates",
    name: "Templates",
    category: "documents",
    path: "pages/Templates",
    description: "Document templates management",
    status: "active",
    completeness: "100%",
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
    status: "active",
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
    path: "pages/Users",
    description: "Manage users and permissions with multi-tenant support",
    status: "active",
    completeness: "100%",
    route: "/users",
    icon: "UserCog",
    permissions: ["admin"],
    lazy: true,
  },

  "features.price-alerts": {
    id: "features.price-alerts",
    name: "Price Alerts",
    category: "features",
    path: "pages/PriceAlerts",
    description: "Price monitoring and alerts with AI predictions",
    status: "active",
    completeness: "100%",
    route: "/price-alerts",
    icon: "Bell",
    lazy: true,
  },

  // REMOVED: features.checklists - Use compliance-hub (PATCH 176.2)

  "features.reservations": {
    id: "features.reservations",
    name: "Reservations",
    category: "features",
    path: "pages/Reservations",
    description: "Reservation management with calendar and status tracking",
    status: "active",
    completeness: "100%",
    route: "/reservations",
    icon: "Calendar",
    lazy: true,
  },

  "planning.calendar": {
    id: "planning.calendar",
    name: "Calendário & Agenda",
    category: "planning",
    path: "pages/CalendarView",
    description: "Visualização de agenda, escalas e tarefas programadas",
    status: "active",
    completeness: "100%",
    route: "/calendar",
    icon: "Calendar",
    lazy: true,
  },

  // REMOVED: features.travel - Duplicate of "travel" module (pages/Travel) - PATCH 176.1

  "features.vault-ai": {
    id: "features.vault-ai",
    name: "Vault AI",
    category: "features",
    path: "pages/VaultAI",
    description: "AI-powered secure vault with encryption and access control",
    status: "active",
    completeness: "100%",
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

  // DEPRECATED: emergency.emergency-response - Merged into solas-isps-training
  // "emergency.emergency-response": { ... }

  // SOLAS, ISPS & ISM Training - Unified Module
  "training.solas-isps-training": {
    id: "training.solas-isps-training",
    name: "SOLAS, ISPS & ISM Training",
    category: "hr",
    path: "modules/solas-isps-training/index",
    description: "Módulo unificado de treinamentos SOLAS, ISPS Code e ISM com IA preditiva e generativa, drills, certificações STCW e resposta a emergências",
    status: "active",
    completeness: "100%",
    route: "/solas-isps-training",
    icon: "ShieldAlert",
    lazy: true,
    version: "2.0.0",
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

  "core.system-hub": {
    id: "core.system-hub",
    name: "Centro de Operações",
    category: "core",
    path: "pages/SystemHub",
    description: "Unified system operations: monitoring, diagnostics, and roadmap",
    status: "active",
    completeness: "100%",
    route: "/system-hub",
    icon: "Server",
    lazy: true,
  },

  // DEPRECATED: Merged into system-hub
  "core.system-monitor": {
    id: "core.system-monitor",
    name: "System Monitor (Merged)",
    category: "core",
    path: "pages/SystemHub",
    description: "Merged into Centro de Operações",
    status: "deprecated",
    completeness: "100%",
    route: "/system-hub",
    icon: "Monitor",
    lazy: true,
  },

  "innovation.hub": {
    id: "innovation.hub",
    name: "IA & Inovação",
    category: "intelligence",
    path: "pages/Innovation",
    description: "Centro de Inteligência Artificial e Inovação Tecnológica",
    status: "active",
    completeness: "100%",
    route: "/innovation",
    icon: "Bot",
    lazy: true,
  },

  "intelligence.dp-intelligence": {
    id: "intelligence.dp-intelligence",
    name: "DP Intelligence",
    category: "intelligence",
    path: "pages/DPIntelligence",
    description: "Centro de Inteligência para Posicionamento Dinâmico",
    status: "active",
    completeness: "100%",
    route: "/dp-intelligence",
    icon: "Brain",
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
    path: "pages/Workflow",
    description: "Intelligent workflow automation",
    status: "active",
    completeness: "100%",
    route: "/workflow",
    icon: "GitBranch",
    lazy: true,
  },

  "operations.mission-control": {
    id: "operations.mission-control",
    name: "Mission Control Center",
    category: "operations",
    path: "modules/mission-control",
    description: "DEPRECATED: Redirecionado para Mission Command Center",
    status: "deprecated",
    completeness: "100%",
    route: "/mission-control",
    redirectTo: "/mission-command",
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
    path: "pages/PreOVIDInspection",
    description: "OCIMF Offshore Vessel Inspection Database - OVIQ4 (7300) com IA integrada",
    status: "active",
    completeness: "100%",
    route: "/pre-ovid-inspection",
    icon: "Ship",
    lazy: true,
    version: "650.0",
  },

  "compliance.mlc-inspection": {
    id: "compliance.mlc-inspection",
    name: "MLC Inspection",
    category: "compliance",
    path: "pages/MLCInspection",
    description: "Maritime Labour Convention 2006 Digital Inspection System com IA integrada",
    status: "active",
    completeness: "100%",
    route: "/mlc-inspection",
    icon: "Shield",
    lazy: true,
    version: "650.2",
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

  // ESG & Emissions Module
  "operations.esg-emissions": {
    id: "operations.esg-emissions",
    name: "ESG & Emissões",
    category: "operations",
    path: "modules/esg-emissions/index",
    description: "Monitoramento ambiental, carbon footprint, CII rating e compliance IMO/MARPOL",
    status: "active",
    completeness: "100%",
    route: "/esg-emissions",
    icon: "Leaf",
    lazy: true,
    version: "1.0.0",
  },

  // Safety Guardian Module
  "operations.safety-guardian": {
    id: "operations.safety-guardian",
    name: "Safety Guardian",
    category: "operations",
    path: "modules/safety-guardian/index",
    description: "Sistema de segurança com monitoramento de incidentes, near misses e IA preditiva",
    status: "active",
    completeness: "100%",
    route: "/safety-guardian",
    icon: "Shield",
    lazy: true,
    version: "1.0.0",
  },

  // Nautilus Academy Module
  "hr.nautilus-academy": {
    id: "hr.nautilus-academy",
    name: "Nautilus Academy",
    category: "hr",
    path: "modules/nautilus-academy/index",
    description: "Gestão inteligente de treinamentos e certificações marítimas com IA",
    status: "active",
    completeness: "100%",
    route: "/nautilus-academy",
    icon: "GraduationCap",
    lazy: true,
    version: "1.0.0",
  },

  // Smart Mobility Module
  "logistics.smart-mobility": {
    id: "logistics.smart-mobility",
    name: "Smart Mobility",
    category: "logistics",
    path: "modules/smart-mobility/index",
    description: "Gestão inteligente de viagens, hospedagens e logística de tripulação com IA",
    status: "active",
    completeness: "100%",
    route: "/smart-mobility",
    icon: "Plane",
    lazy: true,
    version: "1.0.0",
  },

  // Autonomous Procurement Module
  "logistics.autonomous-procurement": {
    id: "logistics.autonomous-procurement",
    name: "Autonomous Procurement",
    category: "logistics",
    path: "modules/autonomous-procurement/index",
    description: "Compras autônomas com IA, análise de fornecedores e rastreabilidade blockchain",
    status: "active",
    completeness: "100%",
    route: "/autonomous-procurement",
    icon: "ShoppingCart",
    lazy: true,
    version: "1.0.0",
  },

  // Medical Infirmary Module
  "hr.medical-infirmary": {
    id: "hr.medical-infirmary",
    name: "Enfermaria Digital",
    category: "hr",
    path: "modules/medical-infirmary/index",
    description: "Gestão de saúde, medicamentos e atendimentos conforme MLC e NORMAM",
    status: "active",
    completeness: "100%",
    route: "/medical-infirmary",
    icon: "Stethoscope",
    lazy: true,
    version: "1.0.0",
  },

  // Waste Management Module
  "compliance.waste-management": {
    id: "compliance.waste-management",
    name: "Gestão de Resíduos",
    category: "compliance",
    path: "modules/waste-management/index",
    description: "Conformidade MARPOL, Oil Record Book e Garbage Record Book",
    status: "active",
    completeness: "100%",
    route: "/waste-management",
    icon: "Recycle",
    lazy: true,
    version: "1.0.0",
  },

  // DEPRECATED: compliance.solas-training - Replaced by training.solas-isps-training
  // See training.solas-isps-training for the unified module

  // Procurement & Inventory AI-Driven Module
  "logistics.procurement-inventory": {
    id: "logistics.procurement-inventory",
    name: "Procurement & Inventory AI",
    category: "logistics",
    path: "modules/procurement-inventory/index",
    description: "Módulo completo de compras e controle de estoque com IA integrada: requisições, POs, fornecedores, previsão de demanda e chatbot inteligente",
    status: "active",
    completeness: "100%",
    route: "/procurement-inventory",
    icon: "ShoppingCart",
    lazy: true,
    version: "1.0.0",
  },

  // AI Dashboard Module - PATCH 653
  "intelligence.ai-dashboard": {
    id: "intelligence.ai-dashboard",
    name: "Dashboard IA",
    category: "intelligence",
    path: "pages/ai/AIDashboard",
    description: "Central de monitoramento de IA com métricas de adoção, sugestões de workflow e alertas do sistema",
    status: "active",
    completeness: "100%",
    route: "/ai-dashboard",
    icon: "Brain",
    lazy: true,
    version: "653.0",
  },

  // AI Workflow Suggestions Module - PATCH 653
  "intelligence.workflow-suggestions": {
    id: "intelligence.workflow-suggestions",
    name: "Sugestões IA Workflow",
    category: "intelligence",
    path: "pages/ai/WorkflowSuggestions",
    description: "Sugestões inteligentes geradas por IA para otimização de workflows",
    status: "active",
    completeness: "100%",
    route: "/workflow-suggestions",
    icon: "Lightbulb",
    lazy: true,
    version: "653.0",
  },

  // AI Adoption Metrics Module - PATCH 653
  "intelligence.ai-adoption": {
    id: "intelligence.ai-adoption",
    name: "Métricas de Adoção IA",
    category: "intelligence",
    path: "pages/ai/AIAdoption",
    description: "Scorecard e métricas de adoção do sistema de IA por módulo",
    status: "active",
    completeness: "100%",
    route: "/ai-adoption",
    icon: "TrendingUp",
    lazy: true,
    version: "653.0",
  },

  // PATCH 980: System Diagnostic and Delivery Tools
  "core.system-diagnostic": {
    id: "core.system-diagnostic",
    name: "System Diagnostic",
    category: "core",
    path: "pages/SystemDiagnostic",
    description: "Complete system health diagnostic with readiness checklist and technical package generation",
    status: "active",
    completeness: "100%",
    route: "/system-diagnostic",
    icon: "Activity",
    lazy: true,
    version: "980.0",
  },

  "core.execution-roadmap": {
    id: "core.execution-roadmap",
    name: "Execution Roadmap",
    category: "core",
    path: "pages/ExecutionRoadmap",
    description: "Technical execution roadmap for 7, 15, and 30 days with task tracking",
    status: "active",
    completeness: "100%",
    route: "/execution-roadmap",
    icon: "Calendar",
    lazy: true,
    version: "980.0",
  },

  "core.usage-simulation": {
    id: "core.usage-simulation",
    name: "Usage Simulation",
    category: "core",
    path: "pages/UsageSimulation",
    description: "Simulate real-world usage scenarios for system validation",
    status: "active",
    completeness: "100%",
    route: "/usage-simulation",
    icon: "Play",
    lazy: true,
    version: "980.0",
  },

  // PATCH 192.0: Deprecated - Merged into Fleet Command Center
  "operations.fleet-dashboard": {
    id: "operations.fleet-dashboard",
    name: "Fleet Dashboard",
    category: "operations",
    path: "pages/FleetDashboard",
    description: "DEPRECATED - Use operations.fleet-command. Redirects to Fleet Command Center.",
    status: "deprecated",
    completeness: "100%",
    route: "/fleet-dashboard",
    icon: "Ship",
    lazy: true,
    version: "192.0",
  },

  "operations.fleet-tracking": {
    id: "operations.fleet-tracking",
    name: "Fleet Tracking",
    category: "operations",
    path: "pages/FleetTracking",
    description: "DEPRECATED - Use operations.fleet-command. Redirects to Fleet Command Center.",
    status: "deprecated",
    completeness: "100%",
    route: "/fleet-tracking",
    icon: "MapPin",
    lazy: true,
    version: "192.0",
  },

  "operations.maritime-certifications": {
    id: "operations.maritime-certifications",
    name: "Maritime Certifications",
    category: "operations",
    path: "pages/MaritimeCertifications",
    description: "Maritime certification management and compliance tracking",
    status: "active",
    completeness: "100%",
    route: "/maritime-certifications",
    icon: "Shield",
    lazy: true,
    version: "981.0",
  },

  "intelligence.intelligent-alerts": {
    id: "intelligence.intelligent-alerts",
    name: "Intelligent Alerts",
    category: "intelligence",
    path: "pages/IntelligentAlerts",
    description: "AI-powered intelligent alert system with real-time monitoring",
    status: "active",
    completeness: "100%",
    route: "/intelligent-alerts",
    icon: "Zap",
    lazy: true,
    version: "981.0",
  },

  "operations.task-management": {
    id: "operations.task-management",
    name: "Task Management",
    category: "operations",
    path: "pages/TaskManagement",
    description: "Complete task management with scheduling and tracking",
    status: "active",
    completeness: "100%",
    route: "/task-management",
    icon: "Target",
    lazy: true,
    version: "981.0",
  },

  "intelligence.ai-assistant": {
    id: "intelligence.ai-assistant",
    name: "AI Assistant",
    category: "intelligence",
    path: "pages/ai/AIAssistantPage",
    description: "Assistente inteligente conversacional com IA avançada",
    status: "active",
    completeness: "100%",
    route: "/ai-assistant",
    icon: "MessageSquare",
    lazy: true,
  },

  "intelligence.predictive-analytics": {
    id: "intelligence.predictive-analytics",
    name: "Predictive Analytics",
    category: "intelligence",
    path: "pages/PredictiveAnalytics",
    description: "Análise preditiva avançada com machine learning",
    status: "active",
    completeness: "100%",
    route: "/predictive-analytics",
    icon: "Brain",
    lazy: true,
  },

  "intelligence.smart-automation": {
    id: "intelligence.smart-automation",
    name: "Smart Automation",
    category: "intelligence",
    path: "pages/ai/SmartAutomationPage",
    description: "Workflows automatizados com decisões baseadas em IA",
    status: "active",
    completeness: "100%",
    route: "/smart-automation",
    icon: "Workflow",
    lazy: true,
  },

  "intelligence.models-lab": {
    id: "intelligence.models-lab",
    name: "AI Models Lab",
    category: "intelligence",
    path: "pages/ai/AIModelsLab",
    description: "Laboratório de treinamento e teste de modelos ML",
    status: "active",
    completeness: "100%",
    route: "/models-lab",
    icon: "TestTube",
    lazy: true,
  },

  "intelligence.ai-processing": {
    id: "intelligence.ai-processing",
    name: "AI Processing Hub",
    category: "intelligence",
    path: "pages/ai/AIProcessingHub",
    description: "Processamento distribuído com GPU acelerada",
    status: "active",
    completeness: "100%",
    route: "/ai-processing",
    icon: "Cpu",
    lazy: true,
  },

  "intelligence.data-lake": {
    id: "intelligence.data-lake",
    name: "AI Data Lake",
    category: "intelligence",
    path: "pages/ai/AIDataLake",
    description: "Repositório centralizado de dados para IA",
    status: "active",
    completeness: "100%",
    route: "/data-lake",
    icon: "Database",
    lazy: true,
  },

  "emerging.iot": {
    id: "emerging.iot",
    name: "IoT Dashboard",
    category: "intelligence",
    path: "pages/IoT",
    description: "Monitoramento de dispositivos IoT em tempo real",
    status: "active",
    completeness: "100%",
    route: "/iot",
    icon: "Smartphone",
    lazy: true,
  },

  "emerging.ar": {
    id: "emerging.ar",
    name: "Realidade Aumentada",
    category: "intelligence",
    path: "pages/AR",
    description: "Interfaces imersivas para manutenção e treinamento",
    status: "active",
    completeness: "100%",
    route: "/ar",
    icon: "Eye",
    lazy: true,
  },

  "emerging.blockchain": {
    id: "emerging.blockchain",
    name: "Blockchain",
    category: "intelligence",
    path: "pages/Blockchain",
    description: "Segurança e transparência distribuída para documentos",
    status: "active",
    completeness: "100%",
    route: "/blockchain",
    icon: "Shield",
    lazy: true,
  },

  "emerging.edge-computing": {
    id: "emerging.edge-computing",
    name: "Edge Computing",
    category: "intelligence",
    path: "pages/emerging/EdgeComputingPage",
    description: "Processamento distribuído na borda da rede",
    status: "active",
    completeness: "100%",
    route: "/edge-computing",
    icon: "Network",
    lazy: true,
  },

  "emerging.quantum-computing": {
    id: "emerging.quantum-computing",
    name: "Computação Quântica",
    category: "intelligence",
    path: "pages/emerging/QuantumComputingPage",
    description: "Simulações avançadas com processadores quânticos",
    status: "active",
    completeness: "100%",
    route: "/quantum-computing",
    icon: "Atom",
    lazy: true,
  },

  "emerging.generative-ai": {
    id: "emerging.generative-ai",
    name: "IA Generativa",
    category: "intelligence",
    path: "pages/emerging/GenerativeAIPage",
    description: "Geração automática de documentos e conteúdo",
    status: "active",
    completeness: "100%",
    route: "/generative-ai",
    icon: "Sparkles",
    lazy: true,
  },

  "optimization.performance-optimizer": {
    id: "optimization.performance-optimizer",
    name: "Otimização de Performance",
    category: "features",
    path: "pages/PerformanceOptimizer",
    description: "Análise e otimização automática de sistemas",
    status: "active",
    completeness: "100%",
    route: "/performance-optimizer",
    icon: "Zap",
    lazy: true,
  },

  "features.gamification": {
    id: "features.gamification",
    name: "Gamificação",
    category: "features",
    path: "pages/Gamification",
    description: "Sistema de engajamento através de mecânicas de jogos",
    status: "active",
    completeness: "100%",
    route: "/gamification",
    icon: "Trophy",
    lazy: true,
  },

  "intelligence.advanced-analytics": {
    id: "intelligence.advanced-analytics",
    name: "Analytics Avançado",
    category: "intelligence",
    path: "pages/AdvancedAnalytics",
    description: "Dashboards interativos e análises avançadas",
    status: "active",
    completeness: "100%",
    route: "/advanced-analytics",
    icon: "BarChart3",
    lazy: true,
  },

  "intelligence.business-insights": {
    id: "intelligence.business-insights",
    name: "Insights de Negócio",
    category: "intelligence",
    path: "pages/BusinessInsights",
    description: "Inteligência de negócio e análise de tendências",
    status: "active",
    completeness: "100%",
    route: "/business-insights",
    icon: "TrendingUp",
    lazy: true,
  },

  "automation.workflows": {
    id: "automation.workflows",
    name: "Workflows Automatizados",
    category: "operations",
    path: "pages/automation/WorkflowsPage",
    description: "Automação completa de processos operacionais",
    status: "active",
    completeness: "100%",
    route: "/automation/workflows",
    icon: "Workflow",
    lazy: true,
  },

  "automation.rpa": {
    id: "automation.rpa",
    name: "RPA - Automação Robótica",
    category: "operations",
    path: "pages/automation/RPAPage",
    description: "Bots inteligentes para tarefas repetitivas",
    status: "active",
    completeness: "100%",
    route: "/automation/rpa",
    icon: "Bot",
    lazy: true,
  },

  "automation.triggers": {
    id: "automation.triggers",
    name: "Triggers Inteligentes",
    category: "operations",
    path: "pages/automation/IntelligentTriggersPage",
    description: "Ações automáticas baseadas em eventos e condições",
    status: "active",
    completeness: "100%",
    route: "/automation/triggers",
    icon: "Zap",
    lazy: true,
  },

  "intelligence.mentor-dp": {
    id: "intelligence.mentor-dp",
    name: "Mentor DP",
    category: "intelligence",
    path: "pages/MentorDP",
    description: "Módulo de mentoria técnica em Posicionamento Dinâmico com IA generativa e preditiva",
    status: "active",
    completeness: "100%",
    route: "/mentor-dp",
    icon: "Compass",
    lazy: true,
    version: "1.0.0",
  },

  "intelligence.nautilus-command": {
    id: "intelligence.nautilus-command",
    name: "Nautilus Command",
    category: "intelligence",
    path: "pages/NautilusCommand",
    description: "Centro de comando integrado com IA para gestão marítima avançada - Fleet Intelligence, Crew Management, Smart Inventory e Maintenance Hub",
    status: "active",
    completeness: "100%",
    route: "/nautilus-command",
    icon: "Brain",
    lazy: true,
    version: "1.0.0",
  },

  // PATCH: New AI & Innovation Modules
  "intelligence.workflow-visual": {
    id: "intelligence.workflow-visual",
    name: "Workflow Visual IA",
    category: "intelligence",
    path: "modules/workflow-visual",
    description: "Workflow visual dinâmico com IA integrada - React Flow com sugestões em tempo real, execução de ações automáticas",
    status: "active",
    completeness: "100%",
    route: "/workflow-visual",
    icon: "GitBranch",
    lazy: true,
    version: "1.0.0",
  },

  "operations.operational-calendar": {
    id: "operations.operational-calendar",
    name: "Calendário Operacional",
    category: "operations",
    path: "modules/operational-calendar",
    description: "Calendário operacional unificado - Todos eventos integrados por embarcação, IA detecta conflitos e reorganiza prazos",
    status: "active",
    completeness: "100%",
    route: "/operational-calendar",
    icon: "Calendar",
    lazy: true,
    version: "1.0.0",
  },

  "emergency.emergency-mode": {
    id: "emergency.emergency-mode",
    name: "Modo Emergência IA",
    category: "emergency",
    path: "modules/emergency-mode",
    description: "Modo emergência com IA de crise - Protocolos para 8 tipos de emergência, assistente IA em tempo real",
    status: "active",
    completeness: "100%",
    route: "/emergency-mode",
    icon: "AlertTriangle",
    lazy: true,
    version: "1.0.0",
  },

  // PATCH: Additional Lovable Modules
  "operations.voyage-planner": {
    id: "operations.voyage-planner",
    name: "Planejamento de Viagens IA",
    category: "operations",
    path: "modules/voyage-planner",
    description: "Planejamento de viagens marítimas assistido por IA - Otimização de rotas, carga, tripulação e combustível",
    status: "active",
    completeness: "100%",
    route: "/voyage-planner",
    icon: "Map",
    lazy: true,
    version: "1.0.0",
  },

  "intelligence.ai-journaling": {
    id: "intelligence.ai-journaling",
    name: "Journaling Automático IA",
    category: "intelligence",
    path: "modules/ai-journaling",
    description: "Journaling automático por IA - Resumo narrativo diário da operação por embarcação",
    status: "active",
    completeness: "100%",
    route: "/ai-journaling",
    icon: "BookOpen",
    lazy: true,
    version: "1.0.0",
  },

  "connectivity.maritime-connectivity": {
    id: "connectivity.maritime-connectivity",
    name: "Painel de Conectividade",
    category: "connectivity",
    path: "modules/maritime-connectivity",
    description: "Painel de conectividade marítima - Status satélite/terra, sincronização e modo offline",
    status: "active",
    completeness: "100%",
    route: "/maritime-connectivity",
    icon: "Wifi",
    lazy: true,
    version: "1.0.0",
  },

  "finance.route-cost-analysis": {
    id: "finance.route-cost-analysis",
    name: "Análise de Custo por Rota",
    category: "finance",
    path: "modules/route-cost-analysis",
    description: "Análise de custo por rota ou embarcação - Custos diretos vs operação com IA apontando desvios",
    status: "active",
    completeness: "100%",
    route: "/route-cost-analysis",
    icon: "DollarSign",
    lazy: true,
    version: "1.0.0",
  },

  "hr.crew-wellbeing": {
    id: "hr.crew-wellbeing",
    name: "Bem-estar da Tripulação",
    category: "hr",
    path: "modules/crew-wellbeing",
    description: "Monitoramento de bem-estar da tripulação - IA avalia risco de fadiga e sugere realocações",
    status: "active",
    completeness: "100%",
    route: "/crew-wellbeing",
    icon: "Heart",
    lazy: true,
    version: "1.0.0",
  },

  // ==========================================
  // PATCH COMPETITIVE-ANALYSIS: New Modules
  // Added based on maritime software competitive analysis
  // ==========================================
  
  "maintenance.drydock": {
    id: "maintenance.drydock",
    name: "Drydock & Hull Management",
    category: "maintenance",
    path: "pages/DrydockManagement",
    description: "Complete drydock planning, hull inspections, and cost prediction with AI",
    status: "active",
    completeness: "100%",
    route: "/drydock-management",
    icon: "Anchor",
    lazy: true,
    version: "1.0.0",
  },

  "logistics.supplier-marketplace": {
    id: "logistics.supplier-marketplace",
    name: "Supplier Marketplace",
    category: "logistics",
    path: "pages/SupplierMarketplace",
    description: "Maritime supplier marketplace with RFQ management and price benchmarking",
    status: "active",
    completeness: "100%",
    route: "/supplier-marketplace",
    icon: "ShoppingCart",
    lazy: true,
    version: "1.0.0",
  },

  // PATCH 177.0: Orphan Routes Integration
  "operations.telemetry": {
    id: "operations.telemetry",
    name: "Telemetry Dashboard",
    category: "operations",
    path: "pages/TelemetryPage",
    description: "Real-time telemetry monitoring and data visualization",
    status: "active",
    completeness: "100%",
    route: "/telemetry",
    icon: "Activity",
    lazy: true,
    version: "177.0",
  },

  "operations.maritime-checklists": {
    id: "operations.maritime-checklists",
    name: "Maritime Checklists",
    category: "operations",
    path: "pages/MaritimeChecklists",
    description: "Comprehensive maritime checklists for vessel operations and safety",
    status: "active",
    completeness: "100%",
    route: "/maritime-checklists",
    icon: "CheckSquare",
    lazy: true,
    version: "177.0",
  },

  "operations.forecast-global": {
    id: "operations.forecast-global",
    name: "Global Forecast",
    category: "operations",
    path: "pages/ForecastGlobal",
    description: "Global forecasting dashboard with weather and operational predictions",
    status: "active",
    completeness: "100%",
    route: "/forecast-global",
    icon: "Globe",
    lazy: true,
    version: "177.0",
  },

  "features.bridge-link": {
    id: "features.bridge-link",
    name: "Bridge Link",
    category: "features",
    path: "pages/BridgeLink",
    description: "Bridge communication and navigation system integration",
    status: "active",
    completeness: "100%",
    route: "/bridge-link",
    icon: "Radio",
    lazy: true,
    version: "177.0",
  },

  // DEPRECATED: Merged into system-hub
  "core.product-roadmap": {
    id: "core.product-roadmap",
    name: "Product Roadmap (Merged)",
    category: "core",
    path: "pages/SystemHub",
    description: "Merged into Centro de Operações",
    status: "deprecated",
    completeness: "100%",
    route: "/system-hub",
    icon: "Map",
    lazy: true,
    version: "177.0",
  },

  "core.production-deploy": {
    id: "core.production-deploy",
    name: "Production Deploy",
    category: "core",
    path: "pages/ProductionDeploy",
    description: "Production deployment management and monitoring",
    status: "active",
    completeness: "100%",
    route: "/production-deploy",
    icon: "Rocket",
    lazy: true,
    version: "177.0",
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
