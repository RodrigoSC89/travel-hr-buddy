/**
 * Hub Absorbed Modules Registry - v2.0 CONTEXTUAL
 * 
 * Módulos redistribuídos por tab-alvo dentro de cada hub.
 * Cada tab existente pode ter sub-módulos acessíveis via dropdown.
 * 
 * Nomes contextuais por hub:
 * - Command → "Centro Estratégico"
 * - Ops → "Ferramentas Operacionais" 
 * - Maintenance → "Toolkit de Engenharia"
 * - AI → "Laboratório IA"
 * - Tracking → "Sensores & IoT"
 * - Compliance → "Arsenal Regulatório"
 * - Workbench → "Centro de Recursos"
 */
import { lazy } from 'react';
import type { AbsorbedModule } from '@/components/ui/HubModulesBrowser';
import {
  Command, Shield, BarChart3, Globe, Gamepad2, HeadphonesIcon, CreditCard, Activity,
  Ship, Anchor, Map, DollarSign, Fuel, Cloud, Package, TrendingUp, ShoppingCart, Calendar, Zap, Building2,
  Wrench, Cpu, Search, Award, Boxes, ClipboardList,
  FileText, AlertTriangle, Lock, Scale, Leaf, Radiation, Eye, Radar, Flag, Gavel, BookOpen,
  Brain, Bot, MessageSquare, Workflow, Microscope, Layers, LineChart,
  Satellite, Radio, MapPin, Watch,
  Users, Heart, UserCheck, Plane, GraduationCap, Briefcase, Upload, Printer, Settings, Phone, Monitor
} from 'lucide-react';

// ============================================================
// COMMAND HUB — "Centro Estratégico"
// Módulos distribuídos por tab existente
// ============================================================
export const COMMAND_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  overview: [
    { id: 'business-roadmap', name: 'Business Roadmap', description: 'Roadmap estratégico e gap analysis', icon: Globe, component: lazy(() => import('@/pages/BusinessRoadmapPage')), category: 'Estratégia' },
    { id: 'world-class', name: 'World-Class Dashboard', description: 'Painel de liderança mundial', icon: Globe, component: lazy(() => import('@/pages/WorldClassDashboard')), category: 'Estratégia' },
    { id: 'world-leadership', name: 'World Leadership', description: 'Dashboard de liderança competitiva', icon: Globe, component: lazy(() => import('@/pages/WorldLeadershipDashboard')), category: 'Estratégia' },
    { id: 'quality-dashboard', name: 'Quality Dashboard', description: 'Dashboard de qualidade', icon: Award, component: lazy(() => import('@/pages/QualityDashboard')), category: 'Qualidade' },
  ],
  operations: [
    { id: 'infrastructure', name: 'Infraestrutura', description: 'Dashboard de escalabilidade e DR', icon: Activity, component: lazy(() => import('@/pages/InfrastructureDashboardPage')), category: 'Sistema' },
  ],
  soc: [
    { id: 'security-dashboard', name: 'Security Dashboard', description: 'Painel de segurança do sistema', icon: Shield, component: lazy(() => import('@/pages/SecurityDashboardPage')), category: 'Segurança' },
  ],
  performance: [
    { id: 'performance-monitor', name: 'Performance Monitor', description: 'Monitoramento de performance do sistema', icon: BarChart3, component: lazy(() => import('@/pages/PerformanceMonitorPage')), category: 'Sistema' },
  ],
  executive: [
    { id: 'gamification', name: 'Gamificação', description: 'Hub de gamificação e engajamento', icon: Gamepad2, component: lazy(() => import('@/pages/GamificationHub')), category: 'Engajamento' },
    { id: 'support-portal', name: 'Suporte / SLA', description: 'Portal de suporte e gestão de SLA', icon: HeadphonesIcon, component: lazy(() => import('@/pages/SupportPortalPage')), category: 'Suporte' },
    { id: 'subscription', name: 'Assinatura', description: 'Gestão de assinatura e planos', icon: CreditCard, component: lazy(() => import('@/pages/SubscriptionPage')), category: 'Sistema' },
    { id: 'consolidation-plan', name: 'Plano de Consolidação', description: 'Estudo de fusão de módulos', icon: Layers, component: lazy(() => import('@/pages/ModuleConsolidationPlan')), category: 'Estratégia' },
  ],
};

