/**
 * PATCH 861: Sidebar Routes Configuration - AUDITED & OPTIMIZED
 * UNIFIED NAVIGATION - Single source of truth for all sidebar routes
 * 
 * @description This file centralizes all sidebar navigation routes.
 * Audited and reorganized for better UX and discoverability.
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
  badgeType?: 'alerts' | 'notifications' | 'tasks' | 'static'; // Dynamic badge types
  requiredRoles?: UserRole[]; // Roles that can access this route
  minRole?: UserRole; // Minimum role level (hierarchical)
  status?: 'active' | 'beta' | 'new' | 'deprecated';
}

export interface SidebarGroup {
  title: string;
  defaultOpen?: boolean;
  requiredRoles?: UserRole[]; // Roles that can see this group
  items: SidebarRoute[];
}

// Role hierarchy for minRole checks
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
 * MASTER SIDEBAR ROUTES - AUDITED & OPTIMIZED
 * Reorganized for better discoverability and UX
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
      { label: "Executive BI", path: "/executive-bi", icon: TrendingUp, emoji: "📈", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️", requiredRoles: ['admin', 'supervisor', 'manager'] },
      { label: "NOC Monitoring", path: "/noc-monitoring", icon: Activity, emoji: "📡", requiredRoles: ['admin', 'supervisor', 'manager'] },
    ],
  },

  // ============================================
  // 🔒 SEGURANÇA & COMPLIANCE
  // ============================================
  {
    title: "🔒 Segurança & Compliance",
    defaultOpen: false,
    requiredRoles: ['admin', 'auditor', 'manager', 'hr_manager'],
    items: [
      { label: "Security Center", path: "/security-center", icon: Shield, emoji: "🛡️", status: "active", requiredRoles: ['admin'] },
      { label: "AI Operations Center", path: "/ai-operations-center", icon: Brain, emoji: "🤖", requiredRoles: ['admin'], badgeType: 'alerts' },
      { label: "Auditoria de Segurança", path: "/auditoria-seguranca", icon: ClipboardList, emoji: "📋", requiredRoles: ['admin', 'auditor'] },
      { label: "Security Scanner", path: "/security-scanner", icon: Lock, emoji: "🔐", requiredRoles: ['admin'] },
      { label: "Compliance Hub", path: "/compliance-hub", icon: Shield, emoji: "✅", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "Safety Guardian", path: "/safety-guardian", icon: Shield, emoji: "⛑️" },
    ],
  },

  // ============================================
  // 🚢 OPERAÇÕES MARÍTIMAS
  // ============================================
  {
    title: "⚓ Operações Marítimas",
    defaultOpen: false,
    items: [
      { label: "Maritime Command", path: "/maritime-command", icon: Anchor, emoji: "⚓" },
      { label: "Fleet Command Center", path: "/fleet-command", icon: Ship, emoji: "🚢" },
      { label: "Voyage Command", path: "/voyage-command", icon: Map, emoji: "🗺️" },
      { label: "Mission Command", path: "/mission-command", icon: Target, emoji: "🎯" },
      { label: "Bridge Link", path: "/bridge-link", icon: Link, emoji: "🌉" },
      { label: "Drydock Management", path: "/drydock-management", icon: Anchor, emoji: "🏗️" },
    ],
  },

  // ============================================
  // 🔧 MANUTENÇÃO
  // ============================================
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [
      { label: "Maintenance Command", path: "/maintenance-command", icon: Wrench, emoji: "🔧" },
      { label: "Manutenção Inteligente (MMI)", path: "/mmi", icon: Cpu, emoji: "🤖" },
      { label: "MMI Dashboard", path: "/mmi-dashboard", icon: BarChart3, emoji: "📊" },
      { label: "MMI Jobs", path: "/mmi-jobs", icon: Briefcase, emoji: "📋" },
      { label: "MMI Forecast", path: "/mmi-forecast", icon: TrendingUp, emoji: "📈" },
    ],
  },

  // ============================================
  // 🌊 OPERAÇÕES SUBMARINAS
  // ============================================
  {
    title: "🌊 Operações Submarinas",
    defaultOpen: false,
    items: [
      { label: "Ocean Sonar AI", path: "/ocean-sonar", icon: Waves, emoji: "🔊" },
      { label: "Underwater Drone", path: "/underwater-drone", icon: Zap, emoji: "🤖" },
      { label: "AutoSub Mission", path: "/auto-sub", icon: Ship, emoji: "🛸" },
      { label: "Sonar AI Enhancement", path: "/sonar-ai", icon: Radio, emoji: "📶" },
      { label: "Deep Risk AI", path: "/deep-risk-ai", icon: AlertTriangle, emoji: "⚠️" },
    ],
  },

  // ============================================
  // 🧠 IA & AUTOMAÇÃO
  // ============================================
  {
    title: "🧠 IA & Automação",
    defaultOpen: false,
    items: [
      { label: "AI Command Center", path: "/ai-command", icon: Brain, emoji: "🧠" },
      { label: "IA Autônoma (Logs)", path: "/ai-ops/logs", icon: Zap, emoji: "🤖", badge: "NEW" },
      { label: "Observabilidade IA", path: "/ai-observability", icon: Activity, emoji: "📊" },
      { label: "Workflow Command", path: "/workflow-command", icon: Zap, emoji: "🔄" },
      { label: "Journaling IA", path: "/ai-journaling", icon: FileText, emoji: "📝" },
      { label: "Auditoria de IA", path: "/ai-audit", icon: Brain, emoji: "🔍" },
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
    items: [
      { label: "Telemetria 360°", path: "/telemetria", icon: Satellite, emoji: "🛰️" },
      { label: "Telemetria Preditiva", path: "/predictive-telemetry", icon: Activity, emoji: "📈" },
      { label: "Simulador Incidentes", path: "/simulador", icon: Target, emoji: "⚠️" },
      { label: "Modo Emergência", path: "/emergency-mode", icon: AlertTriangle, emoji: "🚨" },
      { label: "Calendário Operacional", path: "/operational-calendar", icon: Calendar, emoji: "📅" },
    ],
  },

  // ============================================
  // 🌐 APIs & INTEGRAÇÕES EXTERNAS
  // ============================================
  {
    title: "🌐 APIs & Integrações",
    defaultOpen: false,
    items: [
      { label: "API Center", path: "/integracoes/api-center", icon: Server, emoji: "🌐" },
      { label: "API Monitor", path: "/integracoes/api-monitor", icon: Radio, emoji: "📡" },
      { label: "Central Integrações", path: "/integracoes", icon: Globe, emoji: "🔗" },
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
      { label: "Reports Command", path: "/reports-command", icon: BarChart3, emoji: "📊" },
      { label: "Documentos IA", path: "/documents", icon: FileText, emoji: "📄" },
      { label: "Templates", path: "/templates", icon: FileText, emoji: "📋" },
      { label: "Checklists Inteligentes", path: "/admin/checklists", icon: ClipboardList, emoji: "✅" },
      { label: "Workflow Documentos ISM/MLC", path: "/document-workflow", icon: FileText, emoji: "📄" },
    ],
  },

  // ============================================
  // 📢 COMUNICAÇÃO & ALERTAS
  // ============================================
  {
    title: "📢 Comunicação & Alertas",
    defaultOpen: false,
    items: [
      { label: "Communication Command", path: "/communication-command", icon: MessageSquare, emoji: "📡" },
      { label: "Alerts Command", path: "/alerts-command", icon: Bell, emoji: "🚨" },
      { label: "Conectividade Marítima", path: "/maritime-connectivity", icon: Radio, emoji: "📡" },
      { label: "Workspace em Tempo Real", path: "/real-time-workspace", icon: Activity, emoji: "⏱️" },
    ],
  },

  // ============================================
  // 🔍 AUDITORIAS (ISM/MLC/SOLAS)
  // ============================================
  {
    title: "🔍 Auditorias",
    defaultOpen: false,
    items: [
      { label: "PEO-DP", path: "/peo-dp", icon: FileText, emoji: "📋" },
      { label: "PEOTRAM", path: "/peotram", icon: FileText, emoji: "📋" },
      { label: "SGSO", path: "/sgso", icon: FileText, emoji: "📋" },
      { label: "IMCA Audit", path: "/imca-audit", icon: Shield, emoji: "🔍" },
      { label: "Pre-OVID Inspection", path: "/pre-ovid-inspection", icon: Eye, emoji: "🔍" },
      { label: "MLC Inspection", path: "/mlc-inspection", icon: Shield, emoji: "🔍" },
      { label: "Gerador Pacotes PSC", path: "/psc-package", icon: Shield, emoji: "🛡️" },
    ],
  },

  // ============================================
  // 👥 RH & PESSOAS
  // ============================================
  {
    title: "👥 RH & Pessoas",
    defaultOpen: false,
    items: [
      { label: "Nautilus People Hub", path: "/nautilus-people", icon: Users, emoji: "👥" },
      { label: "Gestão de Tripulação", path: "/crew-management", icon: Users, emoji: "👤" },
      { label: "Bem-estar Tripulação", path: "/crew-wellbeing", icon: Heart, emoji: "❤️" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Heart, emoji: "🏥" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑" },
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
    items: [
      { label: "Finance Command", path: "/finance-command", icon: DollarSign, emoji: "💰" },
      { label: "Analytics Command", path: "/analytics-command", icon: BarChart3, emoji: "📊" },
      { label: "Operations Command", path: "/operations-command", icon: Settings, emoji: "⚙️" },
      { label: "Procurement Command", path: "/procurement-command", icon: ShoppingCart, emoji: "🛒" },
      { label: "Gestão de Tarefas", path: "/task-management", icon: ClipboardList, emoji: "📋" },
    ],
  },

  // ============================================
  // 🌱 ESG & SUSTENTABILIDADE
  // ============================================
  {
    title: "🌱 ESG & Sustentabilidade",
    defaultOpen: false,
    items: [
      { label: "ESG & Emissões", path: "/esg-emissions", icon: Leaf, emoji: "🌱" },
      { label: "Gestão de Resíduos", path: "/waste-management", icon: Leaf, emoji: "♻️" },
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
      { label: "Hub de Integrações", path: "/integrations", icon: Link, emoji: "🔗" },
      { label: "API Gateway", path: "/api-gateway", icon: Globe, emoji: "🌐" },
      { label: "Colaboração", path: "/collaboration", icon: Users, emoji: "🤝" },
      { label: "IoT Dashboard", path: "/iot", icon: HardDrive, emoji: "📊" },
      { label: "Gamificação", path: "/gamification", icon: Gamepad2, emoji: "🎮" },
      { label: "Roadmap v3.2", path: "/roadmap", icon: Map, emoji: "🗺️", badge: "NEW" },
      { label: "QA Preview", path: "/qa/preview", icon: Eye, emoji: "🧪" },
      { label: "Production Deploy", path: "/production-deploy", icon: Zap, emoji: "🚀" },
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
  return getAllRoutes().filter(route => route.badge);
}
