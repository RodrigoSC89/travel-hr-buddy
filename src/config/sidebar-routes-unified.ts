/**
 * ⚡ SIDEBAR ROUTES UNIFIED - v5.0 FUSÃO TOTAL
 * =========================================================
 * 10 HUBs canônicos, 61% redução de itens
 * 100% funcionalidades preservadas via tabs internas
 * 
 * ❌ NÃO adicionar itens duplicados
 * ✅ Funcionalidades vão dentro dos HUBs como tabs
 * ✅ Rotas antigas funcionam via legacy-redirects.tsx
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart,
  Link, BarChart3, Clock, Bot, Zap
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
  status?: 'active' | 'beta' | 'new';
}

export interface SidebarGroup {
  title: string;
  defaultOpen?: boolean;
  requiredRoles?: UserRole[];
  items: SidebarRoute[];
}

/**
 * UNIFIED SIDEBAR - 10 HUBs Canônicos
 * Redução de 134 → 52 itens visíveis (61%)
 */
export const SIDEBAR_ROUTES_UNIFIED: SidebarGroup[] = [
  // ============================================
  // 1. 🧠 CENTRAL DE COMANDO
  // ============================================
  {
    title: "🧠 Central de Comando",
    defaultOpen: true,
    items: [
      { label: "Visão Geral", path: "/central-comando/visao-geral", icon: Compass, emoji: "📊", status: "active" },
      { label: "Operações", path: "/central-comando/operacoes", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/central-comando/executivo", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Dashboard", path: "/soc", icon: Shield, emoji: "🛡️" },
    ],
  },

  // ============================================
  // 2. 🚀 OPERATIONS COMMAND (HUB)
  // Fusão: Maritime + Fleet + Voyage + Mission + Logistics
  // ============================================
  {
    title: "🚀 Operations Command",
    defaultOpen: false,
    items: [
      { label: "🚀 Operations Hub", path: "/operations-command", icon: Ship, emoji: "🚀", badge: "HUB", status: "new" },
      { label: "⚓ Maritime", path: "/operations-command?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "🚢 Fleet", path: "/operations-command?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "🗺️ Voyage", path: "/operations-command?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "🎯 Mission", path: "/operations-command?tab=mission", icon: Target, emoji: "🎯" },
      { label: "📦 Logistics", path: "/operations-command?tab=logistics", icon: Ship, emoji: "📦" },
    ],
  },

  // ============================================
  // 3. 🔧 MANUTENÇÃO
  // ============================================
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [
      { label: "Central de Manutenção", path: "/maintenance-command", icon: Wrench, emoji: "🔧", status: "active" },
      { label: "Manutenção Preditiva", path: "/predictive-maintenance", icon: Brain, emoji: "🧠", badge: "ML" },
    ],
  },

  // ============================================
  // 4. 🤖 AI CONTROL TOWER (HUB)
  // Fusão: AI Hub + Chat + Agents + Workflows + Analytics + Observability + Audit
  // ============================================
  {
    title: "🤖 AI Control Tower",
    defaultOpen: false,
    items: [
      { label: "🧠 AI Control Tower", path: "/ai-control-tower", icon: Brain, emoji: "🧠", badge: "HUB", status: "new" },
      { label: "🌟 Hub Central", path: "/ai-control-tower?tab=hub", icon: Brain, emoji: "🌟" },
      { label: "💬 Chat & Assistants", path: "/ai-control-tower?tab=chat", icon: MessageSquare, emoji: "💬" },
      { label: "🤖 Agentes Autônomos", path: "/ai-control-tower?tab=agents", icon: Bot, emoji: "🤖" },
      { label: "🔄 Workflows", path: "/ai-control-tower?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "📊 Analytics", path: "/ai-control-tower?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "👁️ Observabilidade", path: "/ai-control-tower?tab=observability", icon: Activity, emoji: "👁️" },
      { label: "📋 Auditoria IA", path: "/ai-control-tower?tab=audit", icon: FileText, emoji: "📋" },
    ],
  },

  // ============================================
  // 5. 📡 TRACKING & TELEMETRY (HUB)
  // Fusão: Telemetria + GNSS + Satellite + Alerts
  // ============================================
  {
    title: "📡 Tracking & Telemetry",
    defaultOpen: false,
    items: [
      { label: "📡 Tracking Hub", path: "/tracking-telemetry", icon: Satellite, emoji: "📡", badge: "HUB", status: "new" },
      { label: "🛰️ Visão Geral", path: "/tracking-telemetry?tab=overview", icon: Satellite, emoji: "🛰️" },
      { label: "⚡ Tempo Real", path: "/tracking-telemetry?tab=realtime", icon: Activity, emoji: "⚡" },
      { label: "📈 Preditiva", path: "/tracking-telemetry?tab=predictive", icon: BarChart3, emoji: "📈" },
      { label: "🚨 Alertas", path: "/tracking-telemetry?tab=alerts", icon: Bell, emoji: "🚨" },
    ],
  },

  // ============================================
  // 6. 📄 DOCUMENT CENTER (HUB)
  // Fusão: Documents + Templates + Checklists + Reports + Export
  // ============================================
  {
    title: "📄 Document Center",
    defaultOpen: false,
    items: [
      { label: "📄 Document Hub", path: "/document-center", icon: FileText, emoji: "📄", badge: "HUB", status: "new" },
      { label: "📑 Documentos", path: "/document-center?tab=documents", icon: FileText, emoji: "📑" },
      { label: "📋 Templates", path: "/document-center?tab=templates", icon: FileText, emoji: "📋" },
      { label: "✅ Checklists", path: "/document-center?tab=checklists", icon: FileText, emoji: "✅" },
      { label: "📊 Relatórios", path: "/document-center?tab=reports", icon: BarChart3, emoji: "📊" },
      { label: "📤 Exportar", path: "/document-center?tab=export", icon: FileText, emoji: "📤" },
    ],
  },

  // ============================================
  // 7. 📢 COMMS & ALERTS (HUB)
  // Fusão: Communication + Alerts + Workspace + Connectivity
  // ============================================
  {
    title: "📢 Comms & Alerts",
    defaultOpen: false,
    items: [
      { label: "🔔 Comms Hub", path: "/comms-alerts", icon: Bell, emoji: "🔔", badge: "HUB", status: "new" },
      { label: "💬 Comunicação", path: "/comms-alerts?tab=comms", icon: MessageSquare, emoji: "💬" },
      { label: "🚨 Alertas", path: "/comms-alerts?tab=alerts", icon: Bell, emoji: "🚨" },
      { label: "💼 Workspace", path: "/comms-alerts?tab=workspace", icon: Activity, emoji: "💼" },
    ],
  },

  // ============================================
  // 8. 🛡️ COMPLIANCE HUB
  // Fusão: Auditorias + Agentes + Certificações + NCs + Regulamentos
  // ============================================
  {
    title: "🛡️ Compliance Hub",
    defaultOpen: false,
    items: [
      { label: "🛡️ Compliance Hub", path: "/compliance-unified", icon: Shield, emoji: "🛡️", badge: "HUB", status: "new" },
      { label: "📊 Dashboard", path: "/compliance-unified?tab=dashboard", icon: BarChart3, emoji: "📊" },
      { label: "🤖 Agentes IA", path: "/compliance-unified?tab=agents", icon: Bot, emoji: "🤖", badge: "10" },
      { label: "📋 Auditorias", path: "/compliance-unified?tab=audits", icon: FileText, emoji: "📋" },
      { label: "🏆 Certificações", path: "/compliance-unified?tab=certificates", icon: Award, emoji: "🏆" },
      { label: "⚠️ NCs & CAPAs", path: "/compliance-unified?tab=ncs", icon: Bell, emoji: "⚠️" },
      { label: "📜 Regulamentos", path: "/compliance-unified?tab=regulations", icon: BookOpen, emoji: "📜" },
      { label: "🎯 Matriz Riscos", path: "/compliance-unified?tab=risks", icon: Target, emoji: "🎯" },
    ],
  },

  // ============================================
  // 9. 👥 PEOPLE HUB
  // Fusão: RH + Crew + Training + Wellness + Analytics
  // ============================================
  {
    title: "👥 People Hub",
    defaultOpen: false,
    items: [
      { label: "👥 People Hub", path: "/people-hub", icon: Users, emoji: "👥", badge: "HUB", status: "new" },
      { label: "📊 Visão Geral", path: "/people-hub?tab=overview", icon: Users, emoji: "📊" },
      { label: "🎯 Talent", path: "/people-hub?tab=talent", icon: Target, emoji: "🎯" },
      { label: "📈 Performance", path: "/people-hub?tab=performance", icon: BarChart3, emoji: "📈" },
      { label: "❤️ Bem-estar", path: "/people-hub?tab=wellness", icon: Heart, emoji: "❤️" },
      { label: "🎓 Treinamento", path: "/people-hub?tab=training", icon: BookOpen, emoji: "🎓" },
      { label: "⏰ Ponto & Folha", path: "/people-hub?tab=compliance", icon: Clock, emoji: "⏰" },
    ],
  },

  // ============================================
  // 10. ⚙️ SISTEMA & CONFIGURAÇÕES
  // ============================================
  {
    title: "⚙️ Sistema",
    defaultOpen: false,
    items: [
      { label: "Configurações", path: "/settings", icon: Settings, emoji: "⚙️" },
      { label: "Integrações", path: "/integrations", icon: Link, emoji: "🔗" },
      { label: "Status", path: "/status", icon: Activity, emoji: "📊" },
    ],
  },
];

/**
 * Get all routes flattened for search/validation
 */
export function getAllUnifiedRoutes(): SidebarRoute[] {
  return SIDEBAR_ROUTES_UNIFIED.flatMap(group => group.items);
}

/**
 * Get total module count
 */
export function getUnifiedModuleCount(): number {
  return getAllUnifiedRoutes().length;
}

export default SIDEBAR_ROUTES_UNIFIED;