// Flat array for backward compat
export const COMMAND_ABSORBED: AbsorbedModule[] = Object.values(COMMAND_TAB_MODULES).flat();

// ============================================================
// OPS HUB — "Ferramentas Operacionais"
// ============================================================
export const OPS_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  contracts: [
    { id: 'commercial-ops', name: 'Commercial Operations', description: 'Hub de operações comerciais', icon: Building2, component: lazy(() => import('@/pages/CommercialOperationsHub')), category: 'Comercial' },
    { id: 'laytime-demurrage', name: 'Laytime & Demurrage', description: 'Calculadora BIMCO', icon: Scale, component: lazy(() => import('@/pages/LaytimeDemurragePage')), category: 'Comercial' },
    { id: 'freight-invoicing', name: 'Freight Invoicing', description: 'Faturamento de frete', icon: DollarSign, component: lazy(() => import('@/pages/FreightInvoicePage')), category: 'Comercial' },
    { id: 'voyage-estimate', name: 'Voyage Estimate', description: 'Estimativa TCE', icon: TrendingUp, component: lazy(() => import('@/pages/VoyageEstimatePage')), category: 'Comercial' },
    { id: 'tc-charter', name: 'TC Charter', description: 'Time Charter NYPE/SHELLTIME', icon: FileText, component: lazy(() => import('@/pages/TCCharterPage')), category: 'Comercial' },
    { id: 'chartering-hub', name: 'Chartering Hub', description: 'Hub de afretamento', icon: Ship, component: lazy(() => import('@/pages/CharteringHubPage')), category: 'Comercial' },
  ],
  voyage: [
    { id: 'voyage-accounting', name: 'Voyage Accounting', description: 'Contabilidade por viagem', icon: DollarSign, component: lazy(() => import('@/pages/VoyageAccountingPage')), category: 'Financeiro' },
    { id: 'voyage-pnl', name: 'Voyage P&L', description: 'Resultado por viagem', icon: TrendingUp, component: lazy(() => import('@/pages/VoyagePnLPage')), category: 'Financeiro' },
    { id: 'voyage-optimizer', name: 'Voyage Optimizer', description: 'Otimizador inteligente', icon: Zap, component: lazy(() => import('@/pages/SmartVoyageOptimizerPage')), category: 'Weather' },
  ],
  fleet: [
    { id: 'vessel-kpi', name: 'Vessel KPIs', description: 'KPIs por embarcação', icon: BarChart3, component: lazy(() => import('@/pages/VesselKPIPage')), category: 'Analytics' },
    { id: 'fleet-benchmarking', name: 'Fleet Benchmarking', description: 'Benchmarking da frota', icon: TrendingUp, component: lazy(() => import('@/pages/FleetBenchmarkingPage')), category: 'Analytics' },
    { id: 'bunker-operations', name: 'Bunker Operations', description: 'Operações de bunker', icon: Fuel, component: lazy(() => import('@/pages/BunkerOperationsPage')), category: 'Bunker' },
    { id: 'bunker-optimization', name: 'Bunker Optimization', description: 'Otimização de bunker', icon: Zap, component: lazy(() => import('@/pages/BunkerOptimizationEnginePage')), category: 'Bunker' },
    { id: 'fuel-management', name: 'Fuel Management', description: 'Gestão de combustível', icon: Fuel, component: lazy(() => import('@/pages/FuelManagementPage')), category: 'Bunker' },
  ],
  maritime: [
    { id: 'weather-maritime', name: 'Weather Maritime', description: 'Previsão meteorológica', icon: Cloud, component: lazy(() => import('@/pages/WeatherMaritime')), category: 'Weather' },
    { id: 'weather-routing', name: 'Weather Routing', description: 'Roteamento meteorológico', icon: Map, component: lazy(() => import('@/pages/WeatherRoutingPage')), category: 'Weather' },
    { id: 'port-api', name: 'Port Intelligence', description: 'Inteligência portuária', icon: Anchor, component: lazy(() => import('@/pages/PortAPI')), category: 'Operações' },
  ],
  logistics: [
    { id: 'stowage-plan', name: 'Stowage Plan', description: 'Plano de estiva', icon: Package, component: lazy(() => import('@/pages/StowagePlanPage')), category: 'Carga' },
    { id: 'advanced-cargo', name: 'Advanced Cargo', description: 'Planejamento avançado', icon: Package, component: lazy(() => import('@/pages/AdvancedCargoPage')), category: 'Carga' },
    { id: 'procurement', name: 'Procurement', description: 'Gestão de compras', icon: ShoppingCart, component: lazy(() => import('@/pages/ProcurementPage')), category: 'Procurement' },
  ],
  overview: [
    { id: 'budget-opex', name: 'Budget & OPEX', description: 'Orçamento operacional', icon: DollarSign, component: lazy(() => import('@/pages/BudgetOpexPage')), category: 'Financeiro' },
    { id: 'port-costs', name: 'Port Costs', description: 'Custos portuários', icon: Anchor, component: lazy(() => import('@/pages/PortCostPage')), category: 'Financeiro' },
    { id: 'pool-distribution', name: 'Pool Distribution', description: 'Distribuição de pool', icon: BarChart3, component: lazy(() => import('@/pages/PoolDistributionPage')), category: 'Financeiro' },
    { id: 'insurance-pi', name: 'Insurance P&I', description: 'Seguro marítimo P&I', icon: Shield, component: lazy(() => import('@/pages/InsurancePIPage')), category: 'Financeiro' },
    { id: 'pi-claims', name: 'P&I Claims', description: 'Gestão de sinistros', icon: FileText, component: lazy(() => import('@/pages/PIClaimsHubPage')), category: 'Financeiro' },
    { id: 'company-financials', name: 'Company Financials', description: 'Finanças da empresa', icon: Building2, component: lazy(() => import('@/pages/CompanyFinancialPage')), category: 'Financeiro' },
    { id: 'finance-ai', name: 'Finance AI', description: 'IA para finanças', icon: Brain, component: lazy(() => import('@/pages/FinanceProcurementAIPage')), category: 'Financeiro' },
    { id: 'noon-report-analytics', name: 'Noon Report Analytics', description: 'Analytics de noon reports', icon: BarChart3, component: lazy(() => import('@/pages/NoonReportAnalyticsPage')), category: 'Analytics' },
    { id: 'analytics-command', name: 'Analytics Command', description: 'Central de analytics', icon: LineChart, component: lazy(() => import('@/pages/AnalyticsCommandCenter')), category: 'Analytics' },
    { id: 'operational-calendar', name: 'Calendário Operacional', description: 'Calendário de operações', icon: Calendar, component: lazy(() => import('@/pages/CalendarView')), category: 'Operações' },
    { id: 'energy-efficiency', name: 'Energy Efficiency', description: 'Eficiência energética', icon: Zap, component: lazy(() => import('@/pages/EnergyEfficiencyPage')), category: 'ESG' },
    { id: 'crew-scheduler', name: 'Crew Scheduler', description: 'Agendador de tripulação', icon: Calendar, component: lazy(() => import('@/pages/CrewSchedulerPage')), category: 'Operações' },
  ],
};

