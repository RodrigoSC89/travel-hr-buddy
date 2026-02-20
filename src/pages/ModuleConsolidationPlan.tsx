/**
 * Module Consolidation Plan - Estudo de Viabilidade
 * Mapa completo de fusão de ~150 páginas standalone → 7 Mega-Hubs
 * ZERO perda de funcionalidade
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Command, Ship, Wrench, Brain, MapPin, Shield, Briefcase,
  ChevronRight, CheckCircle, AlertTriangle, ArrowRight, Layers,
  Anchor, Users, FileText, BarChart3, Settings, Globe
} from "lucide-react";

// =====================================================
// CONSOLIDATION MAP: Every standalone page → target hub + tab
// =====================================================

interface ModuleMapping {
  currentRoute: string;
  currentPage: string;
  targetHub: string;
  targetTab: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "standalone" | "redirect" | "already-in-hub";
  notes?: string;
}

const CONSOLIDATION_MAP: ModuleMapping[] = [
  // ============================================================
  // → COMMAND HUB (/command) — Strategic, Executive, System Health
  // ============================================================
  { currentRoute: "/noc", currentPage: "NOC", targetHub: "Command", targetTab: "NOC / System Health", priority: "high", status: "standalone" },
  { currentRoute: "/health-monitor", currentPage: "HealthMonitor", targetHub: "Command", targetTab: "NOC / System Health", priority: "high", status: "standalone" },
  { currentRoute: "/business-roadmap", currentPage: "BusinessRoadmapPage", targetHub: "Command", targetTab: "Roadmap Estratégico", priority: "medium", status: "standalone" },
  { currentRoute: "/infrastructure", currentPage: "InfrastructureDashboardPage", targetHub: "Command", targetTab: "Infraestrutura", priority: "medium", status: "standalone" },
  { currentRoute: "/performance-monitor", currentPage: "PerformanceMonitorPage", targetHub: "Command", targetTab: "Performance", priority: "medium", status: "standalone" },
  { currentRoute: "/world-class", currentPage: "WorldClassDashboard", targetHub: "Command", targetTab: "World-Class Overview", priority: "medium", status: "standalone" },
  { currentRoute: "/world-leadership", currentPage: "WorldLeadershipDashboard", targetHub: "Command", targetTab: "World-Class Overview", priority: "low", status: "standalone" },
  { currentRoute: "/security-dashboard", currentPage: "SecurityDashboardPage", targetHub: "Command", targetTab: "Security Overview", priority: "high", status: "standalone" },
  { currentRoute: "/gamification", currentPage: "GamificationHub", targetHub: "Command", targetTab: "Gamificação", priority: "low", status: "standalone" },
  { currentRoute: "/support-portal", currentPage: "SupportPortalPage", targetHub: "Command", targetTab: "Suporte / SLA", priority: "medium", status: "standalone" },
  { currentRoute: "/subscription", currentPage: "SubscriptionPage", targetHub: "Command", targetTab: "Assinatura", priority: "low", status: "standalone" },
  { currentRoute: "/quality-dashboard", currentPage: "QualityDashboard", targetHub: "Command", targetTab: "Qualidade", priority: "medium", status: "standalone" },

  // ============================================================
  // → OPS HUB (/ops) — Commercial, Voyage, Fleet, Finance
  // ============================================================
  // Maritime/Fleet Operations
  { currentRoute: "/maritime-command", currentPage: "MaritimeCommandCenter", targetHub: "Ops", targetTab: "Maritime Command", priority: "critical", status: "standalone", notes: "Módulo core - transformar em aba principal" },
  { currentRoute: "/fleet-command", currentPage: "FleetCommandCenter", targetHub: "Ops", targetTab: "Fleet Management", priority: "critical", status: "standalone" },
  { currentRoute: "/voyage-command", currentPage: "VoyageCommandCenter", targetHub: "Ops", targetTab: "Voyages", priority: "critical", status: "standalone" },
  { currentRoute: "/operations-command", currentPage: "OperationsCommandCenter", targetHub: "Ops", targetTab: "Operations Center", priority: "high", status: "standalone" },
  // Commercial
  { currentRoute: "/commercial-ops", currentPage: "CommercialOperationsHub", targetHub: "Ops", targetTab: "Commercial", priority: "high", status: "standalone" },
  { currentRoute: "/charter-party", currentPage: "CharterPartyPage", targetHub: "Ops", targetTab: "Commercial > Charter Party", priority: "high", status: "standalone" },
  { currentRoute: "/laytime-demurrage", currentPage: "LaytimeDemurragePage", targetHub: "Ops", targetTab: "Commercial > Laytime/Demurrage", priority: "high", status: "standalone" },
  { currentRoute: "/freight-invoicing", currentPage: "FreightInvoicePage", targetHub: "Ops", targetTab: "Commercial > Freight", priority: "high", status: "standalone" },
  { currentRoute: "/voyage-estimate", currentPage: "VoyageEstimatePage", targetHub: "Ops", targetTab: "Commercial > Voyage Estimate", priority: "high", status: "standalone" },
  { currentRoute: "/tc-charter", currentPage: "TCCharterPage", targetHub: "Ops", targetTab: "Commercial > TC Charter", priority: "high", status: "standalone" },
  { currentRoute: "/chartering-hub", currentPage: "CharteringHubPage", targetHub: "Ops", targetTab: "Commercial > Chartering", priority: "high", status: "standalone" },
  // Voyage Finance
  { currentRoute: "/voyage-accounting", currentPage: "VoyageAccountingPage", targetHub: "Ops", targetTab: "Finance > Voyage Accounting", priority: "high", status: "standalone" },
  { currentRoute: "/voyage-pnl", currentPage: "VoyagePnLPage", targetHub: "Ops", targetTab: "Finance > P&L", priority: "high", status: "standalone" },
  { currentRoute: "/budget-opex", currentPage: "BudgetOpexPage", targetHub: "Ops", targetTab: "Finance > Budget/OPEX", priority: "high", status: "standalone" },
  { currentRoute: "/port-costs", currentPage: "PortCostPage", targetHub: "Ops", targetTab: "Finance > Port Costs", priority: "medium", status: "standalone" },
  { currentRoute: "/pool-distribution", currentPage: "PoolDistributionPage", targetHub: "Ops", targetTab: "Finance > Pool Distribution", priority: "medium", status: "standalone" },
  { currentRoute: "/pool-distribution-hub", currentPage: "PoolDistributionHubPage", targetHub: "Ops", targetTab: "Finance > Pool Distribution", priority: "low", status: "standalone", notes: "Fundir com PoolDistributionPage" },
  { currentRoute: "/insurance-pi", currentPage: "InsurancePIPage", targetHub: "Ops", targetTab: "Finance > Insurance P&I", priority: "medium", status: "standalone" },
  { currentRoute: "/pi-claims", currentPage: "PIClaimsHubPage", targetHub: "Ops", targetTab: "Finance > P&I Claims", priority: "medium", status: "standalone" },
  { currentRoute: "/company-financials", currentPage: "CompanyFinancialPage", targetHub: "Ops", targetTab: "Finance > Company Financials", priority: "medium", status: "standalone" },
  { currentRoute: "/finance-ai", currentPage: "FinanceProcurementAIPage", targetHub: "Ops", targetTab: "Finance > AI Finance", priority: "medium", status: "standalone" },
  // Bunker/Fuel
  { currentRoute: "/fuel-management", currentPage: "FuelManagementPage", targetHub: "Ops", targetTab: "Bunker & Fuel", priority: "high", status: "standalone" },
  { currentRoute: "/bunker-operations", currentPage: "BunkerOperationsPage", targetHub: "Ops", targetTab: "Bunker & Fuel", priority: "high", status: "standalone" },
  { currentRoute: "/bunker-optimization-engine", currentPage: "BunkerOptimizationEnginePage", targetHub: "Ops", targetTab: "Bunker & Fuel", priority: "medium", status: "standalone" },
  // Weather/Routing
  { currentRoute: "/weather-maritime", currentPage: "WeatherMaritime", targetHub: "Ops", targetTab: "Weather & Routing", priority: "high", status: "standalone" },
  { currentRoute: "/weather-routing", currentPage: "WeatherRoutingPage", targetHub: "Ops", targetTab: "Weather & Routing", priority: "high", status: "standalone" },
  { currentRoute: "/voyage-optimizer", currentPage: "SmartVoyageOptimizerPage", targetHub: "Ops", targetTab: "Weather & Routing", priority: "medium", status: "standalone" },
  // Cargo
  { currentRoute: "/stowage-plan", currentPage: "StowagePlanPage", targetHub: "Ops", targetTab: "Cargo Planning", priority: "medium", status: "standalone" },
  { currentRoute: "/advanced-cargo", currentPage: "AdvancedCargoPage", targetHub: "Ops", targetTab: "Cargo Planning", priority: "medium", status: "standalone" },
  // KPIs/Analytics
  { currentRoute: "/vessel-kpi", currentPage: "VesselKPIPage", targetHub: "Ops", targetTab: "KPIs & Analytics", priority: "medium", status: "standalone" },
  { currentRoute: "/fleet-benchmarking", currentPage: "FleetBenchmarkingPage", targetHub: "Ops", targetTab: "KPIs & Analytics", priority: "medium", status: "standalone" },
  { currentRoute: "/noon-report-analytics", currentPage: "NoonReportAnalyticsPage", targetHub: "Ops", targetTab: "KPIs & Analytics", priority: "medium", status: "standalone" },
  { currentRoute: "/analytics-command", currentPage: "AnalyticsCommandCenter", targetHub: "Ops", targetTab: "KPIs & Analytics", priority: "medium", status: "standalone" },
  // Procurement
  { currentRoute: "/procurement", currentPage: "ProcurementPage", targetHub: "Ops", targetTab: "Procurement", priority: "high", status: "standalone" },
  // Misc Ops
  { currentRoute: "/bridge-link", currentPage: "BridgeLink", targetHub: "Ops", targetTab: "Bridge Link", priority: "medium", status: "standalone" },
  { currentRoute: "/energy-efficiency", currentPage: "EnergyEfficiencyPage", targetHub: "Ops", targetTab: "Energy / ESG", priority: "medium", status: "standalone" },
  { currentRoute: "/port-api", currentPage: "PortAPI", targetHub: "Ops", targetTab: "Port Intelligence", priority: "low", status: "standalone" },
  { currentRoute: "/operational-calendar", currentPage: "CalendarView", targetHub: "Ops", targetTab: "Calendário Ops", priority: "medium", status: "standalone" },

  // ============================================================
  // → MAINTENANCE HUB (/maintenance) — PMS, Spares, Surveys, DT
  // ============================================================
  { currentRoute: "/maintenance-command", currentPage: "MaintenanceCommandCenter", targetHub: "Maintenance", targetTab: "Maintenance Center", priority: "critical", status: "standalone" },
  { currentRoute: "/predictive-maintenance", currentPage: "PredictiveMaintenancePage", targetHub: "Maintenance", targetTab: "Predictive AI", priority: "high", status: "standalone" },
  { currentRoute: "/running-hours", currentPage: "RunningHoursPage", targetHub: "Maintenance", targetTab: "Running Hours / PMS", priority: "high", status: "standalone" },
  { currentRoute: "/pms-hub", currentPage: "PMSHubPage", targetHub: "Maintenance", targetTab: "Running Hours / PMS", priority: "high", status: "standalone" },
  { currentRoute: "/spare-parts", currentPage: "SparePartsPage", targetHub: "Maintenance", targetTab: "Spare Parts", priority: "high", status: "standalone" },
  { currentRoute: "/impa-spare-parts", currentPage: "IMPASparePartsHubPage", targetHub: "Maintenance", targetTab: "Spare Parts", priority: "high", status: "standalone" },
  { currentRoute: "/spare-parts-marketplace", currentPage: "SparePartsMarketplacePage", targetHub: "Maintenance", targetTab: "Spare Parts Marketplace", priority: "medium", status: "standalone" },
  { currentRoute: "/warranty-claims", currentPage: "WarrantyClaimsPage", targetHub: "Maintenance", targetTab: "Warranty / Claims", priority: "medium", status: "standalone" },
  { currentRoute: "/cap-assessment", currentPage: "CAPAssessmentPage", targetHub: "Maintenance", targetTab: "CAP Assessment", priority: "medium", status: "standalone" },
  { currentRoute: "/class-surveys", currentPage: "ClassSurveyPage", targetHub: "Maintenance", targetTab: "Class Surveys", priority: "high", status: "standalone" },
  { currentRoute: "/digital-twin", currentPage: "DigitalTwinPage", targetHub: "Maintenance", targetTab: "Digital Twin 3D", priority: "medium", status: "standalone" },

  // ============================================================
  // → COMPLIANCE HUB (/compliance) — All regulatory frameworks
  // ============================================================
  { currentRoute: "/peo-dp", currentPage: "PEODP", targetHub: "Compliance", targetTab: "PEO-DP (Petrobras)", priority: "critical", status: "standalone" },
  { currentRoute: "/lvs-aceitacao-petrobras", currentPage: "LVSAceitacaoPetrobras", targetHub: "Compliance", targetTab: "LVS Aceitação", priority: "high", status: "standalone" },
  { currentRoute: "/sgso", currentPage: "SGSO", targetHub: "Compliance", targetTab: "SGSO (ANP)", priority: "critical", status: "standalone" },
  { currentRoute: "/sgso/report", currentPage: "SGSOReportPage", targetHub: "Compliance", targetTab: "SGSO (ANP)", priority: "high", status: "standalone" },
  { currentRoute: "/pre-ovid", currentPage: "PreOVIDInspection", targetHub: "Compliance", targetTab: "OVID / OCIMF", priority: "high", status: "standalone" },
  { currentRoute: "/pre-sire", currentPage: "PreSIREInspection", targetHub: "Compliance", targetTab: "SIRE 2.0", priority: "high", status: "standalone" },
  { currentRoute: "/sire2-vetting", currentPage: "SIRE2HubPage", targetHub: "Compliance", targetTab: "SIRE 2.0", priority: "high", status: "standalone" },
  { currentRoute: "/ship-vetting", currentPage: "ShipVettingPage", targetHub: "Compliance", targetTab: "SIRE 2.0", priority: "medium", status: "standalone" },
  { currentRoute: "/mlc-inspection", currentPage: "MLCInspection", targetHub: "Compliance", targetTab: "MLC 2006", priority: "high", status: "standalone" },
  { currentRoute: "/stcw-mlc", currentPage: "STCWMLCCompliance", targetHub: "Compliance", targetTab: "MLC 2006 / STCW", priority: "high", status: "standalone" },
  { currentRoute: "/psc-package", currentPage: "PSCPackage", targetHub: "Compliance", targetTab: "PSC Readiness", priority: "high", status: "standalone" },
  { currentRoute: "/psc-history", currentPage: "PSCHistoryPage", targetHub: "Compliance", targetTab: "PSC Readiness", priority: "medium", status: "standalone" },
  { currentRoute: "/solas-inspection", currentPage: "SOLASInspection", targetHub: "Compliance", targetTab: "SOLAS / ISPS", priority: "high", status: "standalone" },
  { currentRoute: "/ism-code", currentPage: "ISMCodeHubPage", targetHub: "Compliance", targetTab: "ISM Code", priority: "high", status: "standalone" },
  { currentRoute: "/tmsa-assessment", currentPage: "TMSAAssessment", targetHub: "Compliance", targetTab: "TMSA", priority: "high", status: "standalone" },
  { currentRoute: "/regulatory-radar", currentPage: "RegulatoryRadarPage", targetHub: "Compliance", targetTab: "Regulatory Radar", priority: "medium", status: "standalone" },
  { currentRoute: "/compliance-roadmap", currentPage: "ComplianceRoadmapPage", targetHub: "Compliance", targetTab: "Roadmap / Executive", priority: "medium", status: "standalone" },
  { currentRoute: "/executive-compliance", currentPage: "ExecutiveCompliancePage", targetHub: "Compliance", targetTab: "Roadmap / Executive", priority: "medium", status: "standalone" },
  { currentRoute: "/flag-state", currentPage: "FlagStateCompliancePage", targetHub: "Compliance", targetTab: "Flag State / IMO FAL", priority: "medium", status: "standalone" },
  { currentRoute: "/qhse-incidents", currentPage: "QHSEIncidentPage", targetHub: "Compliance", targetTab: "QHSE Incidents", priority: "high", status: "standalone" },
  { currentRoute: "/permit-to-work", currentPage: "PermitToWorkPage", targetHub: "Compliance", targetTab: "Permit to Work", priority: "high", status: "standalone" },
  { currentRoute: "/blockchain-compliance", currentPage: "BlockchainCompliancePage", targetHub: "Compliance", targetTab: "Blockchain Audit", priority: "low", status: "standalone" },
  { currentRoute: "/evidence-pack", currentPage: "SmartEvidencePackPage", targetHub: "Compliance", targetTab: "Evidence Packs", priority: "medium", status: "standalone" },
  // ESG/Sustainability (under Compliance)
  { currentRoute: "/eu-ets", currentPage: "EUETSHubPage", targetHub: "Compliance", targetTab: "ESG > EU ETS", priority: "high", status: "standalone" },
  { currentRoute: "/esg-emissions", currentPage: "ESGEmissionsPage", targetHub: "Compliance", targetTab: "ESG > Emissions", priority: "high", status: "standalone" },
  { currentRoute: "/sustainability-score", currentPage: "SustainabilityScorePage", targetHub: "Compliance", targetTab: "ESG > Sustainability", priority: "medium", status: "standalone" },
  { currentRoute: "/waste-management", currentPage: "EnhancedWasteManagement (MARPOL)", targetHub: "Compliance", targetTab: "ESG > MARPOL", priority: "high", status: "standalone" },
  // Security/Audit
  { currentRoute: "/security-center", currentPage: "SecurityCenter", targetHub: "Compliance", targetTab: "Security Center", priority: "high", status: "standalone" },
  { currentRoute: "/auditoria-seguranca", currentPage: "SecurityAuditCenter", targetHub: "Compliance", targetTab: "Security Audit", priority: "medium", status: "standalone" },
  { currentRoute: "/security-scanner", currentPage: "SecurityScanner", targetHub: "Compliance", targetTab: "Security Scanner", priority: "medium", status: "standalone" },
  { currentRoute: "/audit-ai-chat", currentPage: "AuditAIChatPage", targetHub: "Compliance", targetTab: "AI Audit Chat", priority: "medium", status: "standalone" },
  // Enterprise Compliance
  { currentRoute: "/enterprise/ocimf-assessment", currentPage: "OCIMFAssessmentPage", targetHub: "Compliance", targetTab: "OCIMF", priority: "high", status: "standalone" },
  { currentRoute: "/enterprise/tmsa-analytics", currentPage: "TMSAAnalyticsPage", targetHub: "Compliance", targetTab: "TMSA Analytics", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/fatigue-risk", currentPage: "FatigueRiskPage", targetHub: "Compliance", targetTab: "Fatigue Risk", priority: "high", status: "standalone" },
  { currentRoute: "/enterprise/mlc-hours", currentPage: "MLCWorkHoursPage", targetHub: "Compliance", targetTab: "MLC Work Hours", priority: "high", status: "standalone" },
  { currentRoute: "/enterprise/compliance-predictor", currentPage: "CompliancePredictorPage", targetHub: "Compliance", targetTab: "Compliance Predictor", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/nc-prediction", currentPage: "NCPredictionPage", targetHub: "Compliance", targetTab: "NC Prediction", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/risk-clauses", currentPage: "RiskClausesPage", targetHub: "Compliance", targetTab: "Risk Clauses", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/contract-analysis", currentPage: "ContractAnalysisPage", targetHub: "Compliance", targetTab: "Contract Analysis", priority: "medium", status: "standalone" },
  // Diagnostics
  { currentRoute: "/diagnostic-certificates", currentPage: "DiagnosticCertificatesPage", targetHub: "Compliance", targetTab: "Diagnostics", priority: "low", status: "standalone" },
  { currentRoute: "/diagnostic-dashboard", currentPage: "DiagnosticDashboardPage", targetHub: "Compliance", targetTab: "Diagnostics", priority: "low", status: "standalone" },
  { currentRoute: "/diagnostic-documents", currentPage: "DiagnosticDocumentsPage", targetHub: "Compliance", targetTab: "Diagnostics", priority: "low", status: "standalone" },
  { currentRoute: "/diagnostic-ncs", currentPage: "DiagnosticNCsPage", targetHub: "Compliance", targetTab: "Diagnostics", priority: "low", status: "standalone" },
  { currentRoute: "/diagnostic-reports", currentPage: "DiagnosticReportsPage", targetHub: "Compliance", targetTab: "Diagnostics", priority: "low", status: "standalone" },

  // ============================================================
  // → AI HUB (/ai) — All AI/ML/Automation modules
  // ============================================================
  { currentRoute: "/ai-hub", currentPage: "AIHubPage", targetHub: "AI", targetTab: "AI Central", priority: "critical", status: "standalone" },
  { currentRoute: "/ai-analytics", currentPage: "AIAnalyticsDashboard", targetHub: "AI", targetTab: "AI Analytics", priority: "high", status: "standalone" },
  { currentRoute: "/ai-observability", currentPage: "AIObservabilityDashboard", targetHub: "AI", targetTab: "AI Observability", priority: "high", status: "standalone" },
  { currentRoute: "/ai-audit", currentPage: "AIAudit", targetHub: "AI", targetTab: "AI Audit Trail", priority: "high", status: "standalone" },
  { currentRoute: "/ai-modules", currentPage: "AIModulesHubPage", targetHub: "AI", targetTab: "AI Modules", priority: "high", status: "standalone" },
  { currentRoute: "/workflow-command", currentPage: "WorkflowCommandCenter", targetHub: "AI", targetTab: "Workflow Automation", priority: "high", status: "standalone" },
  { currentRoute: "/agent-orchestration", currentPage: "AgentOrchestrationPage", targetHub: "AI", targetTab: "Agent Swarm", priority: "high", status: "standalone" },
  { currentRoute: "/audit-agents", currentPage: "AgentsDashboard", targetHub: "AI", targetTab: "Audit Agents", priority: "medium", status: "standalone" },
  { currentRoute: "/voice-copilot", currentPage: "VoiceCopilotPage", targetHub: "AI", targetTab: "Voice Copilot", priority: "medium", status: "standalone" },
  { currentRoute: "/computer-vision-inspector", currentPage: "ComputerVisionInspectorPage", targetHub: "AI", targetTab: "Computer Vision", priority: "medium", status: "standalone" },
  { currentRoute: "/ai-enterprise-engines", currentPage: "AIEnterpriseEnginesHub", targetHub: "AI", targetTab: "Enterprise Engines", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/rag-assistant", currentPage: "RAGAssistantPage", targetHub: "AI", targetTab: "RAG Assistant", priority: "high", status: "standalone" },
  { currentRoute: "/optimization-dashboard", currentPage: "Optimization", targetHub: "AI", targetTab: "Optimization", priority: "medium", status: "standalone" },
  { currentRoute: "/unified-optimization", currentPage: "UnifiedOptimizationPage", targetHub: "AI", targetTab: "Optimization", priority: "medium", status: "standalone" },
  // Specialized AI modules (11)
  { currentRoute: "/ai/voyage-logistics", currentPage: "VoyageLogisticsAIPage", targetHub: "AI", targetTab: "Specialized > Voyage", priority: "medium", status: "standalone" },
  { currentRoute: "/ai/safety-incident", currentPage: "SafetyIncidentAIPage", targetHub: "AI", targetTab: "Specialized > Safety", priority: "medium", status: "standalone" },
  { currentRoute: "/ai/inventory-spares", currentPage: "InventorySparesAIPage", targetHub: "AI", targetTab: "Specialized > Inventory", priority: "medium", status: "standalone" },
  { currentRoute: "/compliance-ai", currentPage: "ComplianceAIPage", targetHub: "AI", targetTab: "Specialized > Compliance", priority: "medium", status: "standalone" },
  { currentRoute: "/environmental-ai", currentPage: "EnvironmentalAIPage", targetHub: "AI", targetTab: "Specialized > Environmental", priority: "medium", status: "standalone" },
  { currentRoute: "/quality-ai", currentPage: "QualityManagementAIPage", targetHub: "AI", targetTab: "Specialized > Quality", priority: "medium", status: "standalone" },
  { currentRoute: "/contract-legal-ai", currentPage: "ContractLegalAIPage", targetHub: "AI", targetTab: "Specialized > Contracts", priority: "medium", status: "standalone" },
  { currentRoute: "/insurance-claims-ai", currentPage: "InsuranceClaimsAIPage", targetHub: "AI", targetTab: "Specialized > Insurance", priority: "medium", status: "standalone" },
  { currentRoute: "/crewing-payroll-ai", currentPage: "CrewingPayrollAIPage", targetHub: "AI", targetTab: "Specialized > Crewing", priority: "medium", status: "standalone" },
  { currentRoute: "/reporting-analytics-ai", currentPage: "ReportingAnalyticsAIPage", targetHub: "AI", targetTab: "Specialized > Reporting", priority: "medium", status: "standalone" },
  { currentRoute: "/mobile-offline-ai", currentPage: "MobileOfflineAIPage", targetHub: "AI", targetTab: "Specialized > Mobile/Offline", priority: "medium", status: "standalone" },

  // ============================================================
  // → TRACKING HUB (/tracking) — Telemetry, AIS, Satcom, IoT
  // ============================================================
  { currentRoute: "/telemetria", currentPage: "TelemetriaCommand", targetHub: "Tracking", targetTab: "Telemetria IoT", priority: "high", status: "standalone" },
  { currentRoute: "/vessel-tracking", currentPage: "VesselTrackingPage", targetHub: "Tracking", targetTab: "Vessel Tracking", priority: "high", status: "standalone" },
  { currentRoute: "/ais-tracker-page", currentPage: "AISTrackerPage", targetHub: "Tracking", targetTab: "AIS Tracker", priority: "high", status: "standalone" },
  { currentRoute: "/satcom-dashboard", currentPage: "SatcomDashboardEnhanced", targetHub: "Tracking", targetTab: "Satcom", priority: "high", status: "standalone" },
  { currentRoute: "/iot-wearables", currentPage: "IoTWearablesDashboardPage", targetHub: "Tracking", targetTab: "IoT Wearables", priority: "medium", status: "standalone" },
  { currentRoute: "/crew-fatigue-predictor", currentPage: "CrewFatiguePredictorPage", targetHub: "Tracking", targetTab: "Crew Fatigue Monitor", priority: "medium", status: "standalone" },

  // ============================================================
  // → WORKBENCH HUB (/workbench) — People, HR, Docs, Admin, Settings
  // ============================================================
  // HR Core
  { currentRoute: "/hr-dashboard", currentPage: "HRDashboardPage", targetHub: "Workbench", targetTab: "RH > Dashboard", priority: "critical", status: "standalone" },
  { currentRoute: "/people-analytics", currentPage: "PeopleAnalyticsPage", targetHub: "Workbench", targetTab: "RH > People Analytics", priority: "high", status: "standalone" },
  { currentRoute: "/payroll", currentPage: "Payroll", targetHub: "Workbench", targetTab: "RH > Folha Pagamento", priority: "critical", status: "standalone" },
  { currentRoute: "/crew-payroll", currentPage: "CrewPayrollPage", targetHub: "Workbench", targetTab: "RH > Folha Pagamento", priority: "high", status: "standalone" },
  { currentRoute: "/time-tracking", currentPage: "TimeTracking", targetHub: "Workbench", targetTab: "RH > Controle Ponto", priority: "high", status: "standalone" },
  { currentRoute: "/employee-portal", currentPage: "EmployeePortalPage", targetHub: "Workbench", targetTab: "RH > Portal Colaborador", priority: "high", status: "standalone" },
  { currentRoute: "/hr-chatbot", currentPage: "HRChatbotPage", targetHub: "Workbench", targetTab: "RH > Assistente RH", priority: "medium", status: "standalone" },
  { currentRoute: "/hr-ocr", currentPage: "HRDocumentOCRPage", targetHub: "Workbench", targetTab: "RH > Document OCR", priority: "medium", status: "standalone" },
  { currentRoute: "/hr-turnover", currentPage: "HRTurnoverPredictionPage", targetHub: "Workbench", targetTab: "RH > Turnover Prediction", priority: "medium", status: "standalone" },
  { currentRoute: "/recruitment", currentPage: "RecruitmentPage", targetHub: "Workbench", targetTab: "RH > Recrutamento", priority: "high", status: "standalone" },
  // Crew Management
  { currentRoute: "/crew-management", currentPage: "CrewManagement (→Maritime)", targetHub: "Workbench", targetTab: "Crew > Gestão", priority: "critical", status: "standalone" },
  { currentRoute: "/crew-wellness", currentPage: "CrewWellnessPage", targetHub: "Workbench", targetTab: "Crew > Bem-Estar", priority: "high", status: "standalone" },
  { currentRoute: "/crew-rotation", currentPage: "CrewRotationPage", targetHub: "Workbench", targetTab: "Crew > Rotação", priority: "high", status: "standalone" },
  { currentRoute: "/crew-planning", currentPage: "CrewPlanningPage", targetHub: "Workbench", targetTab: "Crew > Planejamento", priority: "high", status: "standalone" },
  { currentRoute: "/crew-scheduler", currentPage: "CrewSchedulerPage", targetHub: "Workbench", targetTab: "Crew > Scheduler", priority: "high", status: "standalone" },
  { currentRoute: "/crew-appraisal", currentPage: "CrewAppraisalPage", targetHub: "Workbench", targetTab: "Crew > Avaliação", priority: "medium", status: "standalone" },
  { currentRoute: "/crew-competency", currentPage: "CrewCompetencyPage", targetHub: "Workbench", targetTab: "Crew > Competências", priority: "high", status: "standalone" },
  { currentRoute: "/crew-travel", currentPage: "CrewTravelPage", targetHub: "Workbench", targetTab: "Crew > Viagens", priority: "high", status: "standalone" },
  { currentRoute: "/crew-change", currentPage: "CrewChangePage", targetHub: "Workbench", targetTab: "Crew > Crew Change", priority: "high", status: "standalone" },
  { currentRoute: "/crew-document-vault", currentPage: "CrewDocumentVaultPage", targetHub: "Workbench", targetTab: "Crew > Document Vault", priority: "high", status: "standalone" },
  { currentRoute: "/crew-marketplace", currentPage: "CrewMarketplacePage", targetHub: "Workbench", targetTab: "Crew > Marketplace", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/crew-matching", currentPage: "CrewMatchingPage", targetHub: "Workbench", targetTab: "Crew > AI Matching", priority: "medium", status: "standalone" },
  // Medical
  { currentRoute: "/medical-infirmary", currentPage: "MedicalInfirmary", targetHub: "Workbench", targetTab: "Enfermaria Digital", priority: "high", status: "standalone" },
  // Documents & Reports
  { currentRoute: "/documents", currentPage: "Documents", targetHub: "Workbench", targetTab: "Documentos", priority: "critical", status: "standalone" },
  { currentRoute: "/templates", currentPage: "Templates", targetHub: "Workbench", targetTab: "Templates", priority: "high", status: "standalone" },
  { currentRoute: "/document-workflow", currentPage: "DocumentWorkflow", targetHub: "Workbench", targetTab: "Doc Workflow", priority: "high", status: "standalone" },
  { currentRoute: "/export-center", currentPage: "ExportCenterPage", targetHub: "Workbench", targetTab: "Export Center", priority: "medium", status: "standalone" },
  { currentRoute: "/reports-command", currentPage: "ReportsCommandCenter", targetHub: "Workbench", targetTab: "Relatórios", priority: "critical", status: "standalone" },
  { currentRoute: "/premium-reports", currentPage: "PremiumReportsPage", targetHub: "Workbench", targetTab: "Relatórios Premium", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/ocr-center", currentPage: "OCRCenterPage", targetHub: "Workbench", targetTab: "OCR Center", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/forms-builder", currentPage: "FormsBuilderPage", targetHub: "Workbench", targetTab: "Forms Builder", priority: "medium", status: "standalone" },
  { currentRoute: "/enterprise/checklists-builder", currentPage: "ChecklistsBuilderPage", targetHub: "Workbench", targetTab: "Checklists Builder", priority: "medium", status: "standalone" },
  // Training
  { currentRoute: "/nautilus-academy", currentPage: "AITraining", targetHub: "Workbench", targetTab: "Academia / Treinamento", priority: "high", status: "standalone" },
  { currentRoute: "/solas-isps-training", currentPage: "SOLASISPSTrainingPage", targetHub: "Workbench", targetTab: "SOLAS/ISPS Training", priority: "medium", status: "standalone" },
  // Integrations & System
  { currentRoute: "/integrations", currentPage: "IntegrationsCenter", targetHub: "Workbench", targetTab: "Integrações", priority: "high", status: "standalone" },
  { currentRoute: "/integracoes", currentPage: "Integrations", targetHub: "Workbench", targetTab: "Integrações", priority: "high", status: "standalone" },
  { currentRoute: "/integracoes/api-center", currentPage: "APICenter", targetHub: "Workbench", targetTab: "API Center", priority: "medium", status: "standalone" },
  { currentRoute: "/integracoes/api-monitor", currentPage: "APIMonitor", targetHub: "Workbench", targetTab: "API Monitor", priority: "medium", status: "standalone" },
  { currentRoute: "/api-portal", currentPage: "APIDeveloperPortalPage", targetHub: "Workbench", targetTab: "API Developer Portal", priority: "medium", status: "standalone" },
  { currentRoute: "/collaboration", currentPage: "Collaboration", targetHub: "Workbench", targetTab: "Colaboração", priority: "medium", status: "standalone" },
  { currentRoute: "/whatsapp-bot", currentPage: "WhatsAppBotPage", targetHub: "Workbench", targetTab: "WhatsApp Bot", priority: "low", status: "standalone" },
  { currentRoute: "/users", currentPage: "Users", targetHub: "Workbench", targetTab: "Gestão Usuários", priority: "high", status: "standalone" },
  { currentRoute: "/client-portal", currentPage: "ClientPortalPage", targetHub: "Workbench", targetTab: "Portal Cliente", priority: "medium", status: "standalone" },
];

// =====================================================
// UI COMPONENTS
// =====================================================

const HUB_CONFIG = {
  Command: { icon: Command, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  Ops: { icon: Ship, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Maintenance: { icon: Wrench, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Compliance: { icon: Shield, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  AI: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  Tracking: { icon: MapPin, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  Workbench: { icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
};

const PRIORITY_COLORS = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-primary/20 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-muted",
};

function HubSection({ hubName, modules }: { hubName: string; modules: ModuleMapping[] }) {
  const config = HUB_CONFIG[hubName as keyof typeof HUB_CONFIG];
  const Icon = config?.icon || Layers;

  // Group by targetTab (first segment before " > ")
  const groups = useMemo(() => {
    const map = new Map<string, ModuleMapping[]>();
    modules.forEach(m => {
      const group = m.targetTab.split(" > ")[0];
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(m);
    });
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a[0]?.priority] || 3) - (priorityOrder[b[0]?.priority] || 3);
    });
  }, [modules]);

  const criticalCount = modules.filter(m => m.priority === "critical").length;
  const highCount = modules.filter(m => m.priority === "high").length;

  return (
    <Card className={`border ${config?.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config?.bg}`}>
              <Icon className={`h-5 w-5 ${config?.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{hubName} Hub</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {modules.length} módulos → {groups.length} abas
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {criticalCount > 0 && (
              <Badge variant="outline" className={PRIORITY_COLORS.critical}>
                {criticalCount} críticos
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="outline" className={PRIORITY_COLORS.high}>
                {highCount} altos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groups.map(([groupName, items]) => (
            <div key={groupName} className="border rounded-lg p-3 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{groupName}</span>
                <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
              </div>
              <div className="pl-5 space-y-1">
                {items.map(item => (
                  <div key={item.currentRoute} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`${PRIORITY_COLORS[item.priority]} text-[9px] px-1`}>
                      {item.priority}
                    </Badge>
                    <code className="text-muted-foreground">{item.currentRoute}</code>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{item.targetTab}</span>
                    {item.notes && (
                      <span className="text-muted-foreground italic">({item.notes})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ModuleConsolidationPlan() {
  const [activeHub, setActiveHub] = useState("all");

  const hubGroups = useMemo(() => {
    const map: Record<string, ModuleMapping[]> = {};
    CONSOLIDATION_MAP.forEach(m => {
      if (!map[m.targetHub]) map[m.targetHub] = [];
      map[m.targetHub].push(m);
    });
    return map;
  }, []);

  const stats = useMemo(() => ({
    total: CONSOLIDATION_MAP.length,
    critical: CONSOLIDATION_MAP.filter(m => m.priority === "critical").length,
    high: CONSOLIDATION_MAP.filter(m => m.priority === "high").length,
    medium: CONSOLIDATION_MAP.filter(m => m.priority === "medium").length,
    low: CONSOLIDATION_MAP.filter(m => m.priority === "low").length,
    hubs: Object.keys(hubGroups).length,
    uniqueTabs: new Set(CONSOLIDATION_MAP.map(m => m.targetTab.split(" > ")[0])).size,
  }), [hubGroups]);

  const reductionPercent = Math.round(((stats.total - stats.uniqueTabs) / stats.total) * 100);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Layers className="h-7 w-7 text-primary" />
          Plano de Consolidação de Módulos
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Estudo de viabilidade para fusão de ~{stats.total} páginas standalone em {stats.hubs} Mega-Hubs, 
          sem perda de funcionalidades. Cada módulo se torna uma aba dentro do hub correspondente.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Módulos Standalone</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.hubs}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Mega-Hubs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.uniqueTabs}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Abas Resultantes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Críticos</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-warning">{stats.high}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Alta Prioridade</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.medium}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Média</p>
        </Card>
        <Card className="p-3 text-center bg-success/5 border-success/20">
          <p className="text-2xl font-bold text-success">{reductionPercent}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Redução Rotas</p>
        </Card>
      </div>

      {/* Reduction Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Redução de Complexidade</span>
          <span className="text-sm text-muted-foreground">{stats.total} rotas → {stats.uniqueTabs} abas</span>
        </div>
        <Progress value={reductionPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          ✅ Todas as {stats.total} funcionalidades preservadas como abas dentro dos {stats.hubs} hubs canônicos
        </p>
      </Card>

      {/* Principles */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Princípios da Consolidação (Zero Perda)
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
          <li><strong>Preservação 100%:</strong> Cada componente atual vira uma aba lazy-loaded no hub destino</li>
          <li><strong>Redirects permanentes:</strong> Todas as URLs antigas continuam funcionando via <code>Navigate replace</code></li>
          <li><strong>Deep linking:</strong> URLs como <code>/compliance?tab=sgso</code> abrem direto na aba</li>
          <li><strong>Lazy loading:</strong> Abas só carregam quando acessadas (sem impacto de performance)</li>
          <li><strong>Sub-agrupamento:</strong> Hubs com muitas abas usam grupos colapsáveis (ex: Crew &gt; Rotação)</li>
          <li><strong>Sidebar simplificada:</strong> 7 entradas principais + favoritos do usuário</li>
          <li><strong>Reversibilidade:</strong> Componentes permanecem independentes, mudança é só de roteamento</li>
        </ul>
      </Card>

      {/* Hub Filter */}
      <Tabs value={activeHub} onValueChange={setActiveHub}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          {Object.entries(hubGroups).map(([hub, modules]) => {
            const config = HUB_CONFIG[hub as keyof typeof HUB_CONFIG];
            return (
              <TabsTrigger key={hub} value={hub} className="gap-1.5">
                {config && <config.icon className="h-3.5 w-3.5" />}
                {hub} ({modules.length})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {Object.entries(hubGroups).map(([hub, modules]) => (
            <HubSection key={hub} hubName={hub} modules={modules} />
          ))}
        </TabsContent>

        {Object.entries(hubGroups).map(([hub, modules]) => (
          <TabsContent key={hub} value={hub} className="mt-4">
            <HubSection hubName={hub} modules={modules} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Implementation Phases */}
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          Fases de Implementação
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3">
            <Badge className="mb-2 bg-destructive/20 text-destructive border-destructive/30">Fase 1 — Crítico</Badge>
            <p className="text-xs text-muted-foreground">
              Consolidar {stats.critical} módulos críticos (Maritime, Fleet, Voyage, HR, Docs, SGSO, PEO-DP) nos hubs.
              Criar redirects para todas as URLs existentes.
            </p>
          </div>
          <div className="border rounded-lg p-3">
            <Badge className="mb-2 bg-warning/20 text-warning border-warning/30">Fase 2 — Alta Prioridade</Badge>
            <p className="text-xs text-muted-foreground">
              Mover {stats.high} módulos de alta prioridade (Compliance frameworks, AI tools, Crew modules).
              Implementar sub-agrupamento nas abas.
            </p>
          </div>
          <div className="border rounded-lg p-3">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">Fase 3 — Média/Baixa</Badge>
            <p className="text-xs text-muted-foreground">
              Absorver {stats.medium + stats.low} módulos restantes (Diagnostics, Marketplace, Portal).
              Otimizar sidebar e navegação final.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
