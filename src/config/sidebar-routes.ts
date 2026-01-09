/**
 * ⚠️ ATENÇÃO DESENVOLVEDORES - ESTRUTURA PROTEGIDA ⚠️
 * =========================================================
 * Esta estrutura de sidebar foi VALIDADA pela diretoria do Nautilus One.
 * 
 * ❌ NÃO remover, sobrescrever ou simplificar os grupos abaixo
 * ❌ NÃO reduzir a versão "mínima" ou simplificada
 * ❌ NÃO remover seções como IA, ESG, Viagens, Auditorias, etc.
 * ✅ Adicionar novos módulos DENTRO dessas categorias, não fora
 * ✅ Manter 100% dos grupos e ordem estabelecida
 * 
 * Versão oficial: v3.2.0 - Dezembro 2025
 * TOTAL: 16 categorias principais, 100+ módulos
 * =========================================================
 * 
 * GRUPOS OBRIGATÓRIOS (16):
 * 1. 🛰️ Centro de Comando
 * 2. 🚢 Operações Marítimas
 * 3. 🔧 Manutenção
 * 4. 🤿 Operações Submarinas
 * 5. 🤖 IA & Automação
 * 6. 📶 Telemetria & Monitoramento
 * 7. 🌐 APIs & Integrações
 * 8. 📂 Relatórios & Documentos
 * 9. 📢 Comunicação & Alertas
 * 10. 🔍 Auditorias
 * 11. 👥 RH & Pessoas
 * 12. 🎓 Treinamentos
 * 13. 💰 Finanças & Procurement
 * 14. 🌱 ESG & Sustentabilidade
 * 15. ✈️ Viagens & Logística
 * 16. ⚙️ Sistema & Configurações
 * =========================================================
 */

