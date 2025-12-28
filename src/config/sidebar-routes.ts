/**
 * Sidebar Routes Configuration
 * UNIFIED NAVIGATION - Single source of truth for all sidebar routes
 * 
 * @description This file centralizes all sidebar navigation routes.
 * Any changes to navigation should be made HERE, and both SmartSidebar
 * and app-sidebar will consume this configuration.
 */

import {
  Ship, Shield, Brain, Activity, Target, Globe, Eye, Mic, Satellite,
  Cloud, Radio, Anchor, Plane, Lock, AlertTriangle, TrendingUp,
  BarChart3, Wrench, Compass, Map, Waves, Zap, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart, Leaf,
  ShoppingCart, Link, Gamepad2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SidebarRoute {
  label: string;
  path: string;
  icon?: LucideIcon;
  emoji?: string;
}

export interface SidebarGroup {
  title: string;
  defaultOpen?: boolean;
  items: SidebarRoute[];
}

/**
 * MASTER SIDEBAR ROUTES
 * All navigation entries should be defined here
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  {
    title: "🛡️ Operações & Segurança",
    defaultOpen: true,
    items: [
      { label: "Security Center", path: "/security-center", icon: Shield, emoji: "🔒" },
      { label: "AI Operations Center", path: "/ai-operations-center", icon: Brain, emoji: "🤖" },
      { label: "Telemetria Preditiva", path: "/predictive-telemetry", icon: Activity, emoji: "📊" },
      { label: "Simulador Incidentes", path: "/simulador", icon: Target, emoji: "⚠️" },
      { label: "Central Integrações", path: "/integracoes", icon: Globe, emoji: "🔗" },
      { label: "API Monitor", path: "/integracoes/api-monitor", icon: Radio, emoji: "📡" },
      { label: "NOC 24/7", path: "/noc", icon: Activity, emoji: "🖥️" },
      { label: "Auditoria de Segurança", path: "/auditoria-seguranca", icon: Shield, emoji: "📋" },
      { label: "Executive BI Dashboard", path: "/executive-bi", icon: TrendingUp, emoji: "📈" },
      { label: "NOC Monitoring Center", path: "/noc-monitoring", icon: Eye, emoji: "📡" },
      { label: "Voice Assistant IA", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
      { label: "Telemetria 360°", path: "/telemetria", icon: Satellite, emoji: "🛰️" },
    ],
  },
  {
    title: "🌐 APIs & Integrações",
    defaultOpen: false,
    items: [
      { label: "API Monitor", path: "/integracoes/api-monitor", icon: Radio, emoji: "📡" },
      { label: "Clima Marítimo", path: "/weather-maritime", icon: Cloud, emoji: "🌊" },
      { label: "AIS Tracker", path: "/ais-tracker-page", icon: Ship, emoji: "🚢" },
      { label: "IA de Voz", path: "/voice-transcriber", icon: Mic, emoji: "🎙️" },
      { label: "Port API", path: "/integracoes", icon: Anchor, emoji: "⚓" },
      { label: "Flight Tracker", path: "/integracoes", icon: Plane, emoji: "✈️" },
      { label: "Security Scanner", path: "/security-center", icon: Lock, emoji: "🔐" },
      { label: "Earthquake Monitor", path: "/integracoes", icon: AlertTriangle, emoji: "🌋" },
    ],
  },
  {
    title: "🎯 Centro de Comando",
    defaultOpen: false,
    items: [
      { label: "Nautilus Command Center", path: "/nautilus-command", icon: Compass, emoji: "🧠" },
      { label: "Telemetria", path: "/telemetry", icon: Activity, emoji: "📡" },
      { label: "Weather Command", path: "/weather-command", icon: Cloud, emoji: "🌤️" },
    ],
  },
  {
    title: "⚓ Sistema Marítimo",
    defaultOpen: false,
    items: [
      { label: "Maritime Command", path: "/maritime-command", icon: Anchor, emoji: "⚓" },
      { label: "Fleet Command Center", path: "/fleet-command", icon: Ship, emoji: "🚢" },
      { label: "Maintenance Command", path: "/maintenance-command", icon: Wrench, emoji: "🔧" },
      { label: "Drydock Management", path: "/drydock-management", icon: Anchor, emoji: "🏗️" },
      { label: "Mission Command", path: "/mission-command", icon: Target, emoji: "🎯" },
      { label: "Voyage Command", path: "/voyage-command", icon: Map, emoji: "🗺️" },
      { label: "Bridge Link", path: "/bridge-link", icon: Link, emoji: "🌉" },
    ],
  },
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
  {
    title: "🧠 IA & Inovação",
    defaultOpen: false,
    items: [
      { label: "AI Command Center", path: "/ai-command", icon: Brain, emoji: "🧠" },
      { label: "Workflow Command", path: "/workflow-command", icon: Zap, emoji: "🔄" },
      { label: "Calendário Operacional", path: "/operational-calendar", icon: Activity, emoji: "📅" },
      { label: "Modo Emergência", path: "/emergency-mode", icon: AlertTriangle, emoji: "🚨" },
      { label: "Journaling IA", path: "/ai-journaling", icon: FileText, emoji: "📝" },
      { label: "Conectividade", path: "/maritime-connectivity", icon: Radio, emoji: "📡" },
      { label: "Bem-estar Tripulação", path: "/crew-wellbeing", icon: Heart, emoji: "❤️" },
      { label: "Assistente de Voz", path: "/assistant/voice", icon: Mic, emoji: "🎙️" },
    ],
  },
  {
    title: "📁 Relatórios e Documentos",
    defaultOpen: false,
    items: [
      { label: "Reports Command", path: "/reports-command", icon: BarChart3, emoji: "📊" },
      { label: "Documentos IA", path: "/documents", icon: FileText, emoji: "📄" },
      { label: "Templates", path: "/templates", icon: FileText, emoji: "📋" },
      { label: "Checklists Inteligentes", path: "/admin/checklists", icon: FileText, emoji: "✅" },
    ],
  },
  {
    title: "📢 Comunicação & Alertas",
    defaultOpen: false,
    items: [
      { label: "Communication Command", path: "/communication-command", icon: MessageSquare, emoji: "📡" },
      { label: "Alerts Command", path: "/alerts-command", icon: Bell, emoji: "🚨" },
      { label: "Workspace em Tempo Real", path: "/real-time-workspace", icon: Activity, emoji: "⏱️" },
    ],
  },
  {
    title: "📊 Gestão e Analytics",
    defaultOpen: false,
    items: [
      { label: "Analytics Command", path: "/analytics-command", icon: BarChart3, emoji: "📊" },
      { label: "Operations Command", path: "/operations-command", icon: Settings, emoji: "⚙️" },
      { label: "Finance Command", path: "/finance-command", icon: TrendingUp, emoji: "💰" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "👥" },
      { label: "Gestão de Tarefas", path: "/task-management", icon: FileText, emoji: "📋" },
    ],
  },
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
  {
    title: "👥 RH & Pessoas",
    defaultOpen: false,
    items: [
      { label: "Nautilus People Hub", path: "/nautilus-people", icon: Users, emoji: "👥" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Heart, emoji: "🏥" },
    ],
  },
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
      { label: "Workflow Documentos ISM/MLC", path: "/document-workflow", icon: FileText, emoji: "📄" },
      { label: "Gerador Pacotes PSC", path: "/psc-package", icon: Shield, emoji: "🛡️" },
      { label: "Auditoria de IA", path: "/ai-audit", icon: Brain, emoji: "🤖" },
    ],
  },
  {
    title: "🛡️ Compliance & Segurança",
    defaultOpen: false,
    items: [
      { label: "Compliance Hub", path: "/compliance-hub", icon: Shield, emoji: "🛡️" },
      { label: "Safety Guardian", path: "/safety-guardian", icon: Shield, emoji: "⛑️" },
    ],
  },
  {
    title: "🌱 ESG & Sustentabilidade",
    defaultOpen: false,
    items: [
      { label: "ESG & Emissões", path: "/esg-emissions", icon: Leaf, emoji: "🌱" },
      { label: "Gestão de Resíduos", path: "/waste-management", icon: Leaf, emoji: "♻️" },
    ],
  },
  {
    title: "✈️ Viagens & Logística",
    defaultOpen: false,
    items: [
      { label: "Travel Command", path: "/travel-command", icon: Plane, emoji: "✈️" },
      { label: "Procurement Command", path: "/procurement-command", icon: ShoppingCart, emoji: "🛒" },
    ],
  },
  {
    title: "⚙️ Integrações & Sistema",
    defaultOpen: false,
    items: [
      { label: "Hub de Integrações", path: "/integrations", icon: Link, emoji: "🔗" },
      { label: "API Gateway", path: "/api-gateway", icon: Globe, emoji: "🌐" },
      { label: "Colaboração", path: "/collaboration", icon: Users, emoji: "🤝" },
      { label: "IoT Dashboard", path: "/iot", icon: Radio, emoji: "📊" },
      { label: "Gamificação", path: "/gamification", icon: Gamepad2, emoji: "🎮" },
      { label: "Configurações", path: "/settings", icon: Settings, emoji: "⚙️" },
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
