/**
 * ⚡ SIDEBAR ROUTES - v8.0 FUSION COMPLETE
 * =========================================================
 * 10 HUBs CANÔNICOS - Estrutura Limpa e Intuitiva
 * 
 * REGRAS APLICADAS:
 * ✅ Zero funcionalidades perdidas
 * ✅ 150+ aliases para rotas antigas
 * ✅ Fusão por composição
 * ✅ Compatibilidade retroativa total
 * 
 * Total: 68 itens no sidebar (de 120+)
 * Rotas preservadas: 100% via aliases
 * 
 * Documentação: docs/FUSION_MAP_V7_TO_V8.md
 * Legacy Redirects: src/routes/legacy-redirects-v8.tsx
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart,
  Link, BarChart3, Clock, Bot, Zap, Package,
  TrendingUp, Cpu, Mic, AlertTriangle,
  DollarSign, Leaf, ClipboardList, Cloud,
  Calendar, Server, Radio, Globe, Plane, Thermometer,
  Lock, GraduationCap, Trash2, Fuel, Stethoscope, Terminal
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
 * SIDEBAR v8.0 - 10 HUBs CANÔNICOS OTIMIZADOS
 * Cada hub tem rotas canônicas com tabs para sub-módulos
 */
export const SIDEBAR_ROUTES_V8: SidebarGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // 1. 🎯 COMMAND CENTER - Centro de Comando Unificado
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎯 Command Center",
    defaultOpen: true,
    items: [
      { label: "Dashboard", path: "/command", icon: Compass, emoji: "📊", badge: "HUB" },
      { label: "Operações", path: "/command?tab=operations", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/command?tab=executive", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/command?tab=noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Security", path: "/command?tab=soc", icon: Shield, emoji: "🛡️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 2. 🚀 OPERATIONS - Operações Marítimas Integradas
  // ═══════════════════════════════════════════════════════════
  {
    title: "🚀 Operations",
    defaultOpen: false,
    items: [
      { label: "Operations Hub", path: "/operations", icon: Compass, emoji: "🚀", badge: "HUB" },
      { label: "Maritime", path: "/operations?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/operations?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/operations?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "Missions", path: "/operations?tab=missions", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/operations?tab=logistics", icon: Package, emoji: "📦" },
      { label: "Contracts", path: "/operations?tab=contracts", icon: FileText, emoji: "📝" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 3. 🔧 MAINTENANCE - Manutenção & Ativos
  // ═══════════════════════════════════════════════════════════
  {
    title: "🔧 Maintenance",
    defaultOpen: false,
    items: [
      { label: "Maintenance Hub", path: "/maintenance", icon: Wrench, emoji: "🔧", badge: "HUB" },
      { label: "Class Surveys", path: "/maintenance?tab=class", icon: Shield, emoji: "🛡️", badge: "DNV" },
      { label: "Predictive", path: "/maintenance?tab=predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Calendar", path: "/maintenance?tab=calendar", icon: Calendar, emoji: "📅" },
      { label: "Drydock", path: "/maintenance?tab=drydock", icon: Anchor, emoji: "🔩" },
      { label: "Fuel & ROB", path: "/maintenance?tab=fuel", icon: Fuel, emoji: "⛽" },
      { label: "Digital Twin", path: "/maintenance?tab=digital-twin", icon: Cpu, emoji: "🎮", badge: "3D" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 4. 🤖 AI HUB - Inteligência Artificial Unificada
  // ═══════════════════════════════════════════════════════════
  {
    title: "🤖 AI Hub",
    defaultOpen: false,
    items: [
      { label: "AI Command", path: "/ai", icon: Brain, emoji: "🧠", badge: "HUB" },
      { label: "Chat & Assistants", path: "/ai?tab=chat", icon: MessageSquare, emoji: "💬" },
      { label: "AI Agents", path: "/ai?tab=agents", icon: Bot, emoji: "🤖", badge: "25+" },
      { label: "Workflows", path: "/ai?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "Voice Assistant", path: "/ai?tab=voice", icon: Mic, emoji: "🎙️" },
      { label: "RAG & OCR", path: "/ai?tab=rag", icon: FileText, emoji: "📝", badge: "ENT" },
      { label: "Analytics", path: "/ai?tab=analytics", icon: BarChart3, emoji: "📊" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 5. 📡 TRACKING - Rastreamento & Telemetria
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
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 6. 🛡️ COMPLIANCE - Auditorias & Conformidade
  // ═══════════════════════════════════════════════════════════
  {
    title: "🛡️ Compliance",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Scorecard", path: "/compliance?tab=scorecard", icon: BarChart3, emoji: "📊" },
      { label: "Audit Agents", path: "/compliance?tab=agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      { label: "Certificates", path: "/compliance?tab=certificates", icon: Award, emoji: "🏆" },
      { label: "Risk Matrix", path: "/compliance?tab=risks", icon: Target, emoji: "🎯" },
      { label: "Maritime Audits", path: "/compliance?tab=audits", icon: ClipboardList, emoji: "📋", badge: "12" },
      { label: "NCs & CAPAs", path: "/compliance?tab=ncs", icon: AlertTriangle, emoji: "⚠️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 7. 📄 DOCUMENTS - Centro de Documentos
  // ═══════════════════════════════════════════════════════════
  {
    title: "📄 Documents",
    defaultOpen: false,
    items: [
      { label: "Document Hub", path: "/docs", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "Documents", path: "/docs?tab=documents", icon: FileText, emoji: "📑" },
      { label: "Templates", path: "/docs?tab=templates", icon: ClipboardList, emoji: "📋" },
      { label: "Checklists", path: "/docs?tab=checklists", icon: ClipboardList, emoji: "✅" },
      { label: "Knowledge Base", path: "/docs?tab=knowledge", icon: Brain, emoji: "🧠" },
      { label: "Reports", path: "/docs?tab=reports", icon: BarChart3, emoji: "📊" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 8. 👥 PEOPLE - Gestão de Pessoas
  // ═══════════════════════════════════════════════════════════
  {
    title: "👥 People",
    defaultOpen: false,
    items: [
      { label: "People Hub", path: "/people", icon: Users, emoji: "👥", badge: "HUB" },
      { label: "Crew Management", path: "/people?tab=crew", icon: Users, emoji: "👤" },
      { label: "STCW/MLC", path: "/people?tab=stcw-mlc", icon: Award, emoji: "🏆", badge: "NEW" },
      { label: "Training", path: "/people?tab=training", icon: GraduationCap, emoji: "🎓" },
      { label: "Scheduler", path: "/people?tab=scheduler", icon: Calendar, emoji: "📅" },
      { label: "Medical", path: "/people?tab=medical", icon: Stethoscope, emoji: "🏥" },
      { label: "Wellness", path: "/people?tab=wellness", icon: Heart, emoji: "❤️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 9. 💰 FINANCE - Finanças & Contratos
  // ═══════════════════════════════════════════════════════════
  {
    title: "💰 Finance",
    defaultOpen: false,
    items: [
      { label: "Finance Hub", path: "/finance", icon: DollarSign, emoji: "💰", badge: "HUB" },
      { label: "Voyage P&L", path: "/finance?tab=voyage-pnl", icon: TrendingUp, emoji: "📈" },
      { label: "Procurement", path: "/finance?tab=procurement", icon: Package, emoji: "🛒" },
      { label: "Suppliers", path: "/finance?tab=suppliers", icon: Users, emoji: "🏭" },
      { label: "ESG & Carbon", path: "/finance?tab=esg", icon: Leaf, emoji: "🌱" },
      { label: "Travel", path: "/finance?tab=travel", icon: Plane, emoji: "✈️" },
      { label: "Budget", path: "/finance?tab=budget", icon: DollarSign, emoji: "💵" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 10. ⚙️ SYSTEM - Administração do Sistema
  // ═══════════════════════════════════════════════════════════
  {
    title: "⚙️ System",
    defaultOpen: false,
    items: [
      { label: "System Hub", path: "/system", icon: Server, emoji: "🖥️", badge: "HUB" },
      { label: "Integrations", path: "/system?tab=integrations", icon: Link, emoji: "🔗" },
      { label: "API Gateway", path: "/system?tab=api-gateway", icon: Globe, emoji: "🌐" },
      { label: "IoT Sensors", path: "/system?tab=iot", icon: Thermometer, emoji: "🌡️" },
      { label: "Health", path: "/system?tab=health", icon: Activity, emoji: "💓" },
      { label: "Settings", path: "/system?tab=settings", icon: Settings, emoji: "⚙️" },
      { label: "Dev Tools", path: "/system?tab=dev", icon: Terminal, emoji: "🛠️", requiredRoles: ['admin'] },
    ],
  },
];

/**
 * Get all routes flattened for search/validation
 */
export function getAllRoutesV8(): SidebarRoute[] {
  return SIDEBAR_ROUTES_V8.flatMap(group => group.items);
}

/**
 * Get total module count
 */
export function getModuleCountV8(): number {
  return getAllRoutesV8().length;
}

/**
 * Get hub count
 */
export function getHubCountV8(): number {
  return SIDEBAR_ROUTES_V8.length;
}

export default SIDEBAR_ROUTES_V8;
