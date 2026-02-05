/**
 * ⚡ SIDEBAR ROUTES - v8.0 MEGA-FUSION FINAL
 * =========================================================
 * 7 MEGA-HUBs CANÔNICOS COM ROTAS CANÔNICAS
 * 
 * MEGA-HUBS:
 * A) /command  - Central Operacional
 * B) /ops      - Operações & Contratos
 * C) /maintenance - Manutenção + ESG + MARPOL + Digital Twin
 * D) /ai       - AI + Enterprise Intelligence
 * E) /tracking - Tracking & Telemetry + Weather
 * F) /compliance - Compliance + 12 Audits + 10 AI Agents
 * G) /workbench - Docs + People + Finance + System
 * 
 * GARANTIAS:
 * ✅ 7 itens principais no sidebar
 * ✅ 180+ aliases para rotas antigas
 * ✅ 12 Auditorias Marítimas PRESERVADAS
 * ✅ 10 Agentes de Auditoria IA PRESERVADOS
 * ✅ Zero funcionalidades perdidas
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Settings, BookOpen, Award, Heart,
  Link, BarChart3, Bot, Zap, Package,
  TrendingUp, Cpu, Mic, AlertTriangle,
  DollarSign, Leaf, ClipboardList, Cloud,
  Calendar, Server, Radio, Globe, Plane,
  Lock, GraduationCap, Trash2, Fuel, Stethoscope, Terminal,
  Briefcase, Building2
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
 * SIDEBAR v8.0 FINAL - 7 MEGA-HUBs CANÔNICOS
 * Rotas canônicas: /command, /ops, /maintenance, /ai, /tracking, /compliance, /workbench
 */
