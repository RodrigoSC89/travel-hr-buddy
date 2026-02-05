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
  ShoppingCart, Lock, GraduationCap, Trash2, Fuel, Stethoscope, Terminal
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

  // 3. 🔧 MAINTENANCE (Hub Premium com Enterprise Components)
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [
      { label: "Maintenance Hub", path: "/maintenance-hub", icon: Wrench, emoji: "🔧", badge: "HUB" },
      { label: "DNV Class Surveys", path: "/maintenance-hub?tab=intelligence", icon: Shield, emoji: "🛡️", badge: "NEW" },
      { label: "Manutenção Preditiva", path: "/maintenance-hub?tab=predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Calendário", path: "/maintenance-hub?tab=calendar", icon: Calendar, emoji: "📅", badge: "ENT" },
      { label: "Drydock Timeline", path: "/maintenance-hub?tab=drydock", icon: Anchor, emoji: "🔩", badge: "ENT" },
      { label: "Combustível ROB", path: "/maintenance-hub?tab=fuel", icon: Fuel, emoji: "⛽", badge: "ENT" },
      { label: "MARPOL e-GRB", path: "/maintenance-hub?tab=waste", icon: Trash2, emoji: "♻️", badge: "ENT" },
      { label: "ESG Emissões", path: "/maintenance-hub?tab=esg", icon: Leaf, emoji: "🌱", badge: "ENT" },
      { label: "Digital Twin 3D", path: "/digital-twin", icon: Cpu, emoji: "🎮" },
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

  // 6. 🛡️ COMPLIANCE & AUDITS (Hub Premium com Enterprise Components)
  {
    title: "🛡️ Compliance & Audits",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance-unified", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Compliance Scorecard", path: "/compliance-unified?tab=scorecard", icon: BarChart3, emoji: "📊", badge: "ENT" },
      { label: "Gestão de Auditorias", path: "/compliance-unified?tab=audit-mgmt", icon: ClipboardList, emoji: "📋", badge: "ENT" },
      { label: "Rastreador Certificados", path: "/compliance-unified?tab=cert-tracker", icon: Award, emoji: "🏆", badge: "ENT" },
      { label: "Matriz de Riscos", path: "/compliance-unified?tab=risk-matrix", icon: Target, emoji: "🎯", badge: "ENT" },
      { label: "Agentes IA", path: "/compliance-unified?tab=agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      { label: "NCs & CAPAs", path: "/compliance-unified?tab=ncs", icon: AlertTriangle, emoji: "⚠️" },
      { label: "Regulamentos", path: "/compliance-unified?tab=regulations", icon: BookOpen, emoji: "📜" },
      { label: "Gestão de Resíduos", path: "/waste-management", icon: Trash2, emoji: "♻️", badge: "MARPOL" },
      { label: "Security Center", path: "/security-center", icon: Lock, emoji: "🔐", requiredRoles: ['admin'] },
    ],
  },

  // 7. 📄 DOCUMENT CENTER (Hub Premium com Enterprise Components)
  {
    title: "📄 Document Center",
    defaultOpen: false,
    items: [
      { label: "Document Center", path: "/document-center", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "Visualizador Docs", path: "/document-center?tab=viewer", icon: FileText, emoji: "📑", badge: "ENT" },
      { label: "Gestor Templates", path: "/document-center?tab=template-mgr", icon: ClipboardList, emoji: "📋", badge: "ENT" },
      { label: "Checklist Builder", path: "/document-center?tab=checklist-builder", icon: ClipboardList, emoji: "✅", badge: "ENT" },
      { label: "Knowledge Hub", path: "/document-center?tab=knowledge", icon: Brain, emoji: "🧠", badge: "ENT" },
      { label: "Documentos", path: "/document-center?tab=documents", icon: FileText, emoji: "📑" },
      { label: "Relatórios", path: "/document-center?tab=reports", icon: BarChart3, emoji: "📊" },
      { label: "Exportar", path: "/document-center?tab=export", icon: BarChart3, emoji: "📤" },
    ],
  },

  // 8. 👥 PEOPLE HUB (Hub Premium com Enterprise Components)
  {
    title: "👥 People Hub",
    defaultOpen: false,
    items: [
      { label: "People Hub", path: "/people-hub", icon: Users, emoji: "👥", badge: "HUB" },
      { label: "Pipeline Talentos", path: "/people-hub?tab=talent", icon: Target, emoji: "🎯", badge: "ENT" },
      { label: "Performance 360°", path: "/people-hub?tab=performance", icon: TrendingUp, emoji: "📈", badge: "ENT" },
      { label: "Matriz Treinamento", path: "/people-hub?tab=training-matrix", icon: ClipboardList, emoji: "📋", badge: "ENT" },
      { label: "Crew Scheduler", path: "/people-hub?tab=crew-scheduler", icon: Calendar, emoji: "📅", badge: "ENT" },
      { label: "Crew Intelligence", path: "/people-hub?tab=intelligence", icon: Brain, emoji: "🧠" },
      { label: "STCW/MLC", path: "/people-hub?tab=stcw", icon: Award, emoji: "🏆" },
      { label: "Bem-estar", path: "/people-hub?tab=wellness", icon: Heart, emoji: "❤️" },
      { label: "Mentor DP", path: "/people-hub?tab=mentor-dp", icon: GraduationCap, emoji: "🎓" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Stethoscope, emoji: "🏥", badge: "MLC" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑" },
    ],
  },

  // 9. 💰 FINANCE & CONTRACTS (Hub Premium com Enterprise Components)
  {
    title: "💰 Finance & Contracts",
    defaultOpen: false,
    items: [
      { label: "Finance Hub", path: "/finance-hub", icon: DollarSign, emoji: "💰", badge: "HUB" },
      { label: "Voyage P&L", path: "/finance-hub?tab=voyage-pnl", icon: TrendingUp, emoji: "📈", badge: "ENT" },
      { label: "Contabilidade Viagem", path: "/finance-hub?tab=voyage-acct", icon: BarChart3, emoji: "📊", badge: "ENT" },
      { label: "Dashboard Executivo", path: "/finance-hub?tab=executive", icon: TrendingUp, emoji: "💹", badge: "ENT" },
      { label: "Portal Fornecedores", path: "/finance-hub?tab=suppliers", icon: ShoppingCart, emoji: "🏭", badge: "ENT" },
      { label: "Hub Procurement", path: "/finance-hub?tab=procurement", icon: ShoppingCart, emoji: "🛒", badge: "ENT" },
      { label: "Contratos", path: "/finance-hub?tab=contracts", icon: FileText, emoji: "📝" },
      { label: "Orçamento", path: "/finance-hub?tab=budget", icon: DollarSign, emoji: "💵" },
      { label: "ESG & Emissões", path: "/esg-emissions", icon: Leaf, emoji: "🌱" },
      { label: "Travel Command", path: "/travel-command", icon: Plane, emoji: "✈️" },
    ],
  },

  // 10. ⚙️ SETTINGS (Hub Premium com Enterprise Components)
  {
    title: "⚙️ Sistema",
    defaultOpen: false,
    items: [
      { label: "System Hub", path: "/system-hub", icon: Server, emoji: "🖥️", badge: "HUB" },
      { label: "Integrações Enterprise", path: "/system-hub?tab=integrations-ent", icon: Link, emoji: "🔗", badge: "ENT" },
      { label: "API Monitor", path: "/system-hub?tab=api-monitor", icon: Terminal, emoji: "📡", badge: "ENT" },
      { label: "IoT Sensors", path: "/system-hub?tab=iot", icon: Thermometer, emoji: "🌡️", badge: "ENT" },
      { label: "Configurações", path: "/system-hub?tab=settings", icon: Settings, emoji: "⚙️", badge: "ENT" },
      { label: "Saúde Sistema", path: "/system-hub?tab=health", icon: Activity, emoji: "💓", badge: "LIVE" },
      { label: "API Gateway", path: "/system-hub?tab=api-gateway", icon: Globe, emoji: "🌐" },
      { label: "Quality Dashboard", path: "/quality-dashboard", icon: BarChart3, emoji: "📊" },
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
