/**
 * ⚡ SIDEBAR ROUTES - v8.1 MEGA-FUSION FINAL
 * =========================================================
 * 7 MEGA-HUBs CANÔNICOS + 1 SHOWCASE (World-Class)
 * 
 * MEGA-HUBS:
 * A) /command  - Central Operacional
 * B) /ops      - Operações & Contratos
 * C) /maintenance - Manutenção + ESG + MARPOL + Digital Twin
 * D) /ai       - AI + Enterprise Intelligence
 * E) /tracking - Tracking & Telemetry + Weather
 * F) /compliance - Compliance + 12 Audits + 10 AI Agents
 * G) /workbench - Docs + People + Finance + System
 * H) World-Class - Atalhos para diferenciais (rotas avulsas, sem mega-hub dedicado)
 * 
 * GARANTIAS:
 * ✅ 7 mega-hubs canônicos + 1 grupo showcase
 * ✅ 180+ aliases para rotas antigas
 * ✅ 12 Auditorias Marítimas PRESERVADAS
 * ✅ 10 Agentes de Auditoria IA PRESERVADOS
 * ✅ Zero funcionalidades perdidas
 * ✅ World-Class = atalhos diretos, não mega-hub
 * 
 * Legacy Redirects: src/routes/legacy-redirects-mega.tsx
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
  Briefcase, Gamepad2, Waves, Search, Trophy, Lightbulb, Handshake, Calculator, ShoppingCart,
  ArrowRightLeft, ShieldAlert, Layers
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
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // A. 🎯 COMMAND - Central Operacional Unificada
  // ═══════════════════════════════════════════════════════════
  {
    title: "🎯 Command",
    defaultOpen: true,
    items: [
      { label: "Command Center", path: "/command", icon: Compass, emoji: "📊", badge: "HUB" },
      { label: "Analytics BI", path: "/admin/bi", icon: BarChart3, emoji: "📈", badge: "NEW", status: "new" as const },
      { label: "Operations", path: "/command?tab=operations", icon: Activity, emoji: "⚡" },
      { label: "Executive", path: "/command?tab=executive", icon: BarChart3, emoji: "📈" },
      { label: "NOC 24/7", path: "/command?tab=noc", icon: Eye, emoji: "🖥️" },
      { label: "SOC Security", path: "/command?tab=soc", icon: Shield, emoji: "🛡️" },
      { label: "Client Portal", path: "/client-portal", icon: Globe, emoji: "🌐", badge: "NEW", status: "new" as const },
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
      { label: "Maritime", path: "/ops?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "Fleet", path: "/ops?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "Voyage", path: "/ops?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "Missions", path: "/ops?tab=missions", icon: Target, emoji: "🎯" },
      { label: "Logistics", path: "/ops?tab=logistics", icon: Package, emoji: "📦" },
      { label: "Contracts", path: "/ops?tab=contracts", icon: FileText, emoji: "📝" },
      { label: "Charter Party", path: "/charter-party", icon: Briefcase, emoji: "📋", badge: "CP", status: "new" as const },
      { label: "Laytime & Demurrage", path: "/laytime-demurrage", icon: DollarSign, emoji: "⏱️", badge: "BIMCO", status: "new" as const },
      { label: "Freight Invoicing", path: "/freight-invoicing", icon: FileText, emoji: "💰", badge: "IMOS", status: "new" as const },
      { label: "Voyage Estimate", path: "/voyage-estimate", icon: Calculator, emoji: "🧮", badge: "TCE", status: "new" as const },
      { label: "Budget vs OPEX", path: "/budget-opex", icon: TrendingUp, emoji: "📊", badge: "CFM", status: "new" as const },
      { label: "Port Costs (PDA)", path: "/port-costs", icon: Anchor, emoji: "🏗️", badge: "PDA", status: "new" as const },
      { label: "Pool Distribution", path: "/pool-distribution", icon: DollarSign, emoji: "🤝", badge: "POOL", status: "new" as const },
      { label: "Insurance & P&I", path: "/insurance-pi", icon: Shield, emoji: "🛡️", badge: "P&I", status: "new" as const },
      { label: "TC Charter Mgmt", path: "/tc-charter", icon: Ship, emoji: "⚓", badge: "NYPE", status: "new" as const },
      { label: "Procurement", path: "/procurement", icon: ShoppingCart, emoji: "🛒", badge: "IMPA", status: "new" as const },
      { label: "Vessel KPI", path: "/vessel-kpi", icon: BarChart3, emoji: "📊", badge: "KPI", status: "new" as const },
      { label: "Submarine Ops", path: "/ocean-sonar", icon: Waves, emoji: "🌊", badge: "DEMO", status: "beta" as const },
      { label: "Operational Calendar", path: "/operational-calendar", icon: Calendar, emoji: "📅" },
      { label: "Task Management", path: "/task-management", icon: ClipboardList, emoji: "✅" },
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
      { label: "Running Hours", path: "/running-hours", icon: Activity, emoji: "⏱️", badge: "PMS", status: "new" as const },
      { label: "Spare Parts Catalog", path: "/spare-parts", icon: Package, emoji: "📦", badge: "AMOS", status: "new" as const },
      { label: "Class Surveys", path: "/class-surveys", icon: Shield, emoji: "🛡️", badge: "DNV", status: "new" as const },
      { label: "Warranty Claims", path: "/warranty-claims", icon: FileText, emoji: "📋", badge: "AMOS", status: "new" as const },
      { label: "Predictive", path: "/maintenance?tab=predictive", icon: Brain, emoji: "🧠", badge: "ML" },
      { label: "Drydock", path: "/maintenance?tab=drydock", icon: Anchor, emoji: "🔩" },
      { label: "Fuel & ROB", path: "/maintenance?tab=fuel", icon: Fuel, emoji: "⛽" },
      { label: "Digital Twin", path: "/maintenance?tab=digital-twin", icon: Cpu, emoji: "🎮", badge: "3D" },
      { label: "MARPOL & Waste", path: "/maintenance?tab=waste-marpol", icon: Trash2, emoji: "♻️" },
      { label: "ESG Emissions", path: "/maintenance?tab=esg", icon: Leaf, emoji: "🌱" },
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
      { label: "Agents", path: "/ai?tab=agents", icon: Bot, emoji: "🤖", badge: "10" },
      { label: "Agent Chat", path: "/ai/agents/captain-ai", icon: MessageSquare, emoji: "💬", badge: "NEW", status: "new" as const },
      { label: "Chat & Voice", path: "/ai?tab=chat-voice", icon: MessageSquare, emoji: "💬" },
      { label: "Swarm Ops", path: "/ai?tab=swarm", icon: Users, emoji: "🤝", badge: "NEW", status: "new" as const },
      { label: "Workflows", path: "/ai?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "11 AI Modules", path: "/ai?tab=modules", icon: Brain, emoji: "🌟", badge: "11" },
      { label: "Intelligence", path: "/ai?tab=intelligence", icon: FileText, emoji: "📄" },
      { label: "Analytics", path: "/ai?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "DP Intelligence", path: "/dp-intelligence", icon: Cpu, emoji: "🎛️" },
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
      { label: "Weather Maritime", path: "/weather-maritime", icon: Cloud, emoji: "🌊" },
      { label: "IoT Dashboard", path: "/iot-dashboard", icon: Cpu, emoji: "📟" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // F. 🛡️ COMPLIANCE - Auditorias & Conformidade (12 Auditorias + 10 Agentes)
  // ═══════════════════════════════════════════════════════════
  {
    title: "🛡️ Compliance",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance", icon: Shield, emoji: "🛡️", badge: "HUB" },
      { label: "Scorecard", path: "/compliance?tab=scorecard", icon: BarChart3, emoji: "📊" },
      { label: "🤖 10 AI Agents", path: "/audit-agents", icon: Bot, emoji: "🤖", badge: "10 AI" },
      { label: "Certificates", path: "/compliance?tab=certificates", icon: Award, emoji: "🏆" },
      { label: "Risk Matrix", path: "/risk-matrix", icon: Target, emoji: "🎯" },
      { label: "NCs & CAPAs", path: "/compliance?tab=ncs-capas", icon: AlertTriangle, emoji: "⚠️" },
      { label: "CAP Assessment", path: "/cap-assessment", icon: Eye, emoji: "🔍", badge: "DNV", status: "new" as const },
      { label: "QHSE Incidents", path: "/qhse-incidents", icon: AlertTriangle, emoji: "🚨", badge: "QHSE", status: "new" as const },
      { label: "Regulatory Radar", path: "/regulatory-radar", icon: Globe, emoji: "📡", badge: "DNV", status: "new" as const },
      // === 12 AUDITORIAS MARÍTIMAS COMPLETAS ===
      { label: "1. PEO-DP", path: "/peo-dp", icon: Anchor, emoji: "⚓", badge: "IMCA" },
      { label: "2. PEOTRAM", path: "/peotram", icon: Shield, emoji: "🚢", badge: "13E" },
      { label: "3. ISM Code", path: "/safety-imca", icon: Shield, emoji: "🛡️", badge: "SMS" },
      { label: "4. ISPS Security", path: "/isps-security", icon: Lock, emoji: "🔒", badge: "SSP" },
      { label: "5. SOLAS/LSA/FFE", path: "/solas-inspection", icon: Ship, emoji: "🚢", badge: "SOLAS" },
      { label: "6. MARPOL I-VI", path: "/waste-management", icon: Trash2, emoji: "♻️", badge: "I-VI" },
      { label: "7. Pre-OVID", path: "/pre-ovid", icon: FileText, emoji: "📋", badge: "OCIMF" },
      { label: "8. Pre-MLC 2006", path: "/mlc-inspection", icon: Users, emoji: "👥", badge: "ILO" },
      { label: "9. PSC Package", path: "/psc-package", icon: ClipboardList, emoji: "📦", badge: "MoU" },
      { label: "10. SGSO ANP", path: "/sgso", icon: Shield, emoji: "⚙️", badge: "17P" },
      { label: "11. Pre-SIRE 2.0", path: "/pre-sire", icon: Ship, emoji: "🔍", badge: "SIRE" },
      { label: "12. TMSA", path: "/tmsa-assessment", icon: BarChart3, emoji: "📈", badge: "OCIMF" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // G. 📚 WORKBENCH - Centro de Trabalho Unificado
  // ═══════════════════════════════════════════════════════════
  {
    title: "📚 Workbench",
    defaultOpen: false,
    items: [
      { label: "📄 Documents", path: "/workbench?section=docs", icon: FileText, emoji: "📄", badge: "HUB" },
      { label: "👥 People", path: "/workbench?section=people", icon: Users, emoji: "👥" },
      { label: "Crew Appraisal", path: "/crew-appraisal", icon: Award, emoji: "⭐", badge: "360°", status: "new" as const },
      { label: "Crew Travel", path: "/crew-travel", icon: Plane, emoji: "✈️", badge: "NEW", status: "new" as const },
      { label: "Crew Rotation", path: "/crew-rotation", icon: Users, emoji: "🔄", badge: "NEW", status: "new" as const },
      { label: "Crew Payroll", path: "/crew-payroll", icon: DollarSign, emoji: "💰", badge: "ITF", status: "new" as const },
      { label: "Crew Competency", path: "/crew-competency", icon: Award, emoji: "📊", badge: "STCW", status: "new" as const },
      { label: "Crew Planning Matrix", path: "/crew-planning", icon: Users, emoji: "📋", badge: "GRID", status: "new" as const },
      { label: "💰 Finance", path: "/workbench?section=finance", icon: DollarSign, emoji: "💰" },
      { label: "✈️ Travel", path: "/workbench?section=travel", icon: Plane, emoji: "✈️" },
      { label: "⚙️ System", path: "/workbench?section=system", icon: Settings, emoji: "⚙️" },
      { label: "🎓 Academy", path: "/nautilus-academy", icon: GraduationCap, emoji: "🎓" },
      { label: "📚 Knowledge Hub", path: "/knowledge-hub", icon: BookOpen, emoji: "📚" },
      { label: "🏆 Gamification", path: "/gamification", icon: Trophy, emoji: "🏆" },
      { label: "🤝 Collaboration", path: "/collaboration", icon: Handshake, emoji: "🤝" },
      { label: "🏥 Medical", path: "/medical-infirmary", icon: Stethoscope, emoji: "🏥" },
      { label: "🌱 Sustainability", path: "/sustainability-score", icon: Leaf, emoji: "🌱" },
      { label: "🛡️ Blockchain", path: "/blockchain-compliance", icon: Shield, emoji: "🔗" },
      { label: "🔒 Security Dashboard", path: "/security-dashboard", icon: Lock, emoji: "🔒", badge: "NEW", status: "new" as const },
      { label: "⚡ Performance", path: "/performance-monitor", icon: Activity, emoji: "⚡", badge: "NEW", status: "new" as const },
      { label: "📄 Premium Reports", path: "/premium-reports", icon: FileText, emoji: "📄", badge: "PDF", status: "new" as const },
      { label: "📱 WhatsApp Bot", path: "/whatsapp-bot", icon: MessageSquare, emoji: "📱", badge: "NEW", status: "new" as const },
      { label: "🛠️ Dev Tools", path: "/workbench?section=system&view=dev", icon: Terminal, emoji: "🛠️", requiredRoles: ['admin'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // H. 🏆 WORLD-CLASS - Atalhos para Diferenciais (cross-refs para hubs canônicos)
  // Nota: Estes são atalhos rápidos — as funcionalidades vivem nos mega-hubs acima.
  // ═══════════════════════════════════════════════════════════
  {
    title: "🏆 Destaques",
    defaultOpen: false,
    items: [
      { label: "Voice Copilot", path: "/voice-copilot", icon: Mic, emoji: "🎙️", badge: "AI", status: "new" as const },
      { label: "Computer Vision", path: "/computer-vision-inspector", icon: Eye, emoji: "👁️", badge: "CV", status: "new" as const },
      { label: "Crew Marketplace", path: "/crew-marketplace", icon: Users, emoji: "🌍", badge: "GLOBAL", status: "new" as const },
      { label: "IoT Wearables", path: "/iot-wearables", icon: Activity, emoji: "⌚", badge: "IoT", status: "new" as const },
      { label: "Fatigue Predictor", path: "/crew-fatigue-predictor", icon: Brain, emoji: "😴", badge: "ML", status: "new" as const },
      { label: "Fleet Benchmark", path: "/fleet-benchmarking", icon: Trophy, emoji: "🏆", badge: "KPI", status: "new" as const },
      { label: "Fleet Pulse", path: "/ops?tab=fleet", icon: Activity, emoji: "💓", badge: "OPS" },
      { label: "Crew Wellbeing", path: "/workbench?section=people", icon: Heart, emoji: "❤️", badge: "PEOPLE" },
      { label: "PSC Readiness", path: "/compliance?tab=hub", icon: Shield, emoji: "🛡️", badge: "COMP" },
      { label: "STCW/MLC Center", path: "/stcw-mlc", icon: Award, emoji: "📜", badge: "LIVE" },
      { label: "Predictive Maint.", path: "/maintenance?tab=predictive", icon: Brain, emoji: "🔮", badge: "MAINT" },
      { label: "Digital Twin 3D", path: "/maintenance?tab=digital-twin", icon: Cpu, emoji: "🎮", badge: "MAINT" },
      { label: "Weather Intel", path: "/tracking?tab=weather", icon: Cloud, emoji: "🌤️", badge: "TRACK" },
      { label: "Carbon Tracker", path: "/maintenance?tab=esg", icon: Leaf, emoji: "🌱", badge: "MAINT" },
      { label: "Monte Carlo Risk", path: "/compliance?standard=hub", icon: Target, emoji: "🎲", badge: "SIM" },
      { label: "Nauti Academy", path: "/nautilus-academy", icon: GraduationCap, emoji: "🎓" },
      { label: "Evidence Pack", path: "/evidence-pack", icon: Package, emoji: "📦", badge: "PSC", status: "new" as const },
      { label: "Voyage Optimizer", path: "/voyage-optimizer", icon: Map, emoji: "🗺️", badge: "AI", status: "new" as const },
      { label: "Weather Routing", path: "/weather-routing", icon: Cloud, emoji: "⛈️", badge: "STORM", status: "new" as const },
      { label: "Energy Efficiency", path: "/energy-efficiency", icon: Leaf, emoji: "⚡", badge: "CII", status: "new" as const },
      { label: "Bunker Engine", path: "/bunker-optimization-engine", icon: Fuel, emoji: "⛽", badge: "FUEL", status: "new" as const },
      { label: "Crew Doc Vault", path: "/crew-document-vault", icon: FileText, emoji: "🗂️", badge: "STCW", status: "new" as const },
      { label: "Cargo Ops Adv", path: "/advanced-cargo", icon: Package, emoji: "📦", badge: "STS", status: "new" as const },
      { label: "Crew Change Mgr", path: "/crew-change", icon: ArrowRightLeft, emoji: "🔄", badge: "COMPAS", status: "new" as const },
      { label: "Permit to Work", path: "/permit-to-work", icon: ShieldAlert, emoji: "🔥", badge: "PTW", status: "new" as const },
      { label: "Ship Vetting", path: "/ship-vetting", icon: Shield, emoji: "🛡️", badge: "SIRE", status: "new" as const },
      { label: "Noon Analytics", path: "/noon-report-analytics", icon: BarChart3, emoji: "📊", badge: "CFM", status: "new" as const },
      { label: "PSC History", path: "/psc-history", icon: Globe, emoji: "🌍", badge: "MoU", status: "new" as const },
      { label: "Stowage Plan", path: "/stowage-plan", icon: Layers, emoji: "📦", badge: "NAPA", status: "new" as const },
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