import {
  Ship, Shield, Brain, Activity, Target, Globe, Eye, Mic, Satellite,
  Cloud, Radio, Anchor, Plane, Lock, AlertTriangle, TrendingUp,
  BarChart3, Wrench, Compass, Map, Waves, Zap, Users, FileText,
  MessageSquare, Bell, Settings, BookOpen, Award, Heart, Leaf,
  ShoppingCart, Link, Gamepad2, Database, Server, Cpu, Calendar,
  ClipboardList, Briefcase, DollarSign, Truck, HardDrive, Thermometer,
  Radar
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
 * MASTER SIDEBAR ROUTES - v3.2.0 OFFICIAL STRUCTURE
 * Ordem oficial conforme aprovado pela diretoria
 */
export const SIDEBAR_ROUTES: SidebarGroup[] = [
  // ============================================
  // 🧠 CENTRAL DE COMANDO - MÓDULO UNIFICADO (1/16)
  // PATCH UNIFY-4.0: Fusão Nautilus Command + Dashboard
  // ============================================
  {
    title: "🧠 Central de Comando",
    defaultOpen: true,
    items: [
      { label: "Visão Geral", path: "/central-comando/visao-geral", icon: Compass, emoji: "📊", status: "active" },
      { label: "Operações", path: "/central-comando/operacoes", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/central-comando/executivo", icon: TrendingUp, emoji: "📈", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "IA Central", path: "/central-comando/ia", icon: Brain, emoji: "🤖" },
      { label: "Resiliência", path: "/central-comando/resiliencia", icon: Shield, emoji: "🛡️" },
      { label: "Alertas", path: "/central-comando/alertas", icon: Bell, emoji: "🚨", badgeType: 'alerts' },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️", requiredRoles: ['admin', 'supervisor', 'manager'] },
      { label: "NOC Monitoring", path: "/noc-monitoring", icon: Activity, emoji: "📡", requiredRoles: ['admin', 'supervisor', 'manager'] },
    ],
  },

  // ============================================
  // 🚢 OPERAÇÕES MARÍTIMAS (2/16)
  // ============================================
  {
    title: "🚢 Operações Marítimas",
    defaultOpen: false,
    items: [
      { label: "Maritime Command", path: "/maritime-command", icon: Anchor, emoji: "⚓" },
      { label: "Fleet Command Center", path: "/fleet-command", icon: Ship, emoji: "🚢" },
      { label: "Voyage Command", path: "/voyage-command", icon: Map, emoji: "🗺️" },
      { label: "Otimização de Rotas AI", path: "/route-optimizer", icon: Compass, emoji: "🧭", badge: "AI", status: "new" },
      { label: "Mission Command", path: "/mission-command", icon: Target, emoji: "🎯" },
      { label: "Bridge Link", path: "/bridge-link", icon: Link, emoji: "🌉" },
      { label: "Drydock Management", path: "/drydock-management", icon: Anchor, emoji: "🏗️" },
      { label: "Contratos de Embarcação", path: "/vessel-contracts", icon: FileText, emoji: "📝" },
      { label: "Charter Party", path: "/charter-party", icon: FileText, emoji: "📜" },
      { label: "Cargo Management", path: "/cargo-management", icon: Ship, emoji: "📦" },
      { label: "Port Call", path: "/port-call", icon: Anchor, emoji: "⚓" },
      { label: "CTS Tripulação", path: "/vessel-cts", icon: Users, emoji: "👥" },
      { label: "Histórico de Embarcação", path: "/vessel-history", icon: Activity, emoji: "📊" },
      { label: "Digital Twin", path: "/digital-twin", icon: Cpu, emoji: "🎮", badge: "v4.0", status: "new" },
      { label: "Logistics Command", path: "/logistics-command", icon: Truck, emoji: "📦", badge: "v4.0", status: "new" },
    ],
  },

  // ============================================
  // 🔧 MANUTENÇÃO - MÓDULO UNIFICADO
  // PATCH UNIFY-4.0: Fusão de todos MMI em Maintenance Command
  // ============================================
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [
      { label: "Central de Manutenção", path: "/maintenance-command", icon: Wrench, emoji: "🔧", status: "active" },
      { label: "Manutenção Preditiva ML", path: "/predictive-maintenance", icon: Brain, emoji: "🧠", badge: "ML", status: "new" },
      { label: "Saúde da Frota", path: "/maintenance-command?tab=health", icon: Activity, emoji: "💚" },
      { label: "IA Copilot", path: "/maintenance-command?tab=copilot", icon: Brain, emoji: "🤖" },
      { label: "Jobs & Ordens", path: "/maintenance-command?tab=jobs", icon: Briefcase, emoji: "📋" },
      { label: "Forecast IA", path: "/maintenance-command?tab=forecast", icon: TrendingUp, emoji: "📈" },
      { label: "Digital Twin 3D", path: "/maintenance-command?tab=twin", icon: Cpu, emoji: "🎮" },
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
      { label: "🌟 AI Hub Central", path: "/ai-hub", icon: Brain, emoji: "🌟", badge: "REVOLUTION", status: "new" },
      { label: "📊 AI Analytics", path: "/ai-analytics", icon: BarChart3, emoji: "📊", badge: "NEW", status: "new" },
      { label: "🚀 Features Revolucionárias", path: "/revolutionary-features", icon: Zap, emoji: "🚀", badge: "NEW", status: "new" },
      { label: "🤖 Autonomous Command", path: "/autonomous-command", icon: Brain, emoji: "🤖", badge: "v4.0", status: "new" },
      { label: "🎯 Agent Orchestration", path: "/agent-orchestration", icon: Brain, emoji: "🎯", badge: "v4.0", status: "new" },
      { label: "AI Command Center", path: "/ai-command", icon: Brain, emoji: "🧠" },
      { label: "IA Autônoma (Logs)", path: "/ai-ops/logs", icon: Zap, emoji: "🤖" },
      { label: "Observabilidade IA", path: "/ai-observability", icon: Activity, emoji: "📊" },
      { label: "Workflow Command", path: "/workflow-command", icon: Zap, emoji: "🔄" },
      { label: "Journaling IA", path: "/ai-journaling", icon: FileText, emoji: "📝" },
      { label: "Auditoria de IA", path: "/ai-audit", icon: Brain, emoji: "🔍" },
      { label: "Voice Assistant IA", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
      { label: "Assistente de Voz", path: "/assistant/voice", icon: Mic, emoji: "🗣️" },
    ],
  },

  // ============================================
  // 🔬 INTELIGÊNCIA AVANÇADA (NEW!)
  // ============================================
  {
    title: "🔬 Inteligência Avançada",
    defaultOpen: false,
    items: [
      { label: "🎯 Otimização Unificada", path: "/optimization-dashboard", icon: Target, emoji: "🎯", badge: "NEW", status: "new" },
      { label: "⚡ OPEC - Otimizador Energético", path: "/intelligence/opec", icon: Zap, emoji: "⚡", badge: "NEW", status: "new" },
      { label: "❤️ SAWP - Wellness Preditivo", path: "/intelligence/wellness", icon: Activity, emoji: "❤️", badge: "NEW", status: "new" },
      { label: "📚 CIDM - Central Documentos", path: "/intelligence/documents", icon: FileText, emoji: "📚", badge: "NEW", status: "new" },
      { label: "🛡️ CIAI - Inteligência Acidentes", path: "/intelligence/accidents", icon: Shield, emoji: "🛡️", badge: "NEW", status: "new" },
      { label: "🔗 GDCB - Blockchain Governance", path: "/intelligence/blockchain", icon: Database, emoji: "🔗", badge: "NEW", status: "new" },
      { label: "📡 ICFT - Intel. Competitiva", path: "/intelligence/competitive", icon: Radar, emoji: "📡", badge: "AIS", status: "new" },
    ],
  },

  // ============================================
  // 📊 TELEMETRIA & MONITORAMENTO
  // ============================================
  {
    title: "📊 Telemetria & Monitoramento",
    defaultOpen: true,
    items: [
      { label: "Telemetria 360°", path: "/telemetria", icon: Satellite, emoji: "🛰️" },
      { label: "Telemetria Preditiva", path: "/predictive-telemetry", icon: Activity, emoji: "📈" },
      { label: "Otimização Satélite", path: "/satellite-optimizer", icon: Satellite, emoji: "📡", badge: "NEW", status: "new" },
      { label: "DGNSS Tracking", path: "/tracking", icon: Satellite, emoji: "📍", badge: "NEW" },
      { label: "GNSS Live", path: "/tracking/gnss-live", icon: Radio, emoji: "📡" },
      { label: "Tracking Alerts", path: "/tracking/alerts", icon: AlertTriangle, emoji: "🚨" },
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
      { label: "Centro de Exportação", path: "/export-center", icon: BarChart3, emoji: "📤", badge: "NEW" },
      { label: "Busca Avançada", path: "/advanced-search", icon: Target, emoji: "🔍", badge: "NEW" },
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
  // 🔍 AUDITORIAS & COMPLIANCE (10/16)
  // ============================================
  {
    title: "🔍 Auditorias",
    defaultOpen: false,
    items: [
      // Auditorias Marítimas Regulatórias
      { label: "PEO-DP", path: "/peo-dp", icon: FileText, emoji: "📋" },
      { label: "PEOTRAM", path: "/peotram", icon: FileText, emoji: "📋" },
      { label: "SGSO", path: "/sgso", icon: FileText, emoji: "📋" },
      { label: "IMCA Audit", path: "/imca-audit", icon: Shield, emoji: "🔍" },
      { label: "Pre-OVID Inspection", path: "/pre-ovid", icon: Eye, emoji: "🚢" },
      { label: "MLC Inspection", path: "/mlc-inspection", icon: Shield, emoji: "🔍" },
      { label: "Gerador Pacotes PSC", path: "/psc-package", icon: Shield, emoji: "🛡️" },
      // Gestão de Mudanças & Responsabilidades (Consolidado)
      { label: "GMUD", path: "/gmud", icon: Settings, emoji: "🔄" },
      { label: "Matriz de Responsabilidades", path: "/responsibility-matrix", icon: Users, emoji: "📊" },
      // Segurança & Fatores Humanos (Consolidado)
      { label: "Safety Human Factors", path: "/safety-human-factors", icon: Brain, emoji: "🧠" },
      { label: "Safety IMCA", path: "/safety-imca", icon: Shield, emoji: "🛡️" },
      { label: "ISPS Security & Cyber", path: "/isps-security", icon: Lock, emoji: "🔐" },
      { label: "Drill Simulator", path: "/drill-simulator", icon: Target, emoji: "🎯" },
      // Compliance One - ISO 37301 (Consolidado)
      { label: "Compliance One", path: "/compliance-one", icon: Shield, emoji: "🛡️" },
      { label: "Regulamentos", path: "/regulations", icon: FileText, emoji: "📜" },
      { label: "Matriz de Riscos", path: "/risk-matrix", icon: AlertTriangle, emoji: "⚠️" },
      { label: "Evidências", path: "/evidences", icon: FileText, emoji: "📁" },
      { label: "Due Diligence", path: "/due-diligence", icon: Users, emoji: "🔍" },
      { label: "Canal de Denúncias", path: "/whistleblower", icon: Bell, emoji: "📢" },
      // Segurança & Compliance
      { label: "Security Center", path: "/security-center", icon: Shield, emoji: "🛡️", requiredRoles: ['admin'] },
      { label: "AI Operations Center", path: "/ai-operations-center", icon: Brain, emoji: "🤖", requiredRoles: ['admin'], badgeType: 'alerts' },
      { label: "Auditoria de Segurança", path: "/auditoria-seguranca", icon: ClipboardList, emoji: "📋", requiredRoles: ['admin', 'auditor'] },
      { label: "Security Scanner", path: "/security-scanner", icon: Lock, emoji: "🔐", requiredRoles: ['admin'] },
      { label: "Compliance Hub", path: "/compliance-hub", icon: Shield, emoji: "✅", requiredRoles: ['admin', 'auditor', 'manager'] },
      { label: "Safety Guardian", path: "/safety-guardian", icon: Shield, emoji: "⛑️" },
    ],
  },

  // ============================================
  // 👥 RH & PESSOAS
  // ============================================
  {
    title: "👥 RH & Pessoas",
    defaultOpen: false,
    items: [
      { label: "🏢 HR Dashboard", path: "/hr-dashboard", icon: Users, emoji: "🏢", badge: "NEW", status: "new" },
      { label: "📊 People Analytics", path: "/people-analytics", icon: BarChart3, emoji: "📊", badge: "AI", status: "new" },
      { label: "👤 Portal Colaborador", path: "/employee-portal", icon: Users, emoji: "👤", badge: "NEW", status: "new" },
      { label: "Nautilus People Hub", path: "/nautilus-people", icon: Users, emoji: "👥" },
      { label: "Gestão de Tripulação", path: "/crew-management", icon: Users, emoji: "👤" },
      { label: "Bem-estar AI", path: "/crew-wellness", icon: Heart, emoji: "❤️", badge: "AI", status: "new" },
      { label: "Bem-estar Tripulação", path: "/crew-wellbeing", icon: Heart, emoji: "💚" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Heart, emoji: "🏥" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑" },
      { label: "Recrutamento AI", path: "/recruitment", icon: Users, emoji: "🎯", badge: "v4.0", status: "new" },
      { label: "MLC Scheduling", path: "/mlc-scheduling", icon: Calendar, emoji: "📅", badge: "MLC", status: "new" },
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
      { label: "Voyage Accounting", path: "/voyage-accounting", icon: DollarSign, emoji: "📊", badge: "NEW" },
      { label: "Analytics Command", path: "/analytics-command", icon: BarChart3, emoji: "📊" },
      { label: "Operations Command", path: "/operations-command", icon: Settings, emoji: "⚙️" },
      { label: "Procurement Command", path: "/procurement-command", icon: ShoppingCart, emoji: "🛒" },
      { label: "Gestão de Tarefas", path: "/task-management", icon: ClipboardList, emoji: "📋" },
      { label: "Supplier Portal", path: "/supplier-portal", icon: ShoppingCart, emoji: "🏭", badge: "v4.0", status: "new" },
      { label: "Company Financials", path: "/company-financials", icon: DollarSign, emoji: "💹", badge: "v4.0", status: "new" },
      { label: "Blockchain Compliance", path: "/blockchain-compliance", icon: Database, emoji: "🔗", badge: "v4.0", status: "new" },
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
      { label: "Sustainability Score", path: "/sustainability-score", icon: TrendingUp, emoji: "📊", badge: "NEW" },
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
      { label: "IoT Sensors Real-time", path: "/iot-dashboard", icon: Thermometer, emoji: "🌡️", badge: "v4.0", status: "new" },
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
