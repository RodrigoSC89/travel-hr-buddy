/**
 * PATCH 862: Sidebar Routes Configuration - WITH ROLE-BASED ACCESS
 * UNIFIED NAVIGATION - Single source of truth for all sidebar routes
 * 
 * @description This file centralizes all sidebar navigation routes.
 * Includes requiredRoles for sensitive routes to restrict access by profile.
 * 
 * TOTAL: 17 categories, 100+ modules
 */

import {
  Ship, Shield, Brain, Activity, Target, Globe, Eye, Mic, Satellite,
  Cloud, Radio, Anchor, Plane, Lock, AlertTriangle, TrendingUp,
  BarChart3, Wrench, Compass, Map, Waves, Zap, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart, Leaf,
  ShoppingCart, Link, Gamepad2, Database, Server, Cpu, Calendar,
  ClipboardList, Briefcase, DollarSign, Truck, HardDrive, Thermometer
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = 'admin' | 'hr_manager' | 'hr_analyst' | 'department_manager' | 'supervisor' | 'coordinator' | 'manager' | 'employee' | 'auditor';

export interface SidebarRoute {
  label: string;
  path: string;
  icon?: LucideIcon;
  emoji?: string;
  badge?: string;
  badgeType?: 'alerts' | 'notifications' | 'tasks' | 'static';
  requiredRoles?: UserRole[];
  minRole?: UserRole;
  status?: 'active' | 'beta' | 'new' | 'deprecated';
}

export interface SidebarGroup {
  title: string;
  defaultOpen?: boolean;
  requiredRoles?: UserRole[];
  items: SidebarRoute[];
}

// Role hierarchy for minRole checks (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  hr_manager: 80,
  department_manager: 70,
  manager: 60,
  supervisor: 50,
  coordinator: 40,
  hr_analyst: 30,
  auditor: 20,
  employee: 10,
};

/**
 * Check if user role has sufficient permissions
 */
