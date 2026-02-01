/**
 * ⚠️ ATENÇÃO DESENVOLVEDORES - ESTRUTURA PROTEGIDA ⚠️
 * =========================================================
 * Esta estrutura de sidebar foi VALIDADA pela diretoria do Nauti One.
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
  Radar, Clock, Bot
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
    defaultOpen: false,
    items: [
      { label: "Visão Geral", path: "/central-comando/visao-geral", icon: Compass, emoji: "📊", status: "active" },
      { label: "Operações", path: "/central-comando/operacoes", icon: Activity, emoji: "⚡" },
      { label: "Executivo", path: "/central-comando/executivo", icon: TrendingUp, emoji: "📈", requiredRoles: ['admin', 'manager', 'department_manager'] },
      { label: "IA Central", path: "/central-comando/ia", icon: Brain, emoji: "🤖" },
      { label: "Resiliência", path: "/central-comando/resiliencia", icon: Shield, emoji: "🛡️" },
      { label: "Alertas", path: "/central-comando/alertas", icon: Bell, emoji: "🚨", badgeType: 'alerts' },
      { label: "NOC 24/7", path: "/noc", icon: Eye, emoji: "🖥️", requiredRoles: ['admin', 'supervisor', 'manager'] },
      { label: "NOC Monitoring", path: "/noc-monitoring", icon: Activity, emoji: "📡", requiredRoles: ['admin', 'supervisor', 'manager'] },
      { label: "SOC Dashboard", path: "/soc", icon: Shield, emoji: "🛡️", badge: "NEW", status: "new" },
    ],
  },

  // ============================================
  // 🚢 OPERAÇÕES MARÍTIMAS (2/16) - UNIFIED HUB
  // PATCH V4.1: Fusão em Operations Command Hub
  // ============================================
  {
    title: "🚢 Operações Marítimas",
    defaultOpen: false,
    items: [
      { label: "🚀 Operations Command", path: "/operations-command-hub", icon: Compass, emoji: "🚀", badge: "HUB", status: "new" },
      { label: "⚓ Maritime", path: "/operations-command-hub?tab=maritime", icon: Anchor, emoji: "⚓" },
      { label: "🚢 Fleet", path: "/operations-command-hub?tab=fleet", icon: Ship, emoji: "🚢" },
      { label: "🗺️ Voyage", path: "/operations-command-hub?tab=voyage", icon: Map, emoji: "🗺️" },
      { label: "🎯 Mission", path: "/operations-command-hub?tab=mission", icon: Target, emoji: "🎯" },
      { label: "📦 Logistics", path: "/operations-command-hub?tab=logistics", icon: Truck, emoji: "📦" },
      { label: "Contratos de Embarcação", path: "/vessel-contracts", icon: FileText, emoji: "📝" },
      { label: "Charter Party", path: "/charter-party", icon: FileText, emoji: "📜" },
      { label: "CTS Tripulação", path: "/vessel-cts", icon: Users, emoji: "👥" },
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
  // 🌊 OPERAÇÕES SUBMARINAS (Temporariamente desabilitado)
  // Status: Em desenvolvimento - módulos serão reativados quando prontos
  // ============================================
  // {
  //   title: "🌊 Operações Submarinas",
  //   defaultOpen: false,
  //   items: [
  //     { label: "Ocean Sonar AI", path: "/ocean-sonar", icon: Waves, emoji: "🔊" },
  //     { label: "Underwater Drone", path: "/underwater-drone", icon: Zap, emoji: "🤖" },
  //     { label: "AutoSub Mission", path: "/auto-sub", icon: Ship, emoji: "🛸" },
  //     { label: "Sonar AI Enhancement", path: "/sonar-ai", icon: Radio, emoji: "📶" },
  //     { label: "Deep Risk AI", path: "/deep-risk-ai", icon: AlertTriangle, emoji: "⚠️" },
  //   ],
  // },

  // ============================================
  // 🧠 IA & AUTOMAÇÃO - UNIFIED HUB
  // PATCH V4.1: Fusão em AI Control Tower
  // ============================================
  {
    title: "🧠 IA & Automação",
    defaultOpen: false,
    items: [
      { label: "🧠 AI Control Tower", path: "/ai-control-tower", icon: Brain, emoji: "🧠", badge: "HUB", status: "new" },
      { label: "🌟 AI Hub", path: "/ai-control-tower?tab=hub", icon: Brain, emoji: "🌟" },
      { label: "💬 AI Chat", path: "/ai-control-tower?tab=chat", icon: MessageSquare, emoji: "💬" },
      { label: "🤖 Agentes", path: "/ai-control-tower?tab=agents", icon: Bot, emoji: "🤖" },
      { label: "🔄 Workflows", path: "/ai-control-tower?tab=workflows", icon: Zap, emoji: "🔄" },
      { label: "📊 Analytics", path: "/ai-control-tower?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "👁️ Observability", path: "/ai-control-tower?tab=observability", icon: Activity, emoji: "👁️" },
      { label: "📋 Auditoria", path: "/ai-control-tower?tab=audit", icon: FileText, emoji: "📋" },
      { label: "📝 Journaling", path: "/ai-control-tower?tab=journaling", icon: FileText, emoji: "📝" },
      { label: "Voice Assistant IA", path: "/voice-assistant", icon: Mic, emoji: "🎙️" },
      { label: "Assistente de Voz", path: "/assistant/voice", icon: Mic, emoji: "🗣️" },
    ],
  },

  // ============================================
  // 🤖 AI ENTERPRISE ENGINES - 11 Módulos Especializados
  // ============================================
  {
    title: "🤖 AI Enterprise Engines",
    defaultOpen: false,
    items: [
      { label: "🗺️ Voyage & Logistics AI", path: "/ai/voyage-logistics", icon: Ship, emoji: "🗺️", badge: "AI", status: "new" },
      { label: "⚠️ Safety & Incident AI", path: "/ai/safety-incident", icon: AlertTriangle, emoji: "⚠️", badge: "AI", status: "new" },
      { label: "📦 Inventory & Spares AI", path: "/ai/inventory-spares", icon: HardDrive, emoji: "📦", badge: "AI", status: "new" },
      { label: "💰 Finance & Procurement AI", path: "/finance-procurement-ai", icon: DollarSign, emoji: "💰", badge: "AI", status: "new" },
      { label: "🛡️ Compliance AI", path: "/compliance-ai", icon: Shield, emoji: "🛡️", badge: "AI", status: "new" },
      { label: "🌱 Environmental AI", path: "/environmental-ai", icon: Leaf, emoji: "🌱", badge: "AI", status: "new" },
      { label: "📋 Quality Management AI", path: "/quality-ai", icon: ClipboardList, emoji: "📋", badge: "AI", status: "new" },
      { label: "📝 Contract & Legal AI", path: "/contract-legal-ai", icon: FileText, emoji: "📝", badge: "AI", status: "new" },
      { label: "❤️ Insurance & Claims AI", path: "/insurance-claims-ai", icon: Heart, emoji: "❤️", badge: "AI", status: "new" },
      { label: "👥 Crewing & Payroll AI", path: "/crewing-payroll-ai", icon: Users, emoji: "👥", badge: "AI", status: "new" },
      { label: "📊 Reporting & Analytics AI", path: "/reporting-analytics-ai", icon: BarChart3, emoji: "📊", badge: "AI", status: "new" },
      { label: "📱 Mobile & Offline AI", path: "/mobile-offline-ai", icon: HardDrive, emoji: "📱", badge: "AI", status: "new" },
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
  // 🏢 ENTERPRISE INTELLIGENCE SUITE (NEW!)
  // ============================================
  {
    title: "🏢 Enterprise Intelligence",
    defaultOpen: false,
    items: [
      // RAG & Knowledge
      { label: "🧠 Knowledge Hub IA", path: "/knowledge-hub", icon: Brain, emoji: "🧠", badge: "RAG", status: "new" },
      { label: "💬 RAG Chatbot", path: "/enterprise/rag-assistant", icon: MessageSquare, emoji: "💬", badge: "AI", status: "new" },
      // OCR Multi-Engine
      { label: "📄 OCR Multi-Engine", path: "/enterprise/ocr-center", icon: Eye, emoji: "📄", badge: "3 ENGINES", status: "new" },
      { label: "📤 Document Processor", path: "/enterprise/document-processor", icon: FileText, emoji: "📤", badge: "NEW", status: "new" },
      // Forms & Checklists Builder
      { label: "📋 Forms Builder", path: "/enterprise/forms-builder", icon: ClipboardList, emoji: "📋", badge: "BUILDER", status: "new" },
      { label: "✅ Checklists Builder", path: "/enterprise/checklists-builder", icon: ClipboardList, emoji: "✅", badge: "AI", status: "new" },
      // OCIMF Self-Assessment
      { label: "🔍 OCIMF OVMSA", path: "/enterprise/ocimf-assessment", icon: Shield, emoji: "🔍", badge: "OCIMF", status: "new" },
      { label: "📊 TMSA Analytics", path: "/enterprise/tmsa-analytics", icon: BarChart3, emoji: "📊", badge: "TMSA", status: "new" },
      // Fatigue Risk AI
      { label: "😴 Fatigue Risk Predictor", path: "/enterprise/fatigue-risk", icon: Activity, emoji: "😴", badge: "ML", status: "new" },
      { label: "⏰ MLC Work Hours", path: "/enterprise/mlc-hours", icon: Clock, emoji: "⏰", badge: "MLC 2006", status: "new" },
      // Crew Matching AI
      { label: "🎯 Crew Matching AI", path: "/enterprise/crew-matching", icon: Users, emoji: "🎯", badge: "AI", status: "new" },
      { label: "📈 Talent Pool", path: "/enterprise/talent-pool", icon: TrendingUp, emoji: "📈", badge: "NEW", status: "new" },
      // Contract Analysis AI
      { label: "📝 Contract Analysis AI", path: "/enterprise/contract-analysis", icon: FileText, emoji: "📝", badge: "AI", status: "new" },
      { label: "⚠️ Risk Clause Detector", path: "/enterprise/risk-clauses", icon: AlertTriangle, emoji: "⚠️", badge: "AI", status: "new" },
      // Compliance Predictor
      { label: "🔮 Compliance Predictor", path: "/enterprise/compliance-predictor", icon: Brain, emoji: "🔮", badge: "ML", status: "new" },
      { label: "📉 NC Prediction", path: "/enterprise/nc-prediction", icon: TrendingUp, emoji: "📉", badge: "AI", status: "new" },
    ],
  },

  // ============================================
  // 🚀 MÓDULOS AVANÇADOS EXTRAORDINÁRIOS (NEW!)
  // 12 ferramentas revolucionárias de nova geração
  // ============================================
  {
    title: "🚀 Módulos Avançados",
    defaultOpen: false,
    items: [
      // OPERAÇÕES & ENGENHARIA
      { label: "🚢 Digital Twin 3D", path: "/advanced/digital-twin-3d", icon: Ship, emoji: "🚢", badge: "3D IoT", status: "new" },
      { label: "🌊 Weather Intelligence", path: "/advanced/weather-intelligence", icon: Cloud, emoji: "🌊", badge: "AI ROUTE", status: "new" },
      { label: "⛽ Bunker Optimization", path: "/advanced/bunker-optimization", icon: Zap, emoji: "⛽", badge: "ML", status: "new" },
      { label: "📦 Cargo Planning AI", path: "/advanced/cargo-planning", icon: Ship, emoji: "📦", badge: "STABILITY", status: "new" },
      // COMPLIANCE & SEGURANÇA
      { label: "🛡️ PSC Readiness AI", path: "/advanced/psc-readiness", icon: Shield, emoji: "🛡️", badge: "INSPECT", status: "new" },
      { label: "🌍 MARPOL Tracker", path: "/advanced/marpol-tracker", icon: Leaf, emoji: "🌍", badge: "ENV", status: "new" },
      { label: "🔗 Blockchain Certificates", path: "/advanced/blockchain-certificates", icon: Database, emoji: "🔗", badge: "QR", status: "new" },
      { label: "🔍 Incident Investigation AI", path: "/advanced/incident-investigation", icon: Target, emoji: "🔍", badge: "RCA", status: "new" },
      // TREINAMENTO & EXPERIÊNCIA
      { label: "🎮 VR/AR Training", path: "/advanced/vr-training", icon: Gamepad2, emoji: "🎮", badge: "IMMERSIVE", status: "new" },
      { label: "🎤 ARIA Voice Commands", path: "/advanced/voice-commands", icon: Mic, emoji: "🎤", badge: "NLU", status: "new" },
      { label: "💚 Crew Wellness AI", path: "/advanced/crew-wellness-ai", icon: Heart, emoji: "💚", badge: "PREDICT", status: "new" },
      { label: "📊 Executive Dashboard", path: "/advanced/executive-dashboard", icon: BarChart3, emoji: "📊", badge: "BI", status: "new" },
    ],
  },

  // ============================================
  // 📊 TELEMETRIA & MONITORAMENTO - UNIFIED HUB
  // PATCH V4.1: Fusão em Tracking & Telemetry Hub
  // ============================================
  {
    title: "📊 Telemetria & Monitoramento",
    defaultOpen: false,
    items: [
      { label: "📡 Tracking & Telemetry", path: "/tracking-telemetry", icon: Satellite, emoji: "📡", badge: "HUB", status: "new" },
      { label: "🛰️ Visão Geral", path: "/tracking-telemetry?tab=overview", icon: Satellite, emoji: "🛰️" },
      { label: "⚡ Tempo Real", path: "/tracking-telemetry?tab=realtime", icon: Activity, emoji: "⚡" },
      { label: "📈 Preditiva", path: "/tracking-telemetry?tab=predictive", icon: TrendingUp, emoji: "📈" },
      { label: "🚨 Alertas", path: "/tracking-telemetry?tab=alerts", icon: AlertTriangle, emoji: "🚨" },
      { label: "📅 Histórico", path: "/tracking-telemetry?tab=history", icon: Calendar, emoji: "📅" },
      { label: "Simulador Incidentes", path: "/simulador", icon: Target, emoji: "⚠️" },
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
  // 📁 RELATÓRIOS & DOCUMENTOS - UNIFIED HUB
  // PATCH V4.1: Fusão em Document Center Hub
  // ============================================
  {
    title: "📁 Relatórios & Documentos",
    defaultOpen: false,
    items: [
      { label: "📄 Document Center", path: "/document-center", icon: FileText, emoji: "📄", badge: "HUB", status: "new" },
      { label: "📑 Documentos", path: "/document-center?tab=documents", icon: FileText, emoji: "📑" },
      { label: "📋 Templates", path: "/document-center?tab=templates", icon: ClipboardList, emoji: "📋" },
      { label: "✅ Checklists", path: "/document-center?tab=checklists", icon: ClipboardList, emoji: "✅" },
      { label: "📊 Relatórios", path: "/document-center?tab=reports", icon: BarChart3, emoji: "📊" },
      { label: "📤 Exportar", path: "/document-center?tab=export", icon: BarChart3, emoji: "📤" },
      { label: "🔍 Busca Avançada", path: "/document-center?tab=search", icon: Target, emoji: "🔍" },
      { label: "🧠 Knowledge Hub IA", path: "/knowledge-hub", icon: Brain, emoji: "🧠", badge: "ENTERPRISE", status: "new" },
    ],
  },

  // ============================================
  // 📢 COMUNICAÇÃO & ALERTAS - UNIFIED HUB
  // PATCH V4.1: Fusão em Comms & Alerts Hub
  // ============================================
  {
    title: "📢 Comunicação & Alertas",
    defaultOpen: false,
    items: [
      { label: "🔔 Comms & Alerts", path: "/comms-alerts", icon: Bell, emoji: "🔔", badge: "HUB", status: "new" },
      { label: "💬 Comunicação", path: "/comms-alerts?tab=comms", icon: MessageSquare, emoji: "💬" },
      { label: "🚨 Alertas", path: "/comms-alerts?tab=alerts", icon: Bell, emoji: "🚨" },
      { label: "💼 Workspace", path: "/comms-alerts?tab=workspace", icon: Activity, emoji: "💼" },
      { label: "📡 Conectividade", path: "/comms-alerts?tab=connectivity", icon: Radio, emoji: "📡" },
    ],
  },

  // ============================================
  // 🔍 AUDITORIAS & COMPLIANCE (10/16)
  // ============================================
  {
    title: "🔍 Auditorias",
    defaultOpen: false,
    items: [
      // ===== DIAGNÓSTICO RÁPIDO - 5 SOLUÇÕES =====
      { label: "🔔 Alertas Certificados", path: "/diagnostic-certificates", icon: Bell, emoji: "🔔", badge: "NEW", status: "new" },
      { label: "📊 Dashboard Compliance", path: "/diagnostic-dashboard", icon: BarChart3, emoji: "📊", badge: "NEW", status: "new" },
      { label: "📁 Repositório Docs", path: "/diagnostic-documents", icon: FileText, emoji: "📁", badge: "NEW", status: "new" },
      { label: "⚠️ Workflow NCs", path: "/diagnostic-ncs", icon: AlertTriangle, emoji: "⚠️", badge: "NEW", status: "new" },
      { label: "📈 Relatórios Auto", path: "/diagnostic-reports", icon: FileText, emoji: "📈", badge: "NEW", status: "new" },
      // Dashboard Executivo de Compliance (NOVO)
      { label: "📊 Dashboard Executivo", path: "/compliance-executive", icon: BarChart3, emoji: "📊", badge: "NEW", status: "new" },
      // Centro de Compliance Avançado (NOVO - Roadmap Completo)
      { label: "🚀 Compliance Avançado", path: "/compliance-roadmap", icon: Shield, emoji: "🚀", badge: "NEW", status: "new" },
      // Chat IA Agêntico (NOVO)
      { label: "🤖 Audit AI Chat", path: "/audit-ai-chat", icon: Brain, emoji: "🤖", badge: "NEW", status: "new" },
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
  // 👥 RH & PESSOAS - UNIFIED HUB
  // PATCH V4.1: Fusão em People Hub
  // ============================================
  {
    title: "👥 RH & Pessoas",
    defaultOpen: false,
    items: [
      { label: "👥 People Hub", path: "/people-hub", icon: Users, emoji: "👥", badge: "HUB", status: "new" },
      { label: "📊 Visão Geral", path: "/people-hub?tab=overview", icon: Users, emoji: "📊" },
      { label: "🎯 Talent & Recrutamento", path: "/people-hub?tab=talent", icon: Target, emoji: "🎯" },
      { label: "📈 Performance", path: "/people-hub?tab=performance", icon: TrendingUp, emoji: "📈" },
      { label: "❤️ Bem-estar", path: "/people-hub?tab=wellness", icon: Heart, emoji: "❤️" },
      { label: "🎓 Treinamento", path: "/people-hub?tab=training", icon: BookOpen, emoji: "🎓" },
      { label: "🛡️ Compliance", path: "/people-hub?tab=compliance", icon: Shield, emoji: "🛡️" },
      { label: "📊 Analytics", path: "/people-hub?tab=analytics", icon: BarChart3, emoji: "📊" },
      { label: "Enfermaria Digital", path: "/medical-infirmary", icon: Heart, emoji: "🏥" },
      { label: "Gestão de Usuários", path: "/users", icon: Users, emoji: "🔑" },
    ],
  },

  // ============================================
  // 🎓 TREINAMENTOS
  // ============================================
  {
    title: "🎓 Treinamentos",
    defaultOpen: false,
    items: [
      { label: "Nauti Academy", path: "/nautilus-academy", icon: BookOpen, emoji: "🎓" },
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
      { label: "Onboarding", path: "/onboarding", icon: ClipboardList, emoji: "📋", badge: "NEW", status: "new" },
      { label: "Analytics & Feedback", path: "/analytics-feedback", icon: BarChart3, emoji: "📊", badge: "NPS", status: "new" },
      { label: "Billing Portal", path: "/billing-portal", icon: DollarSign, emoji: "💳", badge: "NEW", status: "new" },
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
