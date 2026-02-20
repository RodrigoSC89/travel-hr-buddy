/**
 * Hub Absorbed Modules Registry
 * Maps every standalone page to its target hub as a lazy-loaded component.
 * This is the SINGLE SOURCE OF TRUTH for the consolidation.
 * 
 * ZERO funcionalidades perdidas — cada componente original é preservado.
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
// COMMAND HUB — Strategic, Executive, System Health
// ============================================================
export const COMMAND_ABSORBED: AbsorbedModule[] = [
  { id: 'business-roadmap', name: 'Business Roadmap', description: 'Roadmap estratégico e gap analysis', icon: Globe, component: lazy(() => import('@/pages/BusinessRoadmapPage')), category: 'Estratégia' },
  { id: 'infrastructure', name: 'Infraestrutura', description: 'Dashboard de escalabilidade e DR', icon: Activity, component: lazy(() => import('@/pages/InfrastructureDashboardPage')), category: 'Sistema' },
  { id: 'performance-monitor', name: 'Performance Monitor', description: 'Monitoramento de performance do sistema', icon: BarChart3, component: lazy(() => import('@/pages/PerformanceMonitorPage')), category: 'Sistema' },
  { id: 'world-class', name: 'World-Class Dashboard', description: 'Painel de liderança mundial', icon: Globe, component: lazy(() => import('@/pages/WorldClassDashboard')), category: 'Estratégia' },
  { id: 'world-leadership', name: 'World Leadership', description: 'Dashboard de liderança competitiva', icon: Globe, component: lazy(() => import('@/pages/WorldLeadershipDashboard')), category: 'Estratégia' },
  { id: 'security-dashboard', name: 'Security Dashboard', description: 'Painel de segurança do sistema', icon: Shield, component: lazy(() => import('@/pages/SecurityDashboardPage')), category: 'Segurança' },
  { id: 'gamification', name: 'Gamificação', description: 'Hub de gamificação e engajamento', icon: Gamepad2, component: lazy(() => import('@/pages/GamificationHub')), category: 'Engajamento' },
  { id: 'support-portal', name: 'Suporte / SLA', description: 'Portal de suporte e gestão de SLA', icon: HeadphonesIcon, component: lazy(() => import('@/pages/SupportPortalPage')), category: 'Suporte' },
  { id: 'subscription', name: 'Assinatura', description: 'Gestão de assinatura e planos', icon: CreditCard, component: lazy(() => import('@/pages/SubscriptionPage')), category: 'Sistema' },
  { id: 'quality-dashboard', name: 'Quality Dashboard', description: 'Dashboard de qualidade', icon: Award, component: lazy(() => import('@/pages/QualityDashboard')), category: 'Qualidade' },
  { id: 'consolidation-plan', name: 'Plano de Consolidação', description: 'Estudo de fusão de módulos', icon: Layers, component: lazy(() => import('@/pages/ModuleConsolidationPlan')), category: 'Estratégia' },
];

// ============================================================
// OPS HUB — Commercial, Voyage, Fleet, Finance, Weather, Cargo
// ============================================================
export const OPS_ABSORBED: AbsorbedModule[] = [
  // Commercial
  { id: 'commercial-ops', name: 'Commercial Operations', description: 'Hub de operações comerciais', icon: Building2, component: lazy(() => import('@/pages/CommercialOperationsHub')), category: 'Comercial' },
  { id: 'laytime-demurrage', name: 'Laytime & Demurrage', description: 'Calculadora BIMCO de laytime/demurrage', icon: Scale, component: lazy(() => import('@/pages/LaytimeDemurragePage')), category: 'Comercial' },
  { id: 'freight-invoicing', name: 'Freight Invoicing', description: 'Faturamento de frete marítimo', icon: DollarSign, component: lazy(() => import('@/pages/FreightInvoicePage')), category: 'Comercial' },
  { id: 'voyage-estimate', name: 'Voyage Estimate', description: 'Estimativa de viagem com cenários TCE', icon: TrendingUp, component: lazy(() => import('@/pages/VoyageEstimatePage')), category: 'Comercial' },
  { id: 'tc-charter', name: 'TC Charter', description: 'Gestão de Time Charter (NYPE/SHELLTIME)', icon: FileText, component: lazy(() => import('@/pages/TCCharterPage')), category: 'Comercial' },
  { id: 'chartering-hub', name: 'Chartering Hub', description: 'Hub completo de afretamento', icon: Ship, component: lazy(() => import('@/pages/CharteringHubPage')), category: 'Comercial' },
  // Finance
  { id: 'voyage-accounting', name: 'Voyage Accounting', description: 'Contabilidade por viagem', icon: DollarSign, component: lazy(() => import('@/pages/VoyageAccountingPage')), category: 'Financeiro' },
  { id: 'voyage-pnl', name: 'Voyage P&L', description: 'Demonstração de resultado por viagem', icon: TrendingUp, component: lazy(() => import('@/pages/VoyagePnLPage')), category: 'Financeiro' },
  { id: 'budget-opex', name: 'Budget & OPEX', description: 'Orçamento operacional', icon: DollarSign, component: lazy(() => import('@/pages/BudgetOpexPage')), category: 'Financeiro' },
  { id: 'port-costs', name: 'Port Costs', description: 'Custos portuários', icon: Anchor, component: lazy(() => import('@/pages/PortCostPage')), category: 'Financeiro' },
  { id: 'pool-distribution', name: 'Pool Distribution', description: 'Distribuição de pool', icon: BarChart3, component: lazy(() => import('@/pages/PoolDistributionPage')), category: 'Financeiro' },
  { id: 'insurance-pi', name: 'Insurance P&I', description: 'Seguro marítimo P&I', icon: Shield, component: lazy(() => import('@/pages/InsurancePIPage')), category: 'Financeiro' },
  { id: 'pi-claims', name: 'P&I Claims', description: 'Gestão de sinistros P&I', icon: FileText, component: lazy(() => import('@/pages/PIClaimsHubPage')), category: 'Financeiro' },
  { id: 'company-financials', name: 'Company Financials', description: 'Finanças da empresa', icon: Building2, component: lazy(() => import('@/pages/CompanyFinancialPage')), category: 'Financeiro' },
  { id: 'finance-ai', name: 'Finance AI', description: 'IA para finanças e procurement', icon: Brain, component: lazy(() => import('@/pages/FinanceProcurementAIPage')), category: 'Financeiro' },
  // Bunker & Fuel
  { id: 'fuel-management', name: 'Fuel Management', description: 'Gestão de combustível e ROB', icon: Fuel, component: lazy(() => import('@/pages/FuelManagementPage')), category: 'Bunker' },
  { id: 'bunker-operations', name: 'Bunker Operations', description: 'Operações de bunker', icon: Fuel, component: lazy(() => import('@/pages/BunkerOperationsPage')), category: 'Bunker' },
  { id: 'bunker-optimization', name: 'Bunker Optimization', description: 'Motor de otimização de bunker', icon: Zap, component: lazy(() => import('@/pages/BunkerOptimizationEnginePage')), category: 'Bunker' },
  // Weather & Routing
  { id: 'weather-maritime', name: 'Weather Maritime', description: 'Previsão meteorológica marítima', icon: Cloud, component: lazy(() => import('@/pages/WeatherMaritime')), category: 'Weather' },
  { id: 'weather-routing', name: 'Weather Routing', description: 'Roteamento meteorológico otimizado', icon: Map, component: lazy(() => import('@/pages/WeatherRoutingPage')), category: 'Weather' },
  { id: 'voyage-optimizer', name: 'Voyage Optimizer', description: 'Otimizador inteligente de viagens', icon: Zap, component: lazy(() => import('@/pages/SmartVoyageOptimizerPage')), category: 'Weather' },
  // Cargo
  { id: 'stowage-plan', name: 'Stowage Plan', description: 'Plano de estiva e estabilidade', icon: Package, component: lazy(() => import('@/pages/StowagePlanPage')), category: 'Carga' },
  { id: 'advanced-cargo', name: 'Advanced Cargo', description: 'Planejamento avançado de carga', icon: Package, component: lazy(() => import('@/pages/AdvancedCargoPage')), category: 'Carga' },
  // KPIs & Analytics
  { id: 'vessel-kpi', name: 'Vessel KPIs', description: 'KPIs por embarcação', icon: BarChart3, component: lazy(() => import('@/pages/VesselKPIPage')), category: 'Analytics' },
  { id: 'fleet-benchmarking', name: 'Fleet Benchmarking', description: 'Benchmarking da frota', icon: TrendingUp, component: lazy(() => import('@/pages/FleetBenchmarkingPage')), category: 'Analytics' },
  { id: 'noon-report-analytics', name: 'Noon Report Analytics', description: 'Analytics de noon reports', icon: BarChart3, component: lazy(() => import('@/pages/NoonReportAnalyticsPage')), category: 'Analytics' },
  { id: 'analytics-command', name: 'Analytics Command', description: 'Central de analytics', icon: LineChart, component: lazy(() => import('@/pages/AnalyticsCommandCenter')), category: 'Analytics' },
  // Others
  { id: 'procurement', name: 'Procurement', description: 'Gestão de compras', icon: ShoppingCart, component: lazy(() => import('@/pages/ProcurementPage')), category: 'Procurement' },
  { id: 'operational-calendar', name: 'Calendário Operacional', description: 'Calendário de operações', icon: Calendar, component: lazy(() => import('@/pages/CalendarView')), category: 'Operações' },
  { id: 'port-api', name: 'Port Intelligence', description: 'Inteligência portuária', icon: Anchor, component: lazy(() => import('@/pages/PortAPI')), category: 'Operações' },
  { id: 'energy-efficiency', name: 'Energy Efficiency', description: 'Eficiência energética', icon: Zap, component: lazy(() => import('@/pages/EnergyEfficiencyPage')), category: 'ESG' },
  { id: 'crew-scheduler', name: 'Crew Scheduler', description: 'Agendador de tripulação', icon: Calendar, component: lazy(() => import('@/pages/CrewSchedulerPage')), category: 'Operações' },
];

// ============================================================
// MAINTENANCE HUB — PMS, Spares, Surveys, Digital Twin
// ============================================================
export const MAINTENANCE_ABSORBED: AbsorbedModule[] = [
  { id: 'spare-parts', name: 'Spare Parts', description: 'Gestão de peças sobressalentes', icon: Boxes, component: lazy(() => import('@/pages/SparePartsPage')), category: 'Inventário' },
  { id: 'impa-spare-parts', name: 'IMPA Spare Parts', description: 'Catálogo IMPA de peças', icon: Boxes, component: lazy(() => import('@/pages/IMPASparePartsHubPage')), category: 'Inventário' },
  { id: 'spare-parts-marketplace', name: 'Spare Parts Marketplace', description: 'Marketplace de peças', icon: ShoppingCart, component: lazy(() => import('@/pages/SparePartsMarketplacePage')), category: 'Inventário' },
  { id: 'warranty-claims', name: 'Warranty Claims', description: 'Gestão de garantias', icon: Shield, component: lazy(() => import('@/pages/WarrantyClaimsPage')), category: 'Garantias' },
  { id: 'cap-assessment', name: 'CAP Assessment', description: 'Avaliação de capacidade', icon: ClipboardList, component: lazy(() => import('@/pages/CAPAssessmentPage')), category: 'Assessments' },
  { id: 'running-hours', name: 'Running Hours', description: 'Controle de horímetro', icon: Activity, component: lazy(() => import('@/pages/RunningHoursPage')), category: 'PMS' },
  { id: 'pms-hub', name: 'PMS Hub', description: 'Hub de manutenção preventiva', icon: Wrench, component: lazy(() => import('@/pages/PMSHubPage')), category: 'PMS' },
];

// ============================================================
// COMPLIANCE HUB — Regulatory, ESG, Security
// ============================================================
export const COMPLIANCE_ABSORBED: AbsorbedModule[] = [
  // Compliance Frameworks (not already in auditStandards map)
  { id: 'qhse-incidents', name: 'QHSE Incidents', description: 'Gestão de incidentes QHSE', icon: AlertTriangle, component: lazy(() => import('@/pages/QHSEIncidentPage')), category: 'QHSE' },
  { id: 'permit-to-work', name: 'Permit to Work', description: 'Sistema de permissão de trabalho', icon: ClipboardList, component: lazy(() => import('@/pages/PermitToWorkPage')), category: 'Segurança' },
  { id: 'blockchain-compliance', name: 'Blockchain Audit', description: 'Auditoria em blockchain', icon: Lock, component: lazy(() => import('@/pages/advanced/BlockchainCertificatesPage')), category: 'Tecnologia' },
  { id: 'evidence-pack', name: 'Evidence Pack', description: 'Pacotes de evidências para auditorias', icon: FileText, component: lazy(() => import('@/pages/SmartEvidencePackPage')), category: 'Auditorias' },
  { id: 'flag-state', name: 'Flag State Compliance', description: 'Aprovação de Flag State e IMO FAL', icon: Flag, component: lazy(() => import('@/pages/FlagStateCompliancePage')), category: 'Regulatório' },
  { id: 'regulatory-radar', name: 'Regulatory Radar', description: 'Radar regulatório em tempo real', icon: Radar, component: lazy(() => import('@/pages/RegulatoryRadarPage')), category: 'Regulatório' },
  { id: 'stcw-mlc', name: 'STCW/MLC Compliance', description: 'Compliance STCW e MLC 2006', icon: Award, component: lazy(() => import('@/pages/STCWMLCCompliance')), category: 'Normas' },
  { id: 'ship-vetting', name: 'Ship Vetting', description: 'Vetting de embarcações', icon: Search, component: lazy(() => import('@/pages/ShipVettingPage')), category: 'Vetting' },
  { id: 'psc-history', name: 'PSC History', description: 'Histórico de inspeções PSC', icon: Eye, component: lazy(() => import('@/pages/PSCHistoryPage')), category: 'Inspeções' },
  // ESG
  { id: 'eu-ets', name: 'EU ETS', description: 'Sistema de comércio de emissões da UE', icon: Leaf, component: lazy(() => import('@/pages/EUETSHubPage')), category: 'ESG' },
  { id: 'esg-emissions', name: 'ESG Emissions', description: 'Emissões e CII/EEXI', icon: Leaf, component: lazy(() => import('@/pages/ESGEmissionsPremium')), category: 'ESG' },
  { id: 'sustainability-score', name: 'Sustainability Score', description: 'Score de sustentabilidade', icon: Leaf, component: lazy(() => import('@/pages/SustainabilityScorePage')), category: 'ESG' },
  // Security
  { id: 'security-audit', name: 'Security Audit', description: 'Centro de auditoria de segurança', icon: Lock, component: lazy(() => import('@/pages/SecurityAuditCenter')), category: 'Segurança' },
  { id: 'security-scanner', name: 'Security Scanner', description: 'Scanner de segurança', icon: Search, component: lazy(() => import('@/pages/SecurityScanner')), category: 'Segurança' },
  { id: 'audit-ai-chat', name: 'Audit AI Chat', description: 'Chat de IA para auditorias', icon: MessageSquare, component: lazy(() => import('@/pages/AuditAIChatPage')), category: 'IA' },
  // Enterprise
  { id: 'ocimf-assessment', name: 'OCIMF Assessment', description: 'Avaliação OCIMF', icon: Award, component: lazy(() => import('@/pages/enterprise/OCIMFAssessmentPage')), category: 'Enterprise' },
  { id: 'tmsa-analytics', name: 'TMSA Analytics', description: 'Analytics TMSA', icon: BarChart3, component: lazy(() => import('@/pages/enterprise/TMSAAnalyticsPage')), category: 'Enterprise' },
  { id: 'fatigue-risk', name: 'Fatigue Risk', description: 'Gestão de risco de fadiga', icon: Activity, component: lazy(() => import('@/pages/enterprise/FatigueRiskPage')), category: 'Enterprise' },
  { id: 'mlc-hours', name: 'MLC Work Hours', description: 'Horas de trabalho MLC', icon: Activity, component: lazy(() => import('@/pages/enterprise/MLCWorkHoursPage')), category: 'Enterprise' },
  { id: 'compliance-predictor', name: 'Compliance Predictor', description: 'Preditor de compliance', icon: Brain, component: lazy(() => import('@/pages/enterprise/CompliancePredictorPage')), category: 'Enterprise' },
  { id: 'nc-prediction', name: 'NC Prediction', description: 'Predição de não-conformidades', icon: AlertTriangle, component: lazy(() => import('@/pages/enterprise/NCPredictionPage')), category: 'Enterprise' },
  { id: 'risk-clauses', name: 'Risk Clauses', description: 'Análise de cláusulas de risco', icon: Gavel, component: lazy(() => import('@/pages/enterprise/RiskClausesPage')), category: 'Enterprise' },
  { id: 'contract-analysis', name: 'Contract Analysis', description: 'Análise de contratos com IA', icon: FileText, component: lazy(() => import('@/pages/enterprise/ContractAnalysisPage')), category: 'Enterprise' },
  { id: 'computer-vision', name: 'Computer Vision Inspector', description: 'Inspeção por visão computacional', icon: Microscope, component: lazy(() => import('@/pages/ComputerVisionInspectorPage')), category: 'Tecnologia' },
  { id: 'lvs-petrobras', name: 'LVS Aceitação Petrobras', description: 'LVS de aceitação Petrobras', icon: Award, component: lazy(() => import('@/pages/LVSAceitacaoPetrobras')), category: 'Petrobras' },
];

// ============================================================
// AI HUB — Already well consolidated, just missing specialized modules
// ============================================================
export const AI_ABSORBED: AbsorbedModule[] = [
  { id: 'ai-audit', name: 'AI Audit Trail', description: 'Trilha de auditoria de IA', icon: FileText, component: lazy(() => import('@/pages/AIAudit')), category: 'Governança' },
  { id: 'agent-orchestration', name: 'Agent Orchestration', description: 'Orquestração de agentes', icon: Bot, component: lazy(() => import('@/pages/AgentOrchestrationPage')), category: 'Agentes' },
  { id: 'voice-copilot', name: 'Voice Copilot', description: 'Copiloto de voz avançado', icon: MessageSquare, component: lazy(() => import('@/pages/VoiceCopilotPage')), category: 'Voz' },
  { id: 'ai-enterprise-engines', name: 'Enterprise Engines', description: 'Motores de IA enterprise', icon: Cpu, component: lazy(() => import('@/pages/AIEnterpriseEnginesHub')), category: 'Enterprise' },
  { id: 'optimization', name: 'Optimization', description: 'Dashboard de otimização', icon: TrendingUp, component: lazy(() => import('@/pages/Optimization')), category: 'Analytics' },
  { id: 'unified-optimization', name: 'Unified Optimization', description: 'Otimização unificada', icon: Zap, component: lazy(() => import('@/pages/UnifiedOptimizationPage')), category: 'Analytics' },
  // Specialized AI modules
  { id: 'voyage-logistics-ai', name: 'Voyage & Logistics AI', description: 'IA para viagens e logística', icon: Ship, component: lazy(() => import('@/pages/ai/VoyageLogisticsAIPage')), category: 'AI Modules' },
  { id: 'safety-incident-ai', name: 'Safety & Incident AI', description: 'IA para segurança e incidentes', icon: Shield, component: lazy(() => import('@/pages/ai/SafetyIncidentAIPage')), category: 'AI Modules' },
  { id: 'inventory-spares-ai', name: 'Inventory & Spares AI', description: 'IA para inventário e peças', icon: Boxes, component: lazy(() => import('@/pages/ai/InventorySparesAIPage')), category: 'AI Modules' },
  { id: 'compliance-ai', name: 'Compliance AI', description: 'IA para compliance', icon: Shield, component: lazy(() => import('@/pages/ai/ComplianceAIPage')), category: 'AI Modules' },
  { id: 'environmental-ai', name: 'Environmental AI', description: 'IA ambiental', icon: Leaf, component: lazy(() => import('@/pages/ai/EnvironmentalAIPage')), category: 'AI Modules' },
  { id: 'quality-ai', name: 'Quality Management AI', description: 'IA para gestão de qualidade', icon: Award, component: lazy(() => import('@/pages/ai/QualityManagementAIPage')), category: 'AI Modules' },
  { id: 'contract-legal-ai', name: 'Contract & Legal AI', description: 'IA jurídica e contratos', icon: Gavel, component: lazy(() => import('@/pages/ai/ContractLegalAIPage')), category: 'AI Modules' },
  { id: 'insurance-claims-ai', name: 'Insurance Claims AI', description: 'IA para sinistros', icon: Shield, component: lazy(() => import('@/pages/ai/InsuranceClaimsAIPage')), category: 'AI Modules' },
  { id: 'crewing-payroll-ai', name: 'Crewing & Payroll AI', description: 'IA para tripulação e folha', icon: Users, component: lazy(() => import('@/pages/ai/CrewingPayrollAIPage')), category: 'AI Modules' },
  { id: 'reporting-analytics-ai', name: 'Reporting & Analytics AI', description: 'IA para relatórios', icon: BarChart3, component: lazy(() => import('@/pages/ai/ReportingAnalyticsAIPage')), category: 'AI Modules' },
  { id: 'mobile-offline-ai', name: 'Mobile & Offline AI', description: 'IA offline para mobile', icon: Monitor, component: lazy(() => import('@/pages/ai/MobileOfflineAIPage')), category: 'AI Modules' },
];

// ============================================================
// TRACKING HUB — Telemetry, IoT, Weather
// ============================================================
export const TRACKING_ABSORBED: AbsorbedModule[] = [
  { id: 'iot-wearables', name: 'IoT Wearables', description: 'Dashboard de wearables IoT', icon: Watch, component: lazy(() => import('@/pages/IoTWearablesDashboardPage')), category: 'IoT' },
  { id: 'crew-fatigue-predictor', name: 'Crew Fatigue Predictor', description: 'Preditor de fadiga da tripulação', icon: Activity, component: lazy(() => import('@/pages/CrewFatiguePredictorPage')), category: 'Crew Safety' },
];

// ============================================================
// WORKBENCH HUB — People, HR, Docs, Reports, Training, System
// ============================================================
export const WORKBENCH_ABSORBED: AbsorbedModule[] = [
  // HR
  { id: 'hr-dashboard', name: 'HR Dashboard', description: 'Dashboard principal de RH', icon: Users, component: lazy(() => import('@/pages/HRDashboardPage')), category: 'RH' },
  { id: 'people-analytics', name: 'People Analytics', description: 'Analytics de pessoas', icon: BarChart3, component: lazy(() => import('@/pages/PeopleAnalyticsPage')), category: 'RH' },
  { id: 'payroll', name: 'Folha de Pagamento', description: 'Gestão de folha de pagamento', icon: DollarSign, component: lazy(() => import('@/pages/Payroll')), category: 'RH' },
  { id: 'crew-payroll', name: 'Crew Payroll', description: 'Folha de pagamento marítima', icon: DollarSign, component: lazy(() => import('@/pages/CrewPayrollPage')), category: 'RH' },
  { id: 'time-tracking', name: 'Controle de Ponto', description: 'Time tracking e controle de ponto', icon: Activity, component: lazy(() => import('@/pages/TimeTracking')), category: 'RH' },
  { id: 'employee-portal', name: 'Portal do Colaborador', description: 'Portal self-service do colaborador', icon: UserCheck, component: lazy(() => import('@/pages/EmployeePortalPage')), category: 'RH' },
  { id: 'hr-chatbot', name: 'Assistente RH', description: 'Chatbot de RH com IA', icon: MessageSquare, component: lazy(() => import('@/pages/HRChatbotPage')), category: 'RH' },
  { id: 'hr-ocr', name: 'HR Document OCR', description: 'OCR de documentos de RH', icon: Upload, component: lazy(() => import('@/pages/HRDocumentOCRPage')), category: 'RH' },
  { id: 'hr-turnover', name: 'Turnover Prediction', description: 'Predição de turnover', icon: TrendingUp, component: lazy(() => import('@/pages/HRTurnoverPredictionPage')), category: 'RH' },
  { id: 'recruitment', name: 'Recrutamento', description: 'Sistema de recrutamento', icon: Users, component: lazy(() => import('@/pages/RecruitmentPage')), category: 'RH' },
  // Crew
  { id: 'crew-wellness', name: 'Crew Wellness', description: 'Bem-estar da tripulação', icon: Heart, component: lazy(() => import('@/pages/CrewWellnessPage')), category: 'Tripulação' },
  { id: 'crew-rotation', name: 'Crew Rotation', description: 'Rotação de tripulação', icon: Users, component: lazy(() => import('@/pages/CrewRotationPage')), category: 'Tripulação' },
  { id: 'crew-planning', name: 'Crew Planning', description: 'Planejamento de tripulação', icon: Calendar, component: lazy(() => import('@/pages/CrewPlanningPage')), category: 'Tripulação' },
  { id: 'crew-appraisal', name: 'Crew Appraisal', description: 'Avaliação de tripulação', icon: Award, component: lazy(() => import('@/pages/CrewAppraisalPage')), category: 'Tripulação' },
  { id: 'crew-competency', name: 'Crew Competency', description: 'Gestão de competências', icon: GraduationCap, component: lazy(() => import('@/pages/CrewCompetencyPage')), category: 'Tripulação' },
  { id: 'crew-travel', name: 'Crew Travel', description: 'Viagens de tripulação', icon: Plane, component: lazy(() => import('@/pages/CrewTravelPage')), category: 'Tripulação' },
  { id: 'crew-change', name: 'Crew Change', description: 'Troca de tripulação', icon: Users, component: lazy(() => import('@/pages/CrewChangePage')), category: 'Tripulação' },
  { id: 'crew-document-vault', name: 'Crew Document Vault', description: 'Cofre de documentos', icon: Lock, component: lazy(() => import('@/pages/CrewDocumentVaultPage')), category: 'Tripulação' },
  { id: 'crew-marketplace', name: 'Crew Marketplace', description: 'Marketplace de tripulação', icon: Globe, component: lazy(() => import('@/pages/CrewMarketplacePage')), category: 'Tripulação' },
  { id: 'crew-matching', name: 'AI Crew Matching', description: 'Matching de tripulação com IA', icon: Brain, component: lazy(() => import('@/pages/enterprise/CrewMatchingPage')), category: 'Tripulação' },
  // Medical
  { id: 'medical-infirmary', name: 'Enfermaria Digital', description: 'Enfermaria digital a bordo', icon: Heart, component: lazy(() => import('@/modules/medical-infirmary')), category: 'Saúde' },
  // Documents & Reports
  { id: 'templates', name: 'Templates', description: 'Gestão de templates', icon: FileText, component: lazy(() => import('@/pages/Templates')), category: 'Documentos' },
  { id: 'document-workflow', name: 'Document Workflow', description: 'Workflow de documentos', icon: Workflow, component: lazy(() => import('@/pages/DocumentWorkflow')), category: 'Documentos' },
  { id: 'export-center', name: 'Export Center', description: 'Central de exportação', icon: Printer, component: lazy(() => import('@/pages/ExportCenterPage')), category: 'Documentos' },
  { id: 'reports-command', name: 'Reports Command', description: 'Central de relatórios', icon: BarChart3, component: lazy(() => import('@/pages/ReportsCommandCenter')), category: 'Relatórios' },
  { id: 'premium-reports', name: 'Premium Reports', description: 'Relatórios premium', icon: LineChart, component: lazy(() => import('@/pages/PremiumReportsPage')), category: 'Relatórios' },
  { id: 'ocr-center', name: 'OCR Center', description: 'Centro de OCR enterprise', icon: Search, component: lazy(() => import('@/pages/enterprise/OCRCenterPage')), category: 'Documentos' },
  { id: 'forms-builder', name: 'Forms Builder', description: 'Construtor de formulários', icon: FileText, component: lazy(() => import('@/pages/enterprise/FormsBuilderPage')), category: 'Documentos' },
  { id: 'checklists-builder', name: 'Checklists Builder', description: 'Construtor de checklists', icon: ClipboardList, component: lazy(() => import('@/pages/enterprise/ChecklistsBuilderPage')), category: 'Documentos' },
  // Training
  { id: 'nautilus-academy', name: 'Nautilus Academy', description: 'Plataforma de treinamento', icon: GraduationCap, component: lazy(() => import('@/pages/AITraining')), category: 'Treinamento' },
  { id: 'solas-isps-training', name: 'SOLAS/ISPS Training', description: 'Treinamento SOLAS e ISPS', icon: Shield, component: lazy(() => import('@/pages/SOLASISPSTrainingPage')), category: 'Treinamento' },
  // Integrations
  { id: 'integrations-center', name: 'Integrations Center', description: 'Central de integrações', icon: Zap, component: lazy(() => import('@/pages/IntegrationsCenter')), category: 'Sistema' },
  { id: 'api-center', name: 'API Center', description: 'Centro de APIs', icon: Cpu, component: lazy(() => import('@/pages/APICenter')), category: 'Sistema' },
  { id: 'api-monitor', name: 'API Monitor', description: 'Monitoramento de APIs', icon: Activity, component: lazy(() => import('@/pages/APIMonitor')), category: 'Sistema' },
  { id: 'api-portal', name: 'API Developer Portal', description: 'Portal de desenvolvimento', icon: BookOpen, component: lazy(() => import('@/pages/APIDeveloperPortalPage')), category: 'Sistema' },
  { id: 'collaboration', name: 'Colaboração', description: 'Ferramentas de colaboração', icon: Users, component: lazy(() => import('@/pages/Collaboration')), category: 'Sistema' },
  { id: 'whatsapp-bot', name: 'WhatsApp Bot', description: 'Bot de WhatsApp', icon: Phone, component: lazy(() => import('@/pages/WhatsAppBotPage')), category: 'Comunicação' },
  { id: 'users', name: 'Gestão de Usuários', description: 'Gerenciamento de usuários', icon: Users, component: lazy(() => import('@/pages/Users')), category: 'Admin' },
  { id: 'client-portal', name: 'Portal do Cliente', description: 'Portal para clientes', icon: Globe, component: lazy(() => import('@/pages/client-portal')), category: 'Portal' },
];