export function hasRoleAccess(userRole: UserRole, requiredRoles?: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user meets minimum role requirement
 */
export function meetsMinRole(userRole: UserRole, minRole?: UserRole): boolean {
  if (!minRole) return true;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/**
 * MASTER SIDEBAR ROUTES - WITH ROLE-BASED ACCESS CONTROL
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // ============================================
  // 🏠 COMMAND CENTER (Principal)
  // ============================================
  {
    title: "🏠 Centro de Comando",
    defaultOpen: true,
    items: [
      { label: "Nautilus Command Center", path: "/nautilus-command", icon: Compass, emoji: "🧠", status: "active" },
      { label: "Dashboard Principal", path: "/dashboard", icon: BarChart3, emoji: "📊" },
      { label: "Executive BI", path: "/executive-bi", icon: TrendingUp, emoji: "📈", requiredRoles: ['admin', 'manager', 'department_manager', 'hr_manager'] },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️", requiredRoles: ['admin', 'supervisor', 'manager', 'department_manager'] },
      { label: "NOC Monitoring", path: "/noc-monitoring", icon: Activity, emoji: "📡", requiredRoles: ['admin', 'supervisor', 'manager', 'department_manager'] },
    ],
  },

  // ============================================
  // 🔒 SEGURANÇA & COMPLIANCE
  // ============================================
  {
    title: "🔒 Segurança & Compliance",
    defaultOpen: false,
    requiredRoles: ['admin', 'auditor', 'manager', 'hr_manager', 'department_manager'],
    items: [
      { label: "Security Center", path: "/security-center", icon: Shield, emoji: "🛡️", status: "active", requiredRoles: ['admin'] },
      { label: "AI Operations Center", path: "/ai-operations-center", icon: Brain, emoji: "🤖", requiredRoles: ['admin'], badgeType: 'alerts' },
      { label: "Auditoria de Segurança", path: "/auditoria-seguranca", icon: ClipboardList, emoji: "📋", requiredRoles: ['admin', 'auditor'] },
      { label: "Security Scanner", path: "/security-scanner", icon: Lock, emoji: "🔐", requiredRoles: ['admin'] },
      { label: "Compliance Hub", path: "/compliance-hub", icon: Shield, emoji: "✅", requiredRoles: ['admin', 'auditor', 'manager', 'hr_manager'] },
      { label: "Safety Guardian", path: "/safety-guardian", icon: Shield, emoji: "⛑️", requiredRoles: ['admin', 'manager', 'supervisor'] },
    ],
  },

  // ============================================
  // 🚢 OPERAÇÕES MARÍTIMAS
  // ============================================
  {
    title: "⚓ Operações Marítimas",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor', 'coordinator'],
    items: [
      { label: "Maritime Command", path: "/maritime-command", icon: Anchor, emoji: "⚓", requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor'] },
      { label: "Fleet Command Center", path: "/fleet-command", icon: Ship, emoji: "🚢", requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor'] },
      { label: "Voyage Command", path: "/voyage-command", icon: Map, emoji: "🗺️", requiredRoles: ['admin', 'manager', 'supervisor', 'coordinator'] },
      { label: "Mission Command", path: "/mission-command", icon: Target, emoji: "🎯", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Bridge Link", path: "/bridge-link", icon: Link, emoji: "🌉", requiredRoles: ['admin', 'manager', 'supervisor', 'coordinator'] },
      { label: "Drydock Management", path: "/drydock-management", icon: Anchor, emoji: "🏗️", requiredRoles: ['admin', 'manager', 'supervisor'] },
    ],
  },

  // ============================================
  // 🔧 MANUTENÇÃO
  // ============================================
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor', 'coordinator'],
    items: [
      { label: "Maintenance Command", path: "/maintenance-command", icon: Wrench, emoji: "🔧", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Manutenção Inteligente (MMI)", path: "/mmi", icon: Cpu, emoji: "🤖", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "MMI Dashboard", path: "/mmi-dashboard", icon: BarChart3, emoji: "📊", requiredRoles: ['admin', 'manager', 'supervisor', 'coordinator'] },
      { label: "MMI Jobs", path: "/mmi-jobs", icon: Briefcase, emoji: "📋", requiredRoles: ['admin', 'manager', 'supervisor', 'coordinator'] },
      { label: "MMI Forecast", path: "/mmi-forecast", icon: TrendingUp, emoji: "📈", requiredRoles: ['admin', 'manager', 'supervisor'] },
    ],
  },

  // ============================================
  // 🌊 OPERAÇÕES SUBMARINAS
  // ============================================
  {
    title: "🌊 Operações Submarinas",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor'],
    items: [
      { label: "Ocean Sonar AI", path: "/ocean-sonar", icon: Waves, emoji: "🔊", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Underwater Drone", path: "/underwater-drone", icon: Zap, emoji: "🤖", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "AutoSub Mission", path: "/auto-sub", icon: Ship, emoji: "🛸", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Sonar AI Enhancement", path: "/sonar-ai", icon: Radio, emoji: "📶", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Deep Risk AI", path: "/deep-risk-ai", icon: AlertTriangle, emoji: "⚠️", requiredRoles: ['admin', 'manager', 'supervisor'] },
    ],
  },

  // ============================================
  // 🧠 IA & AUTOMAÇÃO
  // ============================================
  {
    title: "🧠 IA & Automação",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor', 'coordinator'],
    items: [
      { label: "AI Command Center", path: "/ai-command", icon: Brain, emoji: "🧠", requiredRoles: ['admin', 'manager'] },
      { label: "IA Autônoma (Logs)", path: "/ai-ops/logs", icon: Zap, emoji: "🤖", badge: "NEW", requiredRoles: ['admin'] },
      { label: "Observabilidade IA", path: "/ai-observability", icon: Activity, emoji: "📊", requiredRoles: ['admin', 'manager'] },
      { label: "Workflow Command", path: "/workflow-command", icon: Zap, emoji: "🔄", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Journaling IA", path: "/ai-journaling", icon: FileText, emoji: "📝", requiredRoles: ['admin', 'manager', 'supervisor', 'coordinator'] },
      { label: "Auditoria de IA", path: "/ai-audit", icon: Brain, emoji: "🔍", requiredRoles: ['admin', 'auditor'] },
      { label: "Voice Assistant IA", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
      { label: "Assistente de Voz", path: "/assistant/voice", icon: Mic, emoji: "🗣️" },
    ],
  },

  // ============================================
  // 📊 TELEMETRIA & MONITORAMENTO
  // ============================================
  {
    title: "📊 Telemetria & Monitoramento",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor', 'coordinator'],
    items: [
      { label: "Telemetria 360°", path: "/telemetria", icon: Satellite, emoji: "🛰️", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Telemetria Preditiva", path: "/predictive-telemetry", icon: Activity, emoji: "📈", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Simulador Incidentes", path: "/simulador", icon: Target, emoji: "⚠️", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Modo Emergência", path: "/emergency-mode", icon: AlertTriangle, emoji: "🚨", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Calendário Operacional", path: "/operational-calendar", icon: Calendar, emoji: "📅" },
    ],
  },

  // ============================================
  // 🌐 APIs & INTEGRAÇÕES EXTERNAS
  // ============================================
  {
    title: "🌐 APIs & Integrações",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager'],
    items: [
      { label: "API Center", path: "/integracoes/api-center", icon: Server, emoji: "🌐", requiredRoles: ['admin'] },
      { label: "API Monitor", path: "/integracoes/api-monitor", icon: Radio, emoji: "📡", requiredRoles: ['admin', 'manager'] },
      { label: "Central Integrações", path: "/integracoes", icon: Globe, emoji: "🔗", requiredRoles: ['admin'] },
      { label: "Clima Marítimo", path: "/weather-maritime", icon: Cloud, emoji: "🌊" },
      { label: "AIS Tracker", path: "/ais-tracker-page", icon: Ship, emoji: "🚢" },
      { label: "Port API", path: "/port-api", icon: Anchor, emoji: "⚓" },
      { label: "Flight Tracker", path: "/flight-tracker", icon: Plane, emoji: "✈️" },
      { label: "NOAA Weather", path: "/noaa-weather", icon: Cloud, emoji: "🌦️" },
      { label: "OpenSky Flights", path: "/opensky-flights", icon: Plane, emoji: "🛫" },
      { label: "Earthquake Monitor", path: "/earthquake-monitor", icon: Thermometer, emoji: "🌋" },
      { label: "IA de Voz", path: "/voice-transcriber", icon: Mic, emoji: "🎙️" },
    ],
  },

  // ============================================
  // 📁 RELATÓRIOS & DOCUMENTOS
  // ============================================
  {
    title: "📁 Relatórios & Documentos",
    defaultOpen: false,
    items: [
      { label: "Reports Command", path: "/reports-command", icon: BarChart3, emoji: "📊", requiredRoles: ['admin', 'manager', 'department_manager', 'supervisor', 'auditor'] },
      { label: "Documentos IA", path: "/documents", icon: FileText, emoji: "📄" },
      { label: "Templates", path: "/templates", icon: FileText, emoji: "📋", requiredRoles: ['admin', 'manager', 'hr_manager'] },
      { label: "Checklists Inteligentes", path: "/admin/checklists", icon: ClipboardList, emoji: "✅", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Workflow Documentos ISM/MLC", path: "/document-workflow", icon: FileText, emoji: "📄", requiredRoles: ['admin', 'manager', 'auditor'] },
    ],
  },

  // ============================================
  // 📢 COMUNICAÇÃO & ALERTAS
  // ============================================
  {
    title: "📢 Comunicação & Alertas",
    defaultOpen: false,
    items: [
      { label: "Communication Command", path: "/communication-command", icon: MessageSquare, emoji: "📡", badgeType: 'notifications' },
      { label: "Alerts Command", path: "/alerts-command", icon: Bell, emoji: "🚨", badgeType: 'alerts' },
      { label: "Conectividade Marítima", path: "/maritime-connectivity", icon: Radio, emoji: "📡", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Workspace em Tempo Real", path: "/real-time-workspace", icon: Activity, emoji: "⏱️" },
    ],
  },

  // ============================================
  // 🔍 AUDITORIAS (ISM/MLC/SOLAS)
  // ============================================
  {
    title: "🔍 Auditorias",
    defaultOpen: false,
    requiredRoles: ['admin', 'auditor', 'manager', 'hr_manager'],
    items: [
      { label: "PEO-DP", path: "/peo-dp", icon: FileText, emoji: "📋", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "PEOTRAM", path: "/peotram", icon: FileText, emoji: "📋", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "SGSO", path: "/sgso", icon: FileText, emoji: "📋", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "IMCA Audit", path: "/imca-audit", icon: Shield, emoji: "🔍", requiredRoles: ['admin', 'auditor'] },
      { label: "Pre-OVID Inspection", path: "/pre-ovid-inspection", icon: Eye, emoji: "🔍", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "MLC Inspection", path: "/mlc-inspection", icon: Shield, emoji: "🔍", requiredRoles: ['admin', 'auditor', 'hr_manager'] },
      { label: "Gerador Pacotes PSC", path: "/psc-package", icon: Shield, emoji: "🛡️", requiredRoles: ['admin', 'auditor', 'manager'] },
    ],
  },

  // ============================================
  // 👥 RH & PESSOAS
  // ============================================
  {
    title: "👥 RH & Pessoas",
    defaultOpen: false,
    items: [
      { label: "Nautilus People Hub", path: "/nautilus-people", icon: Users, emoji: "👥", requiredRoles: ['admin', 'hr_manager', 'hr_analyst', 'department_manager'] },
      { label: "Gestão de Tripulação", path: "/crew-management", icon: Users, emoji: "👤", requiredRoles: ['admin', 'hr_manager', 'manager', 'supervisor'] },
      { label: "Bem-estar Tripulação", path: "/crew-wellbeing", icon: Heart, emoji: "❤️", requiredRoles: ['admin', 'hr_manager', 'manager'] },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Heart, emoji: "🏥", requiredRoles: ['admin', 'hr_manager', 'manager'] },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑", requiredRoles: ['admin'] },
    ],
  },

  // ============================================
  // 🎓 TREINAMENTOS
  // ============================================
  {
    title: "🎓 Treinamentos",
    defaultOpen: false,
    items: [
      { label: "Nautilus Academy", path: "/nautilus-academy", icon: BookOpen, emoji: "🎓" },
      { label: "SOLAS, ISPS & ISM Training", path: "/solas-isps-training", icon: Award, emoji: "📚" },
      { label: "Mentor DP", path: "/mentor-dp", icon: Users, emoji: "🧑‍🏫" },
      { label: "DP Intelligence", path: "/dp-intelligence", icon: Brain, emoji: "🧭" },
    ],
  },

  // ============================================
  // 💰 FINANÇAS & PROCUREMENT
  // ============================================
  {
    title: "💰 Finanças & Procurement",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'hr_manager'],
    items: [
      { label: "Finance Command", path: "/finance-command", icon: DollarSign, emoji: "💰", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "Analytics Command", path: "/analytics-command", icon: BarChart3, emoji: "📊", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "Operations Command", path: "/operations-command", icon: Settings, emoji: "⚙️", requiredRoles: ['admin', 'manager'] },
      { label: "Procurement Command", path: "/procurement-command", icon: ShoppingCart, emoji: "🛒", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "Gestão de Tarefas", path: "/task-management", icon: ClipboardList, emoji: "📋", badgeType: 'tasks' },
    ],
  },

  // ============================================
  // 🌱 ESG & SUSTENTABILIDADE
  // ============================================
  {
    title: "🌱 ESG & Sustentabilidade",
    defaultOpen: false,
    requiredRoles: ['admin', 'manager', 'department_manager', 'auditor'],
    items: [
      { label: "ESG & Emissões", path: "/esg-emissions", icon: Leaf, emoji: "🌱", requiredRoles: ['admin', 'manager', 'auditor'] },
      { label: "Gestão de Resíduos", path: "/waste-management", icon: Leaf, emoji: "♻️", requiredRoles: ['admin', 'manager', 'supervisor'] },
    ],
  },

  // ============================================
  // ✈️ VIAGENS & LOGÍSTICA
  // ============================================
  {
    title: "✈️ Viagens & Logística",
    defaultOpen: false,
    items: [
      { label: "Travel Command", path: "/travel-command", icon: Plane, emoji: "✈️" },
      { label: "Weather Command", path: "/weather-command", icon: Cloud, emoji: "🌤️" },
    ],
  },

  // ============================================
  // ⚙️ SISTEMA & CONFIGURAÇÕES
  // ============================================
  {
    title: "⚙️ Sistema & Configurações",
    defaultOpen: false,
    items: [
      { label: "Configurações", path: "/settings", icon: Settings, emoji: "⚙️" },
      { label: "Hub de Integrações", path: "/integrations", icon: Link, emoji: "🔗", requiredRoles: ['admin'] },
      { label: "API Gateway", path: "/api-gateway", icon: Globe, emoji: "🌐", requiredRoles: ['admin'] },
      { label: "Colaboração", path: "/collaboration", icon: Users, emoji: "🤝" },
      { label: "IoT Dashboard", path: "/iot", icon: HardDrive, emoji: "📊", requiredRoles: ['admin', 'manager', 'supervisor'] },
      { label: "Gamificação", path: "/gamification", icon: Gamepad2, emoji: "🎮" },
      { label: "Roadmap v3.2", path: "/roadmap", icon: Map, emoji: "🗺️", badge: "NEW" },
      { label: "QA Preview", path: "/qa/preview", icon: Eye, emoji: "🧪", requiredRoles: ['admin'] },
      { label: "Production Deploy", path: "/production-deploy", icon: Zap, emoji: "🚀", requiredRoles: ['admin'] },
    ],
  },
];

/**
 * Get all routes flattened for search/validation
 */
export function getAllRoutes(): SidebarRoute[] {
  return SIDEBAR_ROUTES.flatMap(group => group.items);
}

/**
 * Get total module count
 */
export function getModuleCount(): number {
  return getAllRoutes().length;
}

/**
 * Find group containing a specific path
 */
export function findGroupByPath(path: string): SidebarGroup | undefined {
  return SIDEBAR_ROUTES.find(group => 
    group.items.some(item => item.path === path)
  );
}

/**
 * Check if a path exists in the sidebar routes
 */
export function isValidRoute(path: string): boolean {
  return getAllRoutes().some(route => route.path === path);
}

/**
 * Get routes by status
 */
export function getRoutesByStatus(status: 'active' | 'beta' | 'new' | 'deprecated'): SidebarRoute[] {
  return getAllRoutes().filter(route => route.status === status);
}

/**
 * Get routes with badges
 */
export function getRoutesWithBadges(): SidebarRoute[] {
  return getAllRoutes().filter(route => route.badge || route.badgeType);
}

/**
 * Filter routes by user role
 */
export function filterRoutesByRole(routes: SidebarRoute[], userRole: UserRole): SidebarRoute[] {
  return routes.filter(route => hasRoleAccess(userRole, route.requiredRoles));
}

/**
 * Filter groups by user role (including nested routes)
 */
export function filterGroupsByRole(groups: SidebarGroup[], userRole: UserRole): SidebarGroup[] {
  return groups
    .filter(group => hasRoleAccess(userRole, group.requiredRoles))
    .map(group => ({
      ...group,
      items: filterRoutesByRole(group.items, userRole)
    }))
    .filter(group => group.items.length > 0);
}