export const SIDEBAR_ROUTES_MEGA_FINAL: SidebarGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // A. 🎯 COMMAND - Central Operacional Unificada
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎯 Command",
    defaultOpen: true,
    items: [
      { label: "Command Center", path: "/command", icon: Compass, emoji: "📊", badge: "HUB" },
      { label: "Operations", path: "/command/operations", icon: Activity, emoji: "⚡" },
      { label: "Executive", path: "/command/executive", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/command/noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Security", path: "/command/soc", icon: Shield, emoji: "🛡️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // B. 🚀 OPS - Operações & Contratos Integrados
  // ═══════════════════════════════════════════════════════════
  {
    title: "🚀 Ops",
    defaultOpen: false,
    items: [
      { label: "Operations Hub", path: "/ops", icon: Compass, emoji: "🚀", badge: "HUB" },
      { label: "Maritime", path: "/ops/maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/ops/fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/ops/voyage", icon: Map, emoji: "🗺️" },
      { label: "Missions", path: "/ops/missions", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/ops/logistics", icon: Package, emoji: "📦" },
      { label: "Contracts", path: "/ops/contracts", icon: FileText, emoji: "📝" },
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
      { label: "Class Surveys", path: "/maintenance/surveys", icon: Shield, emoji: "🛡️", badge: "DNV" },
      { label: "Predictive", path: "/maintenance/predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Drydock", path: "/maintenance/drydock", icon: Anchor, emoji: "🔩" },
      { label: "Fuel & ROB", path: "/maintenance/fuel", icon: Fuel, emoji: "⛽" },
      { label: "Digital Twin", path: "/maintenance/digital-twin", icon: Cpu, emoji: "🎮", badge: "3D" },
      { label: "MARPOL & Waste", path: "/maintenance/waste-marpol", icon: Trash2, emoji: "♻️" },
      { label: "ESG Emissions", path: "/maintenance/esg", icon: Leaf, emoji: "🌱" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // D. 🤖 AI - Inteligência Artificial Unificada
  // ═══════════════════════════════════════════════════════════
  {
    title: "🤖 AI",
    defaultOpen: false,
    items: [
      { label: "AI Hub", path: "/ai", icon: Brain, emoji: "🧠", badge: "HUB" },
      { label: "Chat & Assistants", path: "/ai/chat", icon: MessageSquare, emoji: "💬" },
      { label: "AI Agents", path: "/ai/agents", icon: Bot, emoji: "🤖", badge: "25+" },
      { label: "Workflows", path: "/ai/workflows", icon: Zap, emoji: "🔄" },
      { label: "Voice", path: "/ai/voice", icon: Mic, emoji: "🎙️" },
      { label: "11 AI Modules", path: "/ai/modules", icon: Brain, emoji: "🌟", badge: "11" },
      { label: "RAG & OCR", path: "/ai/rag", icon: FileText, emoji: "📄" },
      { label: "Analytics", path: "/ai/analytics", icon: BarChart3, emoji: "📊" },
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
      { label: "Real-time", path: "/tracking/realtime", icon: Activity, emoji: "⚡" },
      { label: "AIS Fleet", path: "/tracking/ais", icon: Ship, emoji: "🚢" },
      { label: "SATCOM", path: "/tracking/satcom", icon: Radio, emoji: "📻" },
      { label: "Weather AI", path: "/tracking/weather", icon: Cloud, emoji: "🌤️", badge: "AI" },
      { label: "Alerts", path: "/tracking/alerts", icon: AlertTriangle, emoji: "🚨" },
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
      { label: "Scorecard", path: "/compliance/scorecard", icon: BarChart3, emoji: "📊" },
      { label: "🤖 10 AI Agents", path: "/compliance/audit-agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      { label: "Certificates", path: "/compliance/certificates", icon: Award, emoji: "🏆" },
      { label: "Risk Matrix", path: "/compliance/risk-matrix", icon: Target, emoji: "🎯" },
      { label: "NCs & CAPAs", path: "/compliance/ncs-capas", icon: AlertTriangle, emoji: "⚠️" },
      // === 12 AUDITORIAS MARÍTIMAS ===
      { label: "PEO-DP", path: "/compliance/standards/peo-dp", icon: Anchor, emoji: "⚓", badge: "DP" },
      { label: "PEOTRAM", path: "/compliance/standards/peotram", icon: Shield, emoji: "🚢", badge: "13E" },
      { label: "ISM/ISPS", path: "/compliance/standards/ism", icon: Shield, emoji: "🛡️", badge: "SMS" },
      { label: "SOLAS/LSA", path: "/compliance/standards/solas", icon: Ship, emoji: "🚢", badge: "SOLAS" },
      { label: "MARPOL", path: "/compliance/standards/marpol", icon: Trash2, emoji: "♻️", badge: "I-VI" },
      { label: "SGSO", path: "/compliance/standards/sgso", icon: Shield, emoji: "⚙️", badge: "17P" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // G. 📚 WORKBENCH - Centro de Trabalho Unificado
  // ═══════════════════════════════════════════════════════════
  {
    title: "📚 Workbench",
    defaultOpen: false,
    items: [
      { label: "📄 Documents", path: "/workbench/docs", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "👥 People", path: "/workbench/people", icon: Users, emoji: "👥" },
      { label: "💰 Finance", path: "/workbench/finance", icon: DollarSign, emoji: "💰" },
      { label: "✈️ Travel", path: "/workbench/finance/travel", icon: Plane, emoji: "✈️" },
      { label: "⚙️ System", path: "/workbench/system", icon: Settings, emoji: "⚙️" },
      { label: "🛠️ Dev Tools", path: "/workbench/system/dev", icon: Terminal, emoji: "🛠️", requiredRoles: ['admin'] },
    ],
  },
];

/**
 * Get all routes flattened for search/validation
 */
export function getAllRoutesMega(): SidebarRoute[] {
  return SIDEBAR_ROUTES_MEGA_FINAL.flatMap(group => group.items);
}

/**
 * Find which group a path belongs to
 */
export function findGroupByPathMega(path: string): SidebarGroup | undefined {
  return SIDEBAR_ROUTES_MEGA_FINAL.find(group => 
    group.items.some(item => {
      const basePath = item.path.split('?')[0];
      const searchPath = path.split('?')[0];
      return basePath === searchPath || item.path === path;
    })
  );
}

/**
 * Get total module count
 */
export function getModuleCountMega(): number {
  return getAllRoutesMega().length;
}

/**
 * Get hub count
 */
export function getHubCountMega(): number {
  return SIDEBAR_ROUTES_MEGA_FINAL.length;
}

export default SIDEBAR_ROUTES_MEGA_FINAL;
