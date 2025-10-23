/**
 * Nautilus One - Module Definitions
 * Complete list of all 39 modules with their configurations
 */

import { ModuleDefinition } from "./ModuleRegistry";

export const NAUTILUS_MODULES: ModuleDefinition[] = [
  // Dashboard & Overview
  {
    id: "dashboard",
    name: "Dashboard Principal",
    path: "/dashboard",
    category: "dashboard",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Central dashboard with system overview and key metrics"
  },

  // Sistema Marítimo
  {
    id: "dp-intelligence",
    name: "DP Intelligence",
    path: "/dp-intelligence",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI", "MQTT"],
    fallbackAvailable: true,
    description: "Dynamic Positioning intelligence and monitoring"
  },
  {
    id: "bridgelink",
    name: "BridgeLink",
    path: "/bridgelink",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "MQTT"],
    fallbackAvailable: true,
    description: "Bridge communication and coordination system"
  },
  {
    id: "forecast-global",
    name: "Forecast Global",
    path: "/forecast-global",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Global weather and operational forecasting"
  },
  {
    id: "control-hub",
    name: "Control Hub",
    path: "/control-hub",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "MQTT"],
    fallbackAvailable: true,
    description: "Central control and monitoring hub"
  },
  {
    id: "mmi",
    name: "MMI (Maintenance Intelligence)",
    path: "/mmi/jobs",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Intelligent maintenance management"
  },
  {
    id: "fmea-expert",
    name: "FMEA Expert",
    path: "/admin/risk-audit",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Failure Mode and Effects Analysis expert system"
  },
  {
    id: "sgso",
    name: "SGSO",
    path: "/sgso",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Safety management system (Sistema de Gestão de Segurança Operacional)"
  },
  {
    id: "peo-dp",
    name: "PEO-DP",
    path: "/peo-dp",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "DP operational excellence procedures"
  },
  {
    id: "fleet",
    name: "Gestão de Frota",
    path: "/fleet",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Fleet management and tracking"
  },
  {
    id: "crew",
    name: "Gestão de Tripulação",
    path: "/crew",
    category: "maritime",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Crew scheduling and management"
  },

  // Comunicação & Colaboração
  {
    id: "communication",
    name: "Central de Comunicação",
    path: "/comunicacao",
    category: "communication",
    aiEnabled: true,
    connectedTo: ["Supabase", "MQTT"],
    fallbackAvailable: true,
    description: "Communication center and messaging"
  },
  {
    id: "real-time-workspace",
    name: "Workspace em Tempo Real",
    path: "/real-time-workspace",
    category: "communication",
    aiEnabled: true,
    connectedTo: ["Supabase", "WebRTC"],
    fallbackAvailable: true,
    description: "Real-time collaborative workspace"
  },
  {
    id: "channel-manager",
    name: "Gerenciador de Canais",
    path: "/channel-manager",
    category: "communication",
    aiEnabled: false,
    connectedTo: ["Supabase", "MQTT"],
    fallbackAvailable: true,
    description: "Communication channels management"
  },
  {
    id: "notifications-center",
    name: "Centro de Notificações",
    path: "/notifications-center",
    category: "communication",
    aiEnabled: true,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "Centralized notification system"
  },

  // Gestão & Analytics
  {
    id: "analytics",
    name: "Analytics Central",
    path: "/analytics",
    category: "analytics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Central analytics and insights"
  },
  {
    id: "analytics-core",
    name: "Analytics Core",
    path: "/analytics-core",
    category: "analytics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Core analytics engine"
  },
  {
    id: "reports",
    name: "Central de Relatórios",
    path: "/reports-module",
    category: "analytics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Reports generation and management"
  },
  {
    id: "performance",
    name: "Monitor de Performance",
    path: "/performance",
    category: "analytics",
    aiEnabled: true,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "Performance monitoring and optimization"
  },

  // RH & Pessoas
  {
    id: "portal-funcionario",
    name: "Portal do Funcionário",
    path: "/portal-funcionario",
    category: "hr",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Employee portal and HR services"
  },
  {
    id: "crew-wellbeing",
    name: "Bem-estar da Tripulação",
    path: "/crew-wellbeing",
    category: "hr",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Crew wellbeing and health management"
  },
  {
    id: "training-academy",
    name: "Academia de Treinamento",
    path: "/training-academy",
    category: "hr",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Training and certification management"
  },
  {
    id: "user-management",
    name: "Gestão de Usuários",
    path: "/user-management",
    category: "hr",
    aiEnabled: false,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "User accounts and access management"
  },

  // Documentos & Compliance
  {
    id: "documentos",
    name: "Documentos Inteligentes",
    path: "/documentos",
    category: "documents",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Intelligent document management"
  },
  {
    id: "document-ai",
    name: "Document AI",
    path: "/document-ai",
    category: "documents",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "AI-powered document processing"
  },
  {
    id: "compliance-hub",
    name: "Hub de Compliance",
    path: "/compliance-hub",
    category: "compliance",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Compliance tracking and management"
  },
  {
    id: "audit-center",
    name: "Centro de Auditorias",
    path: "/audit-center",
    category: "compliance",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Audit management and tracking"
  },
  {
    id: "checklists-inteligentes",
    name: "Checklists Inteligentes",
    path: "/checklists-inteligentes",
    category: "compliance",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Intelligent checklist system"
  },

  // Viagens & Logística
  {
    id: "voyage-planner",
    name: "Planejador de Viagens",
    path: "/voyage-planner",
    category: "logistics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI", "MapBox"],
    fallbackAvailable: true,
    description: "Voyage planning and optimization"
  },
  {
    id: "logistics-hub",
    name: "Hub de Logística",
    path: "/logistics-hub",
    category: "logistics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Logistics coordination and management"
  },
  {
    id: "fuel-optimizer",
    name: "Otimizador de Combustível",
    path: "/fuel-optimizer",
    category: "logistics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Fuel consumption optimization"
  },

  // IA & Inovação
  {
    id: "ai-insights",
    name: "AI Insights",
    path: "/ai-insights",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: false,
    description: "AI-powered insights and predictions"
  },
  {
    id: "automation",
    name: "Automação de Tarefas",
    path: "/automation",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Task automation engine"
  },
  {
    id: "voice-assistant",
    name: "Assistente de Voz",
    path: "/voice-assistant",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Voice-controlled AI assistant"
  },
  {
    id: "feedback",
    name: "Sistema de Feedback",
    path: "/feedback",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "AI-powered feedback analysis"
  },

  // Integrações & Sistema
  {
    id: "api-gateway",
    name: "API Gateway",
    path: "/api-gateway",
    category: "system",
    aiEnabled: false,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "API management and gateway"
  },
  {
    id: "api-gateway-docs",
    name: "API Documentation",
    path: "/api-gateway/docs",
    category: "system",
    aiEnabled: false,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "API Gateway documentation and testing"
  },
  {
    id: "mission-control",
    name: "Controle de Missão",
    path: "/mission-control",
    category: "system",
    aiEnabled: true,
    connectedTo: ["Supabase", "MQTT"],
    fallbackAvailable: true,
    description: "Mission planning and control"
  },
  {
    id: "insight-dashboard",
    name: "Insight Dashboard",
    path: "/mission-control/insight-dashboard",
    category: "analytics",
    aiEnabled: true,
    connectedTo: ["Supabase", "OpenAI"],
    fallbackAvailable: true,
    description: "Strategic visibility and AI-driven insights"
  },
  {
    id: "autonomy-console",
    name: "Autonomy Console",
    path: "/mission-control/autonomy",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "Autonomous decision-making console"
  },
  {
    id: "emergency-response",
    name: "Resposta a Emergências",
    path: "/emergency-response",
    category: "system",
    aiEnabled: true,
    connectedTo: ["Supabase", "MQTT", "OpenAI"],
    fallbackAvailable: true,
    description: "Emergency response coordination"
  },
  {
    id: "satellite-tracker",
    name: "Rastreador de Satélites",
    path: "/satellite-tracker",
    category: "system",
    aiEnabled: false,
    connectedTo: ["Supabase"],
    fallbackAvailable: true,
    description: "Satellite tracking and communication"
  },
  {
    id: "crew-wellbeing",
    name: "Crew Wellbeing",
    path: "/portal/crew/wellbeing",
    category: "crew",
    aiEnabled: true,
    connectedTo: ["Supabase", "Lovable AI"],
    fallbackAvailable: true,
    description: "Smart AI-driven crew health and wellbeing monitoring with confidential check-ins"
  },
  {
    id: "ai-command-center",
    name: "AI Command Center",
    path: "/mission-control/ai-command",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "Lovable AI"],
    fallbackAvailable: true,
    description: "Central AI command interface for system-wide control and queries"
  },
  {
    id: "workflow-engine",
    name: "Workflow Engine",
    path: "/mission-control/workflows",
    category: "ai",
    aiEnabled: true,
    connectedTo: ["Supabase", "Lovable AI"],
    fallbackAvailable: true,
    description: "AI-powered multi-step workflow execution with approval and rollback"
  },
];