export const OPS_ABSORBED: AbsorbedModule[] = Object.values(OPS_TAB_MODULES).flat();

// ============================================================
// MAINTENANCE HUB — "Toolkit de Engenharia"
// ============================================================
export const MAINTENANCE_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  equipment: [
    { id: 'spare-parts', name: 'Spare Parts', description: 'Gestão de peças', icon: Boxes, component: lazy(() => import('@/pages/SparePartsPage')), category: 'Inventário' },
    { id: 'impa-spare-parts', name: 'IMPA Spare Parts', description: 'Catálogo IMPA', icon: Boxes, component: lazy(() => import('@/pages/IMPASparePartsHubPage')), category: 'Inventário' },
    { id: 'spare-parts-marketplace', name: 'Marketplace', description: 'Marketplace de peças', icon: ShoppingCart, component: lazy(() => import('@/pages/SparePartsMarketplacePage')), category: 'Inventário' },
    { id: 'warranty-claims', name: 'Warranty Claims', description: 'Gestão de garantias', icon: Shield, component: lazy(() => import('@/pages/WarrantyClaimsPage')), category: 'Garantias' },
  ],
  planning: [
    { id: 'running-hours', name: 'Running Hours', description: 'Controle de horímetro', icon: Activity, component: lazy(() => import('@/pages/RunningHoursPage')), category: 'PMS' },
    { id: 'pms-hub', name: 'PMS Hub', description: 'Hub de manutenção preventiva', icon: Wrench, component: lazy(() => import('@/pages/PMSHubPage')), category: 'PMS' },
  ],
  surveys: [
    { id: 'cap-assessment', name: 'CAP Assessment', description: 'Avaliação de capacidade', icon: ClipboardList, component: lazy(() => import('@/pages/CAPAssessmentPage')), category: 'Assessments' },
  ],
};

