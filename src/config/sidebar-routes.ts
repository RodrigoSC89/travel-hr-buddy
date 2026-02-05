/**
 * ⚡ SIDEBAR ROUTES - v8.0 FUSION ACTIVE
 * =========================================================
 * 10 HUBs CANÔNICOS - Estrutura Otimizada
 * 
 * FUSÃO v7.1 → v8.0 ATIVADA:
 * ✅ 68 itens no sidebar (de 120+)
 * ✅ 154+ aliases para rotas antigas
 * ✅ 12 Auditorias Marítimas PRESERVADAS
 * ✅ 10 Agentes de Auditoria IA PRESERVADOS
 * ✅ Zero funcionalidades perdidas
 * 
 * Documentação: docs/FUSION_MAP_V7_TO_V8.md
 * Legacy Redirects: src/routes/legacy-redirects-v8.tsx
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Settings, BookOpen, Award, Heart,
  Link, BarChart3, Bot, Zap, Package,
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
 * SIDEBAR v8.0 - 10 HUBs CANÔNICOS COM TODAS AS FUNCIONALIDADES
 * Fusão completa mantendo 12 Auditorias + 10 Agentes IA
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // 1. 🎯 COMMAND CENTER - Centro de Comando Unificado
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎯 Command Center",
    defaultOpen: true,
    items: [
      { label: "Dashboard", path: "/central-comando", icon: Compass, emoji: "📊", badge: "HUB" },
      { label: "Operações", path: "/central-comando/operacoes", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/central-comando/executivo", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Security", path: "/soc", icon: Shield, emoji: "🛡️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 2. 🚀 OPERATIONS - Operações Marítimas Integradas
  // ═══════════════════════════════════════════════════════════
  {
    title: "🚀 Operations",
    defaultOpen: false,
    items: [
      { label: "Operations Hub", path: "/operations-command-hub", icon: Compass, emoji: "🚀", badge: "HUB" },
      { label: "Maritime", path: "/operations-command-hub?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/operations-command-hub?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/operations-command-hub?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "Missions", path: "/operations-command-hub?tab=missions", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/operations-command-hub?tab=logistics", icon: Package, emoji: "📦" },
      { label: "Contracts", path: "/vessel-contracts", icon: FileText, emoji: "📝" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 3. 🔧 MAINTENANCE - Manutenção & Ativos
  // ═══════════════════════════════════════════════════════════
  {
    title: "🔧 Maintenance",
    defaultOpen: false,
    items: [
      { label: "Maintenance Hub", path: "/maintenance-hub", icon: Wrench, emoji: "🔧", badge: "HUB" },
      { label: "Class Surveys", path: "/maintenance-hub?tab=intelligence", icon: Shield, emoji: "🛡️", badge: "DNV" },
      { label: "Predictive", path: "/maintenance-hub?tab=predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Calendar", path: "/maintenance-hub?tab=calendar", icon: Calendar, emoji: "📅" },
      { label: "Drydock", path: "/maintenance-hub?tab=drydock", icon: Anchor, emoji: "🔩" },
      { label: "Fuel & ROB", path: "/maintenance-hub?tab=fuel", icon: Fuel, emoji: "⛽" },
      { label: "Digital Twin", path: "/digital-twin", icon: Cpu, emoji: "🎮", badge: "3D" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 4. 🤖 AI HUB - Inteligência Artificial Unificada
  // ═══════════════════════════════════════════════════════════
  {
    title: "🤖 AI Hub",
    defaultOpen: false,
    items: [
      { label: "AI Control Tower", path: "/ai-control-tower", icon: Brain, emoji: "🧠", badge: "HUB" },
      { label: "Chat & Assistants", path: "/ai-control-tower?tab=chat", icon: MessageSquare, emoji: "💬" },
      { label: "AI Agents", path: "/ai-control-tower?tab=agents", icon: Bot, emoji: "🤖", badge: "25+" },
      { label: "Workflows", path: "/ai-control-tower?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "Voice Assistant", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
      { label: "AI Modules Hub", path: "/ai-modules", icon: Brain, emoji: "🌟", badge: "11 AI" },
      { label: "Analytics", path: "/ai-control-tower?tab=analytics", icon: BarChart3, emoji: "📊" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 5. 📡 TRACKING - Rastreamento & Telemetria
  // ═══════════════════════════════════════════════════════════
  {
    title: "📡 Tracking",
    defaultOpen: false,
    items: [
      { label: "Tracking Hub", path: "/tracking-telemetry", icon: Satellite, emoji: "📡", badge: "HUB" },
      { label: "Real-time", path: "/tracking-telemetry?tab=realtime", icon: Activity, emoji: "⚡" },
      { label: "AIS Fleet", path: "/ais-tracker-page", icon: Ship, emoji: "🚢" },
      { label: "SATCOM", path: "/satcom-dashboard", icon: Radio, emoji: "📻" },
      { label: "Weather AI", path: "/advanced/weather-intelligence", icon: Cloud, emoji: "🌤️", badge: "AI" },
      { label: "Alerts", path: "/tracking-telemetry?tab=alerts", icon: AlertTriangle, emoji: "🚨" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 6. 🛡️ COMPLIANCE - 12 Auditorias Marítimas + 10 Agentes IA
  // ═══════════════════════════════════════════════════════════
  {
    title: "🛡️ Compliance & Audits",
    defaultOpen: false,
    items: [
      // === HUB PRINCIPAL ===
      { label: "Compliance Hub", path: "/compliance-unified", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Scorecard", path: "/compliance-unified?tab=scorecard", icon: BarChart3, emoji: "📊" },
      { label: "Certificates", path: "/compliance-unified?tab=cert-tracker", icon: Award, emoji: "🏆" },
      { label: "Risk Matrix", path: "/risk-matrix", icon: Target, emoji: "🎯" },
      
      // === 10 AGENTES DE AUDITORIA IA ===
      { label: "🤖 Audit Agents (10 IA)", path: "/audit-agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      
      // === 12 AUDITORIAS MARÍTIMAS ===
      { label: "PEO-DP (IMCA M-117)", path: "/peo-dp", icon: Anchor, emoji: "⚓", badge: "DP" },
      { label: "PEOTRAM 13 Elementos", path: "/peotram", icon: Shield, emoji: "🚢", badge: "13E" },
      { label: "ISM Code (SMS)", path: "/safety-imca", icon: Shield, emoji: "🛡️", badge: "SMS" },
      { label: "ISPS Security (SSP)", path: "/isps-security", icon: Lock, emoji: "🔐", badge: "SSP" },
      { label: "SOLAS/LSA/FFE", path: "/drill-simulator", icon: Ship, emoji: "🚢", badge: "SOLAS" },
      { label: "MARPOL I-VI", path: "/waste-management", icon: Trash2, emoji: "♻️", badge: "I-VI" },
      { label: "Pre-OVID (OCIMF)", path: "/pre-ovid", icon: Eye, emoji: "🔍", badge: "OVID" },
      { label: "Pre-MLC 2006 (ILO)", path: "/mlc-inspection", icon: Users, emoji: "👥", badge: "MLC" },
      { label: "PSC Package (MoU)", path: "/psc-package", icon: FileText, emoji: "📦", badge: "PSC" },
      { label: "SGSO ANP 17 Práticas", path: "/sgso", icon: Shield, emoji: "⚙️", badge: "17P" },
      { label: "Pre-SIRE 2.0 (OCIMF)", path: "/pre-sire", icon: ClipboardList, emoji: "📋", badge: "SIRE" },
      { label: "TMSA (OCIMF)", path: "/tmsa-assessment", icon: BarChart3, emoji: "📊", badge: "TMSA" },
      
      // === GESTÃO ===
      { label: "NCs & CAPAs", path: "/compliance-unified?tab=ncs", icon: AlertTriangle, emoji: "⚠️" },
      { label: "Regulamentos", path: "/regulations", icon: BookOpen, emoji: "📜" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 7. 📄 DOCUMENTS - Centro de Documentos
  // ═══════════════════════════════════════════════════════════
  {
    title: "📄 Documents",
    defaultOpen: false,
    items: [
      { label: "Document Hub", path: "/document-center", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "Documents", path: "/document-center?tab=documents", icon: FileText, emoji: "📑" },
      { label: "Templates", path: "/document-center?tab=template-mgr", icon: ClipboardList, emoji: "📋" },
      { label: "Checklists", path: "/document-center?tab=checklist-builder", icon: ClipboardList, emoji: "✅" },
      { label: "Knowledge Base", path: "/document-center?tab=knowledge", icon: Brain, emoji: "🧠" },
      { label: "Reports", path: "/document-center?tab=reports", icon: BarChart3, emoji: "📊" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 8. 👥 PEOPLE - Gestão de Pessoas
  // ═══════════════════════════════════════════════════════════
  {
    title: "👥 People",
    defaultOpen: false,
    items: [
      { label: "People Hub", path: "/people-hub", icon: Users, emoji: "👥", badge: "HUB" },
      { label: "Crew Management", path: "/people-hub?tab=talent", icon: Users, emoji: "👤" },
      { label: "STCW/MLC", path: "/stcw-mlc", icon: Award, emoji: "🏆", badge: "NEW" },
      { label: "Training", path: "/people-hub?tab=training-matrix", icon: GraduationCap, emoji: "🎓" },
      { label: "Scheduler", path: "/people-hub?tab=crew-scheduler", icon: Calendar, emoji: "📅" },
      { label: "Medical", path: "/medical-infirmary", icon: Stethoscope, emoji: "🏥" },
      { label: "Wellness", path: "/people-hub?tab=wellness", icon: Heart, emoji: "❤️" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 9. 💰 FINANCE - Finanças & Contratos
  // ═══════════════════════════════════════════════════════════
  {
    title: "💰 Finance",
    defaultOpen: false,
    items: [
      { label: "Finance Hub", path: "/finance-hub", icon: DollarSign, emoji: "💰", badge: "HUB" },
      { label: "Voyage P&L", path: "/finance-hub?tab=voyage-pnl", icon: TrendingUp, emoji: "📈" },
      { label: "Procurement", path: "/finance-hub?tab=procurement", icon: Package, emoji: "🛒" },
      { label: "Suppliers", path: "/finance-hub?tab=suppliers", icon: Users, emoji: "🏭" },
      { label: "ESG & Carbon", path: "/esg-emissions", icon: Leaf, emoji: "🌱" },
      { label: "Travel", path: "/travel-command", icon: Plane, emoji: "✈️" },
      { label: "Budget", path: "/finance-hub?tab=budget", icon: DollarSign, emoji: "💵" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 10. ⚙️ SYSTEM - Administração do Sistema
  // ═══════════════════════════════════════════════════════════
  {
    title: "⚙️ System",
    defaultOpen: false,
    items: [
      { label: "System Hub", path: "/system-hub", icon: Server, emoji: "🖥️", badge: "HUB" },
      { label: "Integrations", path: "/system-hub?tab=integrations-ent", icon: Link, emoji: "🔗" },
      { label: "API Gateway", path: "/api-gateway", icon: Globe, emoji: "🌐" },
      { label: "IoT Sensors", path: "/iot-dashboard", icon: Thermometer, emoji: "🌡️" },
      { label: "Health", path: "/health-monitor", icon: Activity, emoji: "💓" },
      { label: "Settings", path: "/settings", icon: Settings, emoji: "⚙️" },
      { label: "Dev Tools", path: "/dev-routes", icon: Terminal, emoji: "🛠️", requiredRoles: ['admin'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 11. 🚀 ENTERPRISE INTELLIGENCE (Módulos Avançados)
  // ═══════════════════════════════════════════════════════════
  {
    title: "🚀 Enterprise Intelligence",
    defaultOpen: false,
    items: [
      { label: "RAG Assistant", path: "/enterprise/rag-assistant", icon: Bot, emoji: "🤖", badge: "RAG" },
      { label: "OCR Center", path: "/enterprise/ocr-center", icon: FileText, emoji: "📝", badge: "OCR" },
      { label: "Forms Builder", path: "/enterprise/forms-builder", icon: ClipboardList, emoji: "📋" },
      { label: "OCIMF Assessment", path: "/enterprise/ocimf-assessment", icon: Shield, emoji: "🛡️", badge: "SIRE" },
      { label: "TMSA Analytics", path: "/enterprise/tmsa-analytics", icon: BarChart3, emoji: "📊", badge: "TMSA" },
      { label: "Fatigue Risk", path: "/enterprise/fatigue-risk", icon: Brain, emoji: "😴", badge: "ML" },
      { label: "Crew Matching", path: "/enterprise/crew-matching", icon: Users, emoji: "🎯", badge: "AI" },
      { label: "Contract Analysis", path: "/enterprise/contract-analysis", icon: FileText, emoji: "📜", badge: "AI" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 12. 🎮 ADVANCED MARITIME (Módulos Revolucionários)
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎮 Advanced Maritime",
    defaultOpen: false,
    items: [
      { label: "Digital Twin 3D", path: "/advanced/digital-twin-3d", icon: Cpu, emoji: "🎮", badge: "3D" },
      { label: "Weather Intelligence", path: "/advanced/weather-intelligence", icon: Cloud, emoji: "🌤️", badge: "AI" },
      { label: "Bunker Optimization", path: "/advanced/bunker-optimization", icon: Fuel, emoji: "⛽", badge: "AI" },
      { label: "Cargo Planning", path: "/advanced/cargo-planning", icon: Package, emoji: "📦", badge: "3D" },
      { label: "PSC Readiness", path: "/advanced/psc-readiness", icon: Shield, emoji: "🛡️", badge: "AI" },
      { label: "MARPOL Tracker", path: "/advanced/marpol-tracker", icon: Trash2, emoji: "♻️", badge: "AI" },
      { label: "Blockchain Certs", path: "/advanced/blockchain-certificates", icon: Link, emoji: "🔗", badge: "BC" },
      { label: "VR Training", path: "/advanced/vr-training", icon: GraduationCap, emoji: "🎮", badge: "VR" },
      { label: "Voice Commands", path: "/advanced/voice-commands", icon: Mic, emoji: "🎙️", badge: "NLU" },
      { label: "Crew Wellness AI", path: "/advanced/crew-wellness-ai", icon: Heart, emoji: "❤️", badge: "AI" },
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
 * Get total module count
 */
export function getModuleCount(): number {
  return getAllRoutes().length;
}

/**
 * Get hub count
 */
export function getHubCount(): number {
  return SIDEBAR_ROUTES.length;
}

export default SIDEBAR_ROUTES;
