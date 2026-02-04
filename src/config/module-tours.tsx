/**
 * Module Tours Configuration
 * Configuração centralizada dos tours de onboarding para todos os módulos
 */
import React from "react";
import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Users, FileText, BookOpen, Award, Heart,
  BarChart3, Bot, Zap, Package, DollarSign, Leaf, ClipboardList,
  Globe, Fuel, Droplets, Gauge, Thermometer, Clock, MapPin,
  AlertTriangle, Stethoscope, Pill, Calendar, Radio, Truck,
  Search, Upload, Download, Settings, Lock, GraduationCap,
  TrendingUp, PieChart, Wallet, Receipt, ShoppingCart, Plane,
  MessageSquare, Bell, Mic, Database, Server, Link, Cpu
} from "lucide-react";
import type { OnboardingStep } from "@/components/ux/ModuleOnboarding";

/**
 * Tours para cada módulo do sistema
 */
export const MODULE_TOURS: Record<string, { name: string; steps: OnboardingStep[] }> = {
  // ============================================
  // FUEL MANAGEMENT
  // ============================================
  "fuel-management": {
    name: "Gestão de Combustível",
    steps: [
      {
        id: "fuel-welcome",
        title: "Bem-vindo à Gestão de Combustível",
        description: "Monitore seus tanques de combustível, registre operações de bunker e otimize o consumo da frota.",
        icon: <Fuel className="h-8 w-8 text-primary" />,
        tip: "Acompanhe em tempo real o nível de todos os tanques"
      },
      {
        id: "fuel-tanks",
        title: "Visão dos Tanques",
        description: "Veja o status de cada tanque: HFO, MGO, LSFO. Inclui níveis, temperatura e capacidade.",
        icon: <Droplets className="h-8 w-8 text-info" />,
      },
      {
        id: "fuel-bunker",
        title: "Operações de Bunker",
        description: "Registre todas as operações de abastecimento com fornecedor, preço e quantidade.",
        icon: <Ship className="h-8 w-8 text-success" />,
        tip: "Histórico completo com custos por MT e comparativos"
      },
      {
        id: "fuel-analytics",
        title: "Analytics de Consumo",
        description: "Análise de eficiência, consumo médio e projeções de custo com relatórios detalhados.",
        icon: <BarChart3 className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // WASTE MANAGEMENT
  // ============================================
  "waste-management": {
    name: "Gestão de Resíduos",
    steps: [
      {
        id: "waste-welcome",
        title: "Bem-vindo à Gestão de Resíduos",
        description: "Gerencie todos os resíduos da embarcação em conformidade com MARPOL.",
        icon: <Leaf className="h-8 w-8 text-success" />,
        tip: "Sistema 100% digital para Oil Record Book e Garbage Record Book"
      },
      {
        id: "waste-orb",
        title: "Oil Record Book (ORB)",
        description: "Registre todas as operações de óleo: transferências, descartes e resíduos oleosos.",
        icon: <Droplets className="h-8 w-8 text-amber-500" />,
      },
      {
        id: "waste-grb",
        title: "Garbage Record Book (GRB)",
        description: "Controle de lixo por categoria MARPOL: plásticos, orgânicos, vidros e mais.",
        icon: <Package className="h-8 w-8 text-info" />,
        tip: "Assinaturas digitais do Comandante incluídas"
      },
      {
        id: "waste-compliance",
        title: "Conformidade MARPOL",
        description: "Acompanhe o status de conformidade com cada anexo do MARPOL e receba alertas.",
        icon: <Shield className="h-8 w-8 text-primary" />,
      }
    ]
  },

  // ============================================
  // MEDICAL INFIRMARY
  // ============================================
  "medical-infirmary": {
    name: "Enfermaria Digital",
    steps: [
      {
        id: "medical-welcome",
        title: "Bem-vindo à Enfermaria Digital",
        description: "Gestão completa da saúde da tripulação conforme MLC 2006 e NORMAM.",
        icon: <Stethoscope className="h-8 w-8 text-primary" />,
        tip: "Sistema integrado de prontuários, medicamentos e telemedicina"
      },
      {
        id: "medical-pharmacy",
        title: "Farmácia & Estoque",
        description: "Controle de medicamentos com alertas de validade, lotes e dispensação rastreada.",
        icon: <Pill className="h-8 w-8 text-info" />,
      },
      {
        id: "medical-records",
        title: "Prontuários Eletrônicos",
        description: "Histórico médico completo de cada tripulante com atestados e exames.",
        icon: <FileText className="h-8 w-8 text-success" />,
        tip: "Conformidade total com privacidade de dados médicos"
      },
      {
        id: "medical-telemedicine",
        title: "Telemedicina",
        description: "Consultas remotas com médicos em terra via videoconferência segura.",
        icon: <MessageSquare className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // TRACKING & TELEMETRY
  // ============================================
  "tracking-telemetry": {
    name: "Tracking & Telemetry",
    steps: [
      {
        id: "tracking-welcome",
        title: "Bem-vindo ao Tracking Center",
        description: "Monitore a posição e telemetria de toda a sua frota em tempo real.",
        icon: <Satellite className="h-8 w-8 text-primary" />,
        tip: "Integração com AIS, GPS e sensores IoT"
      },
      {
        id: "tracking-realtime",
        title: "Posição em Tempo Real",
        description: "Visualize todas as embarcações no mapa com dados de velocidade, rumo e ETA.",
        icon: <MapPin className="h-8 w-8 text-success" />,
      },
      {
        id: "tracking-alerts",
        title: "Sistema de Alertas",
        description: "Receba notificações de desvios de rota, áreas restritas e eventos críticos.",
        icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
        tip: "Alertas configuráveis por tipo e prioridade"
      },
      {
        id: "tracking-analytics",
        title: "Analytics Preditivo",
        description: "Análise de padrões de navegação, consumo e manutenção preditiva.",
        icon: <TrendingUp className="h-8 w-8 text-info" />,
      }
    ]
  },

  // ============================================
  // COMPLIANCE HUB
  // ============================================
  "compliance-hub": {
    name: "Centro de Compliance",
    steps: [
      {
        id: "compliance-welcome",
        title: "Bem-vindo ao Centro de Compliance",
        description: "Gerencie todas as certificações, auditorias e conformidades regulatórias.",
        icon: <Shield className="h-8 w-8 text-primary" />,
        tip: "10 agentes de IA monitoram conformidade 24/7"
      },
      {
        id: "compliance-certificates",
        title: "Gestão de Certificados",
        description: "Acompanhe validade de todos os certificados com alertas de renovação.",
        icon: <Award className="h-8 w-8 text-warning" />,
      },
      {
        id: "compliance-audits",
        title: "Auditorias & Inspeções",
        description: "Prepare-se para PSC, Flag State e auditorias internas com checklists inteligentes.",
        icon: <ClipboardList className="h-8 w-8 text-info" />,
        tip: "Histórico completo de NCs e CAPAs"
      },
      {
        id: "compliance-risks",
        title: "Matriz de Riscos",
        description: "Visualize riscos por categoria e priorize ações corretivas.",
        icon: <Target className="h-8 w-8 text-destructive" />,
      }
    ]
  },

  // ============================================
  // FINANCE COMMAND
  // ============================================
  "finance-command": {
    name: "Centro Financeiro",
    steps: [
      {
        id: "finance-welcome",
        title: "Bem-vindo ao Centro Financeiro",
        description: "Controle completo de custos, orçamentos e contabilidade de viagem.",
        icon: <DollarSign className="h-8 w-8 text-success" />,
        tip: "Dashboard executivo com KPIs financeiros em tempo real"
      },
      {
        id: "finance-voyage",
        title: "Voyage Accounting",
        description: "Contabilidade por viagem: receitas, despesas e resultado operacional.",
        icon: <Ship className="h-8 w-8 text-primary" />,
      },
      {
        id: "finance-budget",
        title: "Orçamento & Forecast",
        description: "Compare real vs. orçado e projete custos futuros com IA.",
        icon: <PieChart className="h-8 w-8 text-info" />,
        tip: "Alertas automáticos de desvios orçamentários"
      },
      {
        id: "finance-procurement",
        title: "Procurement",
        description: "Gestão de compras, cotações e aprovações com workflow automatizado.",
        icon: <ShoppingCart className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // PEOPLE HUB
  // ============================================
  "people-hub": {
    name: "People Hub",
    steps: [
      {
        id: "people-welcome",
        title: "Bem-vindo ao People Hub",
        description: "Gestão completa de RH marítimo: tripulação, treinamentos e bem-estar.",
        icon: <Users className="h-8 w-8 text-primary" />,
        tip: "Conformidade MLC 2006 e STCW integrada"
      },
      {
        id: "people-crew",
        title: "Gestão de Tripulação",
        description: "Cadastro, documentos, certificações e histórico de embarques.",
        icon: <Users className="h-8 w-8 text-info" />,
      },
      {
        id: "people-training",
        title: "Treinamento & Certificações",
        description: "Acompanhe cursos obrigatórios, STCW e treinamentos de segurança.",
        icon: <GraduationCap className="h-8 w-8 text-success" />,
        tip: "Alertas de vencimento de certificados"
      },
      {
        id: "people-wellness",
        title: "Bem-estar da Tripulação",
        description: "Monitore clima organizacional, pesquisas e indicadores de satisfação.",
        icon: <Heart className="h-8 w-8 text-destructive" />,
      }
    ]
  },

  // ============================================
  // MAINTENANCE COMMAND
  // ============================================
  "maintenance-command": {
    name: "Central de Manutenção",
    steps: [
      {
        id: "maintenance-welcome",
        title: "Bem-vindo à Central de Manutenção",
        description: "Gerencie manutenções preventivas, corretivas e preditivas de toda a frota.",
        icon: <Wrench className="h-8 w-8 text-primary" />,
        tip: "Sistema PMS integrado com previsões de IA"
      },
      {
        id: "maintenance-pms",
        title: "PMS - Manutenção Planejada",
        description: "Ordens de serviço, cronogramas e controle de horas de equipamentos.",
        icon: <Calendar className="h-8 w-8 text-info" />,
      },
      {
        id: "maintenance-predictive",
        title: "Manutenção Preditiva",
        description: "IA analisa padrões e prevê falhas antes que aconteçam.",
        icon: <Brain className="h-8 w-8 text-success" />,
        tip: "Reduza custos com manutenção baseada em condição"
      },
      {
        id: "maintenance-spare",
        title: "Spare Parts",
        description: "Gestão de estoque de peças com níveis mínimos e requisições.",
        icon: <Package className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // AI CONTROL TOWER
  // ============================================
  "ai-control-tower": {
    name: "AI Control Tower",
    steps: [
      {
        id: "ai-welcome",
        title: "Bem-vindo à AI Control Tower",
        description: "Central de comando da Inteligência Artificial do Nautilus One.",
        icon: <Brain className="h-8 w-8 text-primary" />,
        tip: "25+ agentes especializados trabalhando 24/7"
      },
      {
        id: "ai-agents",
        title: "Agentes Especializados",
        description: "Cada agente tem missão específica: compliance, manutenção, RH e mais.",
        icon: <Bot className="h-8 w-8 text-info" />,
      },
      {
        id: "ai-chat",
        title: "Chat & Assistente",
        description: "Converse naturalmente com a IA para obter insights e executar tarefas.",
        icon: <MessageSquare className="h-8 w-8 text-success" />,
        tip: "Suporte em português com contexto marítimo"
      },
      {
        id: "ai-workflows",
        title: "Automações & Workflows",
        description: "Configure regras e ações automáticas baseadas em eventos do sistema.",
        icon: <Zap className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // DOCUMENT CENTER
  // ============================================
  "document-center": {
    name: "Document Center",
    steps: [
      {
        id: "docs-welcome",
        title: "Bem-vindo ao Document Center",
        description: "Repositório central de todos os documentos operacionais e regulatórios.",
        icon: <FileText className="h-8 w-8 text-primary" />,
        tip: "Busca inteligente com OCR e IA"
      },
      {
        id: "docs-upload",
        title: "Upload & Categorização",
        description: "Faça upload de documentos e a IA categoriza automaticamente.",
        icon: <Upload className="h-8 w-8 text-info" />,
      },
      {
        id: "docs-templates",
        title: "Templates & Checklists",
        description: "Biblioteca de modelos prontos para uso: contratos, relatórios e mais.",
        icon: <ClipboardList className="h-8 w-8 text-success" />,
        tip: "Gere documentos automaticamente com dados do sistema"
      },
      {
        id: "docs-search",
        title: "Busca Avançada",
        description: "Encontre qualquer documento por conteúdo, data ou categoria.",
        icon: <Search className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // OPERATIONS COMMAND
  // ============================================
  "operations-command": {
    name: "Operations Command",
    steps: [
      {
        id: "ops-welcome",
        title: "Bem-vindo ao Operations Command",
        description: "Central de operações marítimas: frota, viagens e logística.",
        icon: <Anchor className="h-8 w-8 text-primary" />,
        tip: "Visão 360° de todas as operações"
      },
      {
        id: "ops-fleet",
        title: "Gestão de Frota",
        description: "Status de cada embarcação: posição, carga, tripulação e certificados.",
        icon: <Ship className="h-8 w-8 text-info" />,
      },
      {
        id: "ops-voyage",
        title: "Planejamento de Viagem",
        description: "Planeje rotas otimizadas considerando clima, combustível e custo.",
        icon: <MapPin className="h-8 w-8 text-success" />,
        tip: "Otimização com Weather Routing integrado"
      },
      {
        id: "ops-logistics",
        title: "Logística & Cargas",
        description: "Gerencie cargas, manifestos e operações portuárias.",
        icon: <Truck className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // SATCOM DASHBOARD
  // ============================================
  "satcom-dashboard": {
    name: "SATCOM Dashboard",
    steps: [
      {
        id: "satcom-welcome",
        title: "Bem-vindo ao SATCOM Dashboard",
        description: "Monitore todas as conexões satelitais da frota em tempo real.",
        icon: <Radio className="h-8 w-8 text-primary" />,
        tip: "Starlink, Iridium e VSAT integrados"
      },
      {
        id: "satcom-status",
        title: "Status das Conexões",
        description: "Veja latência, largura de banda e qualidade de cada link.",
        icon: <Activity className="h-8 w-8 text-success" />,
      },
      {
        id: "satcom-usage",
        title: "Consumo de Dados",
        description: "Acompanhe uso por embarcação e otimize custos de comunicação.",
        icon: <BarChart3 className="h-8 w-8 text-info" />,
        tip: "Alertas de consumo excessivo"
      },
      {
        id: "satcom-terminal",
        title: "Terminal de Comandos",
        description: "Execute diagnósticos e comandos remotos nos equipamentos.",
        icon: <Server className="h-8 w-8 text-warning" />,
      }
    ]
  },

  // ============================================
  // SYSTEM HUB
  // ============================================
  "system-hub": {
    name: "Sistema",
    steps: [
      {
        id: "system-welcome",
        title: "Bem-vindo às Configurações",
        description: "Configure o sistema, integrações e preferências do Nautilus One.",
        icon: <Settings className="h-8 w-8 text-primary" />,
        tip: "Personalize o sistema para sua operação"
      },
      {
        id: "system-integrations",
        title: "Integrações",
        description: "Conecte APIs externas: ERP, sistemas de terra e fornecedores.",
        icon: <Link className="h-8 w-8 text-info" />,
      },
      {
        id: "system-security",
        title: "Segurança & Acesso",
        description: "Gerencie usuários, permissões e políticas de segurança.",
        icon: <Lock className="h-8 w-8 text-destructive" />,
        tip: "Autenticação 2FA e logs de acesso"
      },
      {
        id: "system-iot",
        title: "IoT & Dispositivos",
        description: "Configure sensores, gateways e dispositivos conectados.",
        icon: <Cpu className="h-8 w-8 text-success" />,
      }
    ]
  },
};

/**
 * Helper para obter tour de um módulo
 */
export function getModuleTour(moduleKey: string) {
  return MODULE_TOURS[moduleKey] || null;
}

/**
 * Lista todos os módulos com tour configurado
 */
export function getModulesWithTours() {
  return Object.keys(MODULE_TOURS);
}