export const MAINTENANCE_ABSORBED: AbsorbedModule[] = Object.values(MAINTENANCE_TAB_MODULES).flat();

// ============================================================
// COMPLIANCE HUB — "Arsenal Regulatório"
// ============================================================
export const COMPLIANCE_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  hub: [
    { id: 'qhse-incidents', name: 'QHSE Incidents', description: 'Incidentes QHSE', icon: AlertTriangle, component: lazy(() => import('@/pages/QHSEIncidentPage')), category: 'QHSE' },
    { id: 'flag-state', name: 'Flag State', description: 'Flag State e IMO FAL', icon: Flag, component: lazy(() => import('@/pages/FlagStateCompliancePage')), category: 'Regulatório' },
    { id: 'regulatory-radar', name: 'Regulatory Radar', description: 'Radar regulatório', icon: Radar, component: lazy(() => import('@/pages/RegulatoryRadarPage')), category: 'Regulatório' },
    { id: 'stcw-mlc', name: 'STCW/MLC', description: 'Compliance STCW e MLC', icon: Award, component: lazy(() => import('@/pages/STCWMLCCompliance')), category: 'Normas' },
    { id: 'lvs-petrobras', name: 'LVS Petrobras', description: 'LVS de aceitação', icon: Award, component: lazy(() => import('@/pages/LVSAceitacaoPetrobras')), category: 'Petrobras' },
  ],
  certificates: [
    { id: 'blockchain-compliance', name: 'Blockchain Audit', description: 'Auditoria em blockchain', icon: Lock, component: lazy(() => import('@/pages/advanced/BlockchainCertificatesPage')), category: 'Tecnologia' },
    { id: 'evidence-pack', name: 'Evidence Pack', description: 'Pacotes de evidências', icon: FileText, component: lazy(() => import('@/pages/SmartEvidencePackPage')), category: 'Auditorias' },
  ],
  'risk-matrix': [
    { id: 'permit-to-work', name: 'Permit to Work', description: 'Permissão de trabalho', icon: ClipboardList, component: lazy(() => import('@/pages/PermitToWorkPage')), category: 'Segurança' },
    { id: 'ship-vetting', name: 'Ship Vetting', description: 'Vetting de embarcações', icon: Search, component: lazy(() => import('@/pages/ShipVettingPage')), category: 'Vetting' },
  ],
  'ncs-capas': [
    { id: 'psc-history', name: 'PSC History', description: 'Histórico PSC', icon: Eye, component: lazy(() => import('@/pages/PSCHistoryPage')), category: 'Inspeções' },
  ],
  scorecard: [
    { id: 'eu-ets', name: 'EU ETS', description: 'Comércio de emissões UE', icon: Leaf, component: lazy(() => import('@/pages/EUETSHubPage')), category: 'ESG' },
    { id: 'esg-emissions', name: 'ESG Emissions', description: 'Emissões CII/EEXI', icon: Leaf, component: lazy(() => import('@/pages/ESGEmissionsPremium')), category: 'ESG' },
    { id: 'sustainability-score', name: 'Sustainability Score', description: 'Score de sustentabilidade', icon: Leaf, component: lazy(() => import('@/pages/SustainabilityScorePage')), category: 'ESG' },
  ],
  security: [
    { id: 'security-audit', name: 'Security Audit', description: 'Auditoria de segurança', icon: Lock, component: lazy(() => import('@/pages/SecurityAuditCenter')), category: 'Segurança' },
    { id: 'security-scanner', name: 'Security Scanner', description: 'Scanner de segurança', icon: Search, component: lazy(() => import('@/pages/SecurityScanner')), category: 'Segurança' },
    { id: 'computer-vision', name: 'Computer Vision', description: 'Inspeção por visão computacional', icon: Microscope, component: lazy(() => import('@/pages/ComputerVisionInspectorPage')), category: 'Tecnologia' },
  ],
  'ai-hub': [
    { id: 'audit-ai-chat', name: 'Audit AI Chat', description: 'Chat IA para auditorias', icon: MessageSquare, component: lazy(() => import('@/pages/AuditAIChatPage')), category: 'IA' },
  ],
  'audit-agents': [
    { id: 'ocimf-assessment', name: 'OCIMF Assessment', description: 'Avaliação OCIMF', icon: Award, component: lazy(() => import('@/pages/enterprise/OCIMFAssessmentPage')), category: 'Enterprise' },
    { id: 'tmsa-analytics', name: 'TMSA Analytics', description: 'Analytics TMSA', icon: BarChart3, component: lazy(() => import('@/pages/enterprise/TMSAAnalyticsPage')), category: 'Enterprise' },
    { id: 'fatigue-risk', name: 'Fatigue Risk', description: 'Risco de fadiga', icon: Activity, component: lazy(() => import('@/pages/enterprise/FatigueRiskPage')), category: 'Enterprise' },
    { id: 'mlc-hours', name: 'MLC Work Hours', description: 'Horas MLC', icon: Activity, component: lazy(() => import('@/pages/enterprise/MLCWorkHoursPage')), category: 'Enterprise' },
    { id: 'compliance-predictor', name: 'Compliance Predictor', description: 'Preditor de compliance', icon: Brain, component: lazy(() => import('@/pages/enterprise/CompliancePredictorPage')), category: 'Enterprise' },
    { id: 'nc-prediction', name: 'NC Prediction', description: 'Predição de NCs', icon: AlertTriangle, component: lazy(() => import('@/pages/enterprise/NCPredictionPage')), category: 'Enterprise' },
    { id: 'risk-clauses', name: 'Risk Clauses', description: 'Cláusulas de risco', icon: Gavel, component: lazy(() => import('@/pages/enterprise/RiskClausesPage')), category: 'Enterprise' },
    { id: 'contract-analysis', name: 'Contract Analysis', description: 'Análise de contratos IA', icon: FileText, component: lazy(() => import('@/pages/enterprise/ContractAnalysisPage')), category: 'Enterprise' },
  ],
};

