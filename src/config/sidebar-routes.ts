/**
 * ⚡ SIDEBAR ROUTES - v9.0 MEGA-FUSION CONSOLIDADA
 * =========================================================
 * 7 MEGA-HUBs CANÔNICOS — Sidebar enxuto
 * 
 * Módulos absorvidos ficam dentro da aba "📦 Módulos" de cada hub.
 * O sidebar mostra apenas hubs + tabs principais.
 * 
 * GARANTIAS:
 * ✅ 7 mega-hubs canônicos
 * ✅ Zero funcionalidades perdidas (absorvidas nos hubs)
 * ✅ 12 Auditorias Marítimas via Compliance Hub
 * ✅ 10 Agentes IA via AI Hub
 * ✅ ~120 módulos acessíveis via aba "Módulos" em cada hub
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Settings, BookOpen, Award,
  BarChart3, Bot, Zap, Package,
  Cpu, AlertTriangle,
  DollarSign, Leaf, ClipboardList, Cloud,
  Calendar, Radio, Globe,
  Lock, Fuel, Layers
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
 * SIDEBAR v9.0 — 7 MEGA-HUBs com tabs principais apenas
 * Módulos absorvidos acessíveis via aba "📦 Módulos" dentro de cada hub
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // A. 🎯 COMMAND - Central Operacional
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎯 Command",
    defaultOpen: true,
    items: [
      { label: "Command Center", path: "/command", icon: Compass, emoji: "📊", badge: "HUB" },
      { label: "Operations", path: "/command?tab=operations", icon: Activity, emoji: "⚡" },
      { label: "Executive", path: "/command?tab=executive", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/command?tab=noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Security", path: "/command?tab=soc", icon: Shield, emoji: "🛡️" },
      { label: "Digital Twin", path: "/command?tab=digital-twin", icon: Ship, emoji: "🚢" },
      { label: "AI Copiloto", path: "/command?tab=ai-copilot", icon: Brain, emoji: "🧠" },
      { label: "📦 Módulos (11)", path: "/command?tab=modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // B. 🚀 OPS - Operações, Frota, Viagens, Finanças
  // ═══════════════════════════════════════════════════════════
  {
    title: "🚀 Ops",
    defaultOpen: false,
    items: [
      { label: "Operations Hub", path: "/ops", icon: Compass, emoji: "🚀", badge: "HUB" },
      { label: "Maritime", path: "/ops?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/ops?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/ops?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "Missions", path: "/ops?tab=missions", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/ops?tab=logistics", icon: Package, emoji: "📦" },
      { label: "Contracts", path: "/ops?tab=contracts", icon: FileText, emoji: "📝" },
      { label: "📦 Módulos (30)", path: "/ops?tab=modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // C. 🔧 MAINTENANCE - Manutenção & Engenharia
  // ═══════════════════════════════════════════════════════════
  {
    title: "🔧 Maintenance",
    defaultOpen: false,
    items: [
      { label: "Maintenance Hub", path: "/maintenance", icon: Wrench, emoji: "🔧", badge: "HUB" },
      { label: "Predictive", path: "/maintenance?tab=predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Drydock", path: "/maintenance?tab=drydock", icon: Anchor, emoji: "🔩" },
      { label: "Fuel & ROB", path: "/maintenance?tab=fuel", icon: Fuel, emoji: "⛽" },
      { label: "Digital Twin", path: "/maintenance?tab=digital-twin", icon: Cpu, emoji: "🎮", badge: "3D" },
      { label: "ESG Emissions", path: "/maintenance?tab=esg", icon: Leaf, emoji: "🌱" },
      { label: "MARPOL & Waste", path: "/maintenance?tab=waste-marpol", icon: Leaf, emoji: "♻️" },
      { label: "📦 Módulos (7)", path: "/maintenance?tab=modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // D. 🤖 AI - Inteligência Artificial
  // ═══════════════════════════════════════════════════════════
  {
    title: "🤖 AI",
    defaultOpen: false,
    items: [
      { label: "AI Hub", path: "/ai", icon: Brain, emoji: "🧠", badge: "HUB" },
      { label: "Agents", path: "/ai?tab=agents", icon: Bot, emoji: "🤖", badge: "10" },
      { label: "Chat & Voice", path: "/ai?tab=chat-voice", icon: MessageSquare, emoji: "💬" },
      { label: "Swarm Ops", path: "/ai?tab=swarm", icon: Users, emoji: "🤝" },
      { label: "Workflows", path: "/ai?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "11 AI Modules", path: "/ai?tab=modules", icon: Brain, emoji: "🌟", badge: "11" },
      { label: "Analytics", path: "/ai?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "📦 Módulos (20)", path: "/ai?tab=all-modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // E. 📡 TRACKING - Rastreamento & Telemetria
  // ═══════════════════════════════════════════════════════════
  {
    title: "📡 Tracking",
    defaultOpen: false,
    items: [
      { label: "Tracking Hub", path: "/tracking", icon: Satellite, emoji: "📡", badge: "HUB" },
      { label: "Real-time", path: "/tracking?tab=realtime", icon: Activity, emoji: "⚡" },
      { label: "AIS Fleet", path: "/tracking?tab=ais", icon: Ship, emoji: "🚢" },
      { label: "SATCOM", path: "/tracking?tab=satcom", icon: Radio, emoji: "📻" },
      { label: "Weather AI", path: "/tracking?tab=weather", icon: Cloud, emoji: "🌤️", badge: "AI" },
      { label: "Alerts", path: "/tracking?tab=alerts", icon: AlertTriangle, emoji: "🚨" },
      { label: "📦 Módulos (2)", path: "/tracking?tab=modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // F. 🛡️ COMPLIANCE - Auditorias & Conformidade
  // ═══════════════════════════════════════════════════════════
  {
    title: "🛡️ Compliance",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Scorecard", path: "/compliance?tab=scorecard", icon: BarChart3, emoji: "📊" },
      { label: "Audit Agents (10)", path: "/compliance?tab=audit-agents", icon: Bot, emoji: "🤖", badge: "AI" },
      { label: "Certificates", path: "/compliance?tab=certificates", icon: Award, emoji: "🏆" },
      { label: "Risk Matrix", path: "/compliance?tab=risk-matrix", icon: Target, emoji: "🎯" },
      { label: "NCs & CAPAs", path: "/compliance?tab=ncs-capas", icon: AlertTriangle, emoji: "⚠️" },
      { label: "Regulations", path: "/compliance?tab=regulations", icon: BookOpen, emoji: "📖" },
      { label: "12 Auditorias", path: "/compliance?tab=audits", icon: ClipboardList, emoji: "📋", badge: "12" },
      { label: "📦 Módulos (24)", path: "/compliance?tab=modules", icon: Layers, emoji: "📦" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // G. 📚 WORKBENCH - Centro de Trabalho
  // ═══════════════════════════════════════════════════════════
  {
    title: "📚 Workbench",
    defaultOpen: false,
    items: [
      { label: "Documents", path: "/workbench?section=docs", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "People & Crew", path: "/workbench?section=people", icon: Users, emoji: "👥" },
      { label: "Finance", path: "/workbench?section=finance", icon: DollarSign, emoji: "💰" },
      { label: "Travel", path: "/workbench?section=travel", icon: Globe, emoji: "✈️" },
      { label: "System", path: "/workbench?section=system", icon: Settings, emoji: "⚙️" },
      { label: "📦 Módulos (35)", path: "/workbench?section=modules", icon: Layers, emoji: "📦" },
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
 * Find which group a path belongs to
 */
export function findGroupByPath(path: string): SidebarGroup | undefined {
  return SIDEBAR_ROUTES.find(group => 
    group.items.some(item => {
      const basePath = item.path.split('?')[0];
      const searchPath = path.split('?')[0];
      return basePath === searchPath || item.path === path;
    })
  );
}

/**
 * Get total module count (hubs + absorbed modules)
 */
export function getModuleCount(): number {
  // 7 hubs + ~120 absorbed modules
  return 127;
}

/**
 * Get hub count
 */
export function getHubCount(): number {
  return SIDEBAR_ROUTES.length;
}

export default SIDEBAR_ROUTES;
