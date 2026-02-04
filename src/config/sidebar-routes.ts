/**
 * ⚡ SIDEBAR ROUTES - v6.0 FUSÃO FINAL
 * =========================================================
 * 10 HUBs CANÔNICOS - Estrutura Definitiva
 * 
 * Redução: 134 → 52 itens (61%)
 * Todos os módulos acessíveis via tabs internas
 * 
 * Documentação: docs/FUSION_REPORT_FINAL.md
 * Legacy Redirects: src/routes/legacy-redirects.tsx
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart,
  Link, BarChart3, Clock, Bot, Zap, Package, Truck,
  Briefcase, TrendingUp, Cpu, Mic, AlertTriangle, HardDrive,
  DollarSign, Leaf, ClipboardList, Database, Radar, Cloud,
  Gamepad2, Calendar, Server, Radio, Globe, Plane, Thermometer,
  ShoppingCart, Lock, GraduationCap, Trash2, Fuel, Stethoscope
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
 * SIDEBAR v6.0 - 10 HUBs CANÔNICOS DEFINITIVOS
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // 1. 🧠 CENTRAL DE COMANDO
  {
    title: "🧠 Central de Comando",
    defaultOpen: true,
    items: [
      { label: "Visão Geral", path: "/central-comando/visao-geral", icon: Compass, emoji: "📊" },
      { label: "Operações", path: "/central-comando/operacoes", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/central-comando/executivo", icon: BarChart3, emoji: "📈", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️", requiredRoles: ['admin', 'supervisor', 'manager'] },
      { label: "SOC Dashboard", path: "/soc", icon: Shield, emoji: "🛡️" },
    ],
  },

  // 2. 🚀 OPERATIONS COMMAND (Hub)
  {
    title: "🚀 Operations Command",
    defaultOpen: false,
    items: [
      { label: "Operations Hub", path: "/operations-command-hub", icon: Compass, emoji: "🚀", badge: "HUB" },
      { label: "Maritime", path: "/operations-command-hub?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/operations-command-hub?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/operations-command-hub?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "Mission", path: "/operations-command-hub?tab=mission", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/operations-command-hub?tab=logistics", icon: Package, emoji: "📦" },
      { label: "Vessel Contracts", path: "/vessel-contracts", icon: FileText, emoji: "📝" },
      { label: "Charter Party", path: "/charter-party", icon: FileText, emoji: "📜" },
    ],
  },

  // 3. 🔧 MAINTENANCE
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [
      { label: "Central de Manutenção", path: "/maintenance-command", icon: Wrench, emoji: "🔧" },
      { label: "Manutenção Preditiva", path: "/predictive-maintenance", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Digital Twin 3D", path: "/digital-twin", icon: Cpu, emoji: "🎮" },
      { label: "Drydock Management", path: "/drydock-management", icon: Anchor, emoji: "🔩" },
      { label: "Combustível", path: "/fuel-management", icon: Fuel, emoji: "⛽" },
    ],
  },

  // 4. 🤖 AI CONTROL TOWER (Hub)
  {
    title: "🤖 AI Control Tower",
    defaultOpen: false,
    items: [
      { label: "AI Control Tower", path: "/ai-control-tower", icon: Brain, emoji: "🧠", badge: "HUB" },
      { label: "Hub Central", path: "/ai-control-tower?tab=hub", icon: Brain, emoji: "🌟" },
      { label: "Chat & Assistants", path: "/ai-control-tower?tab=chat", icon: MessageSquare, emoji: "💬" },
      { label: "Agentes", path: "/ai-control-tower?tab=agents", icon: Bot, emoji: "🤖" },
      { label: "Workflows", path: "/ai-control-tower?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "Analytics", path: "/ai-control-tower?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "Observabilidade", path: "/ai-control-tower?tab=observability", icon: Activity, emoji: "👁️" },
      { label: "Auditoria IA", path: "/ai-control-tower?tab=audit", icon: FileText, emoji: "📋" },
      { label: "Voice Assistant", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
    ],
  },

  // 5. 📡 TRACKING & TELEMETRY (Hub)
  {
    title: "📡 Tracking & Telemetry",
    defaultOpen: false,
    items: [
      { label: "Tracking Hub", path: "/tracking-telemetry", icon: Satellite, emoji: "📡", badge: "HUB" },
      { label: "Visão Geral", path: "/tracking-telemetry?tab=overview", icon: Satellite, emoji: "🛰️" },
      { label: "Tempo Real", path: "/tracking-telemetry?tab=realtime", icon: Activity, emoji: "⚡" },
      { label: "Preditiva", path: "/tracking-telemetry?tab=predictive", icon: TrendingUp, emoji: "📈" },
      { label: "Alertas", path: "/tracking-telemetry?tab=alerts", icon: AlertTriangle, emoji: "🚨" },
      { label: "AIS Tracker", path: "/ais-tracker-page", icon: Ship, emoji: "🚢" },
      { label: "SATCOM Dashboard", path: "/satcom-dashboard", icon: Radio, emoji: "📻", badge: "NEW" },
    ],
  },

  // 6. 🛡️ COMPLIANCE & AUDITS (Hub)
  {
    title: "🛡️ Compliance & Audits",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance-unified", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Dashboard", path: "/compliance-unified?tab=dashboard", icon: BarChart3, emoji: "📊" },
      { label: "Agentes IA", path: "/compliance-unified?tab=agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      { label: "Auditorias", path: "/compliance-unified?tab=audits", icon: ClipboardList, emoji: "📋" },
      { label: "Certificações", path: "/compliance-unified?tab=certificates", icon: Award, emoji: "🏆" },
      { label: "NCs & CAPAs", path: "/compliance-unified?tab=ncs", icon: AlertTriangle, emoji: "⚠️" },
      { label: "Regulamentos", path: "/compliance-unified?tab=regulations", icon: BookOpen, emoji: "📜" },
      { label: "Matriz de Riscos", path: "/compliance-unified?tab=risks", icon: Target, emoji: "🎯" },
      { label: "Gestão de Resíduos", path: "/waste-management", icon: Trash2, emoji: "♻️", badge: "MARPOL" },
      { label: "Security Center", path: "/security-center", icon: Lock, emoji: "🔐", requiredRoles: ['admin'] },
    ],
  },

  // 7. 📄 DOCUMENT CENTER (Hub)
  {
    title: "📄 Document Center",
    defaultOpen: false,
    items: [
      { label: "Document Center", path: "/document-center", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "Documentos", path: "/document-center?tab=documents", icon: FileText, emoji: "📑" },
      { label: "Templates", path: "/document-center?tab=templates", icon: ClipboardList, emoji: "📋" },
      { label: "Checklists", path: "/document-center?tab=checklists", icon: ClipboardList, emoji: "✅" },
      { label: "Relatórios", path: "/document-center?tab=reports", icon: BarChart3, emoji: "📊" },
      { label: "Exportar", path: "/document-center?tab=export", icon: BarChart3, emoji: "📤" },
      { label: "Busca Avançada", path: "/document-center?tab=search", icon: Target, emoji: "🔍" },
      { label: "Knowledge Hub", path: "/knowledge-hub", icon: Brain, emoji: "🧠", badge: "RAG" },
    ],
  },

  // 8. 👥 PEOPLE HUB
  {
    title: "👥 People Hub",
    defaultOpen: false,
    items: [
      { label: "People Hub", path: "/people-hub", icon: Users, emoji: "👥", badge: "HUB" },
      { label: "Visão Geral", path: "/people-hub?tab=overview", icon: Users, emoji: "📊" },
      { label: "Talent & Recruitment", path: "/people-hub?tab=talent", icon: Target, emoji: "🎯" },
      { label: "Performance", path: "/people-hub?tab=performance", icon: TrendingUp, emoji: "📈" },
      { label: "Bem-estar", path: "/people-hub?tab=wellness", icon: Heart, emoji: "❤️" },
      { label: "Treinamento", path: "/people-hub?tab=training", icon: GraduationCap, emoji: "🎓" },
      { label: "Analytics", path: "/people-hub?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Stethoscope, emoji: "🏥", badge: "MLC" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑" },
      { label: "Escalas & Rotações", path: "/crew-scheduling", icon: Calendar, emoji: "📅" },
    ],
  },

  // 9. 💰 FINANCE & CONTRACTS
  {
    title: "💰 Finance & Contracts",
    defaultOpen: false,
    items: [
      { label: "Finance Command", path: "/finance-command", icon: DollarSign, emoji: "💰" },
      { label: "Voyage Accounting", path: "/voyage-accounting", icon: DollarSign, emoji: "📊" },
      { label: "Procurement", path: "/procurement-command", icon: ShoppingCart, emoji: "🛒" },
      { label: "Supplier Portal", path: "/supplier-portal", icon: ShoppingCart, emoji: "🏭" },
      { label: "ESG & Emissões", path: "/esg-emissions", icon: Leaf, emoji: "🌱" },
      { label: "Travel Command", path: "/travel-command", icon: Plane, emoji: "✈️" },
    ],
  },

  // 10. ⚙️ SETTINGS
  {
    title: "⚙️ Sistema",
    defaultOpen: false,
    items: [
      { label: "Configurações", path: "/settings", icon: Settings, emoji: "⚙️" },
      { label: "Integrações", path: "/integrations", icon: Link, emoji: "🔗" },
      { label: "API Gateway", path: "/api-gateway", icon: Globe, emoji: "🌐" },
      { label: "IoT Dashboard", path: "/iot-dashboard", icon: Thermometer, emoji: "🌡️" },
      { label: "Roadmap", path: "/roadmap", icon: Map, emoji: "🗺️" },
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