export const COMPLIANCE_ABSORBED: AbsorbedModule[] = Object.values(COMPLIANCE_TAB_MODULES).flat();

// ============================================================
// AI HUB — "Laboratório IA"
// ============================================================
export const AI_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  hub: [
    { id: 'ai-audit', name: 'AI Audit Trail', description: 'Trilha de auditoria', icon: FileText, component: lazy(() => import('@/pages/AIAudit')), category: 'Governança' },
    { id: 'optimization', name: 'Optimization', description: 'Dashboard de otimização', icon: TrendingUp, component: lazy(() => import('@/pages/Optimization')), category: 'Analytics' },
    { id: 'unified-optimization', name: 'Unified Optimization', description: 'Otimização unificada', icon: Zap, component: lazy(() => import('@/pages/UnifiedOptimizationPage')), category: 'Analytics' },
  ],
  agents: [
    { id: 'agent-orchestration', name: 'Agent Orchestration', description: 'Orquestração de agentes', icon: Bot, component: lazy(() => import('@/pages/AgentOrchestrationPage')), category: 'Agentes' },
    { id: 'ai-enterprise-engines', name: 'Enterprise Engines', description: 'Motores enterprise', icon: Cpu, component: lazy(() => import('@/pages/AIEnterpriseEnginesHub')), category: 'Enterprise' },
  ],
  'chat-voice': [
    { id: 'voice-copilot', name: 'Voice Copilot', description: 'Copiloto de voz', icon: MessageSquare, component: lazy(() => import('@/pages/VoiceCopilotPage')), category: 'Voz' },
  ],
  modules: [
    { id: 'voyage-logistics-ai', name: 'Voyage & Logistics AI', description: 'IA para viagens', icon: Ship, component: lazy(() => import('@/pages/ai/VoyageLogisticsAIPage')), category: 'AI Modules' },
    { id: 'safety-incident-ai', name: 'Safety & Incident AI', description: 'IA para segurança', icon: Shield, component: lazy(() => import('@/pages/ai/SafetyIncidentAIPage')), category: 'AI Modules' },
    { id: 'inventory-spares-ai', name: 'Inventory & Spares AI', description: 'IA para inventário', icon: Boxes, component: lazy(() => import('@/pages/ai/InventorySparesAIPage')), category: 'AI Modules' },
    { id: 'compliance-ai', name: 'Compliance AI', description: 'IA para compliance', icon: Shield, component: lazy(() => import('@/pages/ai/ComplianceAIPage')), category: 'AI Modules' },
    { id: 'environmental-ai', name: 'Environmental AI', description: 'IA ambiental', icon: Leaf, component: lazy(() => import('@/pages/ai/EnvironmentalAIPage')), category: 'AI Modules' },
    { id: 'quality-ai', name: 'Quality Management AI', description: 'IA de qualidade', icon: Award, component: lazy(() => import('@/pages/ai/QualityManagementAIPage')), category: 'AI Modules' },
    { id: 'contract-legal-ai', name: 'Contract & Legal AI', description: 'IA jurídica', icon: Gavel, component: lazy(() => import('@/pages/ai/ContractLegalAIPage')), category: 'AI Modules' },
    { id: 'insurance-claims-ai', name: 'Insurance Claims AI', description: 'IA para sinistros', icon: Shield, component: lazy(() => import('@/pages/ai/InsuranceClaimsAIPage')), category: 'AI Modules' },
    { id: 'crewing-payroll-ai', name: 'Crewing & Payroll AI', description: 'IA para tripulação', icon: Users, component: lazy(() => import('@/pages/ai/CrewingPayrollAIPage')), category: 'AI Modules' },
    { id: 'reporting-analytics-ai', name: 'Reporting AI', description: 'IA para relatórios', icon: BarChart3, component: lazy(() => import('@/pages/ai/ReportingAnalyticsAIPage')), category: 'AI Modules' },
    { id: 'mobile-offline-ai', name: 'Mobile & Offline AI', description: 'IA offline mobile', icon: Monitor, component: lazy(() => import('@/pages/ai/MobileOfflineAIPage')), category: 'AI Modules' },
  ],
};

export const AI_ABSORBED: AbsorbedModule[] = Object.values(AI_TAB_MODULES).flat();

// ============================================================
// TRACKING HUB — "Sensores & IoT"
// ============================================================
export const TRACKING_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  overview: [
    { id: 'iot-wearables', name: 'IoT Wearables', description: 'Dashboard de wearables', icon: Watch, component: lazy(() => import('@/pages/IoTWearablesDashboardPage')), category: 'IoT' },
  ],
  alerts: [
    { id: 'crew-fatigue-predictor', name: 'Fatigue Predictor', description: 'Preditor de fadiga', icon: Activity, component: lazy(() => import('@/pages/CrewFatiguePredictorPage')), category: 'Crew Safety' },
  ],
};

export const TRACKING_ABSORBED: AbsorbedModule[] = Object.values(TRACKING_TAB_MODULES).flat();

// ============================================================
// WORKBENCH HUB — "Centro de Recursos"
// ============================================================
export const WORKBENCH_TAB_MODULES: Record<string, AbsorbedModule[]> = {
  people: [
    { id: 'hr-dashboard', name: 'HR Dashboard', description: 'Dashboard de RH', icon: Users, component: lazy(() => import('@/pages/HRDashboardPage')), category: 'RH' },
    { id: 'people-analytics', name: 'People Analytics', description: 'Analytics de pessoas', icon: BarChart3, component: lazy(() => import('@/pages/PeopleAnalyticsPage')), category: 'RH' },
    { id: 'recruitment', name: 'Recrutamento', description: 'Sistema de recrutamento', icon: Users, component: lazy(() => import('@/pages/RecruitmentPage')), category: 'RH' },
    { id: 'employee-portal', name: 'Portal Colaborador', description: 'Portal self-service', icon: UserCheck, component: lazy(() => import('@/pages/EmployeePortalPage')), category: 'RH' },
    { id: 'hr-chatbot', name: 'Assistente RH', description: 'Chatbot de RH com IA', icon: MessageSquare, component: lazy(() => import('@/pages/HRChatbotPage')), category: 'RH' },
    { id: 'hr-ocr', name: 'HR Document OCR', description: 'OCR de documentos', icon: Upload, component: lazy(() => import('@/pages/HRDocumentOCRPage')), category: 'RH' },
    { id: 'hr-turnover', name: 'Turnover Prediction', description: 'Predição de turnover', icon: TrendingUp, component: lazy(() => import('@/pages/HRTurnoverPredictionPage')), category: 'RH' },
    { id: 'crew-wellness', name: 'Crew Wellness', description: 'Bem-estar da tripulação', icon: Heart, component: lazy(() => import('@/pages/CrewWellnessPage')), category: 'Tripulação' },
    { id: 'crew-rotation', name: 'Crew Rotation', description: 'Rotação de tripulação', icon: Users, component: lazy(() => import('@/pages/CrewRotationPage')), category: 'Tripulação' },
    { id: 'crew-planning', name: 'Crew Planning', description: 'Planejamento', icon: Calendar, component: lazy(() => import('@/pages/CrewPlanningPage')), category: 'Tripulação' },
    { id: 'crew-appraisal', name: 'Crew Appraisal', description: 'Avaliação 360°', icon: Award, component: lazy(() => import('@/pages/CrewAppraisalPage')), category: 'Tripulação' },
    { id: 'crew-competency', name: 'Crew Competency', description: 'Gestão de competências', icon: GraduationCap, component: lazy(() => import('@/pages/CrewCompetencyPage')), category: 'Tripulação' },
    { id: 'crew-change', name: 'Crew Change', description: 'Troca de tripulação', icon: Users, component: lazy(() => import('@/pages/CrewChangePage')), category: 'Tripulação' },
    { id: 'crew-document-vault', name: 'Document Vault', description: 'Cofre de documentos', icon: Lock, component: lazy(() => import('@/pages/CrewDocumentVaultPage')), category: 'Tripulação' },
    { id: 'crew-marketplace', name: 'Crew Marketplace', description: 'Marketplace global', icon: Globe, component: lazy(() => import('@/pages/CrewMarketplacePage')), category: 'Tripulação' },
    { id: 'crew-matching', name: 'AI Crew Matching', description: 'Matching com IA', icon: Brain, component: lazy(() => import('@/pages/enterprise/CrewMatchingPage')), category: 'Tripulação' },
    { id: 'medical-infirmary', name: 'Enfermaria Digital', description: 'Enfermaria a bordo', icon: Heart, component: lazy(() => import('@/modules/medical-infirmary')), category: 'Saúde' },
  ],
  finance: [
    { id: 'payroll', name: 'Folha de Pagamento', description: 'Gestão de folha', icon: DollarSign, component: lazy(() => import('@/pages/Payroll')), category: 'RH' },
    { id: 'crew-payroll', name: 'Crew Payroll', description: 'Folha marítima ITF', icon: DollarSign, component: lazy(() => import('@/pages/CrewPayrollPage')), category: 'RH' },
    { id: 'time-tracking', name: 'Controle de Ponto', description: 'Time tracking', icon: Activity, component: lazy(() => import('@/pages/TimeTracking')), category: 'RH' },
  ],
  travel: [
    { id: 'crew-travel', name: 'Crew Travel', description: 'Viagens de tripulação', icon: Plane, component: lazy(() => import('@/pages/CrewTravelPage')), category: 'Tripulação' },
  ],
  docs: [
    { id: 'templates', name: 'Templates', description: 'Gestão de templates', icon: FileText, component: lazy(() => import('@/pages/Templates')), category: 'Documentos' },
    { id: 'document-workflow', name: 'Document Workflow', description: 'Workflow de documentos', icon: Workflow, component: lazy(() => import('@/pages/DocumentWorkflow')), category: 'Documentos' },
    { id: 'export-center', name: 'Export Center', description: 'Central de exportação', icon: Printer, component: lazy(() => import('@/pages/ExportCenterPage')), category: 'Documentos' },
    { id: 'reports-command', name: 'Reports Command', description: 'Central de relatórios', icon: BarChart3, component: lazy(() => import('@/pages/ReportsCommandCenter')), category: 'Relatórios' },
    { id: 'premium-reports', name: 'Premium Reports', description: 'Relatórios premium', icon: LineChart, component: lazy(() => import('@/pages/PremiumReportsPage')), category: 'Relatórios' },
    { id: 'ocr-center', name: 'OCR Center', description: 'OCR enterprise', icon: Search, component: lazy(() => import('@/pages/enterprise/OCRCenterPage')), category: 'Documentos' },
    { id: 'forms-builder', name: 'Forms Builder', description: 'Construtor de formulários', icon: FileText, component: lazy(() => import('@/pages/enterprise/FormsBuilderPage')), category: 'Documentos' },
    { id: 'checklists-builder', name: 'Checklists Builder', description: 'Construtor de checklists', icon: ClipboardList, component: lazy(() => import('@/pages/enterprise/ChecklistsBuilderPage')), category: 'Documentos' },
  ],
  system: [
    { id: 'nautilus-academy', name: 'Nautilus Academy', description: 'Plataforma de treinamento', icon: GraduationCap, component: lazy(() => import('@/pages/AITraining')), category: 'Treinamento' },
    { id: 'solas-isps-training', name: 'SOLAS/ISPS Training', description: 'Treinamento SOLAS', icon: Shield, component: lazy(() => import('@/pages/SOLASISPSTrainingPage')), category: 'Treinamento' },
    { id: 'integrations-center', name: 'Integrations', description: 'Central de integrações', icon: Zap, component: lazy(() => import('@/pages/IntegrationsCenter')), category: 'Sistema' },
    { id: 'api-center', name: 'API Center', description: 'Centro de APIs', icon: Cpu, component: lazy(() => import('@/pages/APICenter')), category: 'Sistema' },
    { id: 'api-monitor', name: 'API Monitor', description: 'Monitoramento APIs', icon: Activity, component: lazy(() => import('@/pages/APIMonitor')), category: 'Sistema' },
    { id: 'api-portal', name: 'API Dev Portal', description: 'Portal de desenvolvimento', icon: BookOpen, component: lazy(() => import('@/pages/APIDeveloperPortalPage')), category: 'Sistema' },
    { id: 'collaboration', name: 'Colaboração', description: 'Ferramentas de colaboração', icon: Users, component: lazy(() => import('@/pages/Collaboration')), category: 'Sistema' },
    { id: 'whatsapp-bot', name: 'WhatsApp Bot', description: 'Bot de WhatsApp', icon: Phone, component: lazy(() => import('@/pages/WhatsAppBotPage')), category: 'Comunicação' },
    { id: 'users', name: 'Gestão de Usuários', description: 'Gerenciamento de usuários', icon: Users, component: lazy(() => import('@/pages/Users')), category: 'Admin' },
    { id: 'client-portal', name: 'Portal do Cliente', description: 'Portal para clientes', icon: Globe, component: lazy(() => import('@/pages/client-portal')), category: 'Portal' },
  ],
};

export const WORKBENCH_ABSORBED: AbsorbedModule[] = Object.values(WORKBENCH_TAB_MODULES).flat();
