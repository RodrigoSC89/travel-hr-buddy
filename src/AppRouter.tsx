import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔹 Módulos principais
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const MaintenanceDashboard = React.lazy(() => import("@/pages/Maintenance"));
const ComplianceHub = React.lazy(() => import("@/pages/compliance/ComplianceHub"));
const DPIntelligenceCenter = React.lazy(() => import("@/modules/intelligence/dp-intelligence"));
const ControlHub = React.lazy(() => import("@/pages/control/ControlHub"));
const ForecastGlobal = React.lazy(() => import("@/pages/forecast/ForecastGlobal"));
const BridgeLink = React.lazy(() => import("@/pages/bridgelink/BridgeLink"));

// 🔹 Suporte e operações
const Optimization = React.lazy(() => import("@/pages/Optimization"));
const Maritime = React.lazy(() => import("@/pages/Maritime"));
const PEODP = React.lazy(() => import("@/pages/PEODP"));
const PEOTRAM = React.lazy(() => import("@/pages/PEOTRAM"));
const ChecklistsInteligentes = React.lazy(() => import("@/pages/ChecklistsInteligentes"));

// 🔹 PATCH 73.0-75.0 - Sistema de IA e Status
const EmergencyDrill = React.lazy(() => import("@/pages/emergency-drill"));
const SystemStatus = React.lazy(() => import("@/pages/system-status"));

// 🔹 PATCH 93.0 - System Watchdog
const SystemWatchdog = React.lazy(() => import("@/pages/dashboard/system-watchdog"));

// 🔹 PATCH 94.0 - Logs Center
const LogsCenter = React.lazy(() => import("@/modules/logs-center/LogsCenter"));

// 🔹 PATCH 106.0 - Crew Management
const CrewManagement = React.lazy(() => import("@/pages/CrewManagement"));

// 🔹 PATCH 177.0 - Mission Control
const MissionControl = React.lazy(() => import("@/modules/mission-control"));

// 🔹 PATCH 180.0 - Ocean Sonar AI
const OceanSonar = React.lazy(() => import("@/modules/ocean-sonar"));

// 🔹 PATCH 191.0 - Fleet Management
const FleetManagement = React.lazy(() => import("@/modules/fleet"));

// 🔹 PATCH 211.0-215.0 - Mission Simulation, Telemetry & AI
const SimulationPage = React.lazy(() => import("@/pages/SimulationPage"));
const TelemetryPage = React.lazy(() => import("@/pages/TelemetryPage"));

// 🔹 PATCH 271-275 - Voice Assistant, Analytics, Satellite, Document Templates
const VoiceAssistant = React.lazy(() => import("@/modules/voice-assistant/VoiceAssistant"));
const AnalyticsCore = React.lazy(() => import("@/modules/analytics/AnalyticsCore"));
const SatelliteTracker = React.lazy(() => import("@/modules/satellite/SatelliteTracker"));
const DocumentTemplates = React.lazy(() => import("@/modules/document-hub/templates"));

// 🔹 PATCH 306-310 - Training Academy, Weather Dashboard, AI Documents, Fuel Optimizer
const TrainingAcademyAdmin = React.lazy(() => import("@/pages/admin/training-academy"));
const WeatherDashboard = React.lazy(() => import("@/pages/WeatherDashboard"));
const AIDocuments = React.lazy(() => import("@/pages/documents/ai"));
const FuelOptimizer = React.lazy(() => import("@/pages/FuelOptimizer"));

// 🔹 PATCH 326-330 - SGSO Workflow, Fuel Optimizer, Logistics, Channel Manager, AI Documents
const SGSOWorkflow = React.lazy(() => import("@/pages/sgso/SGSOWorkflow"));
const LogisticsHub = React.lazy(() => import("@/pages/LogisticsHub"));
const ChannelManager = React.lazy(() => import("@/pages/ChannelManager"));

// 🔹 PATCH 331-335 - SGSO Audits, Vault AI, Weather, User Management, Logistics Hub
const SGSOAudits = React.lazy(() => import("@/pages/admin/sgso/audits"));
const VaultAI = React.lazy(() => import("@/modules/vault_ai/components/VaultVectorSearch"));
const UserManagement = React.lazy(() => import("@/pages/admin/user-management"));
const LogisticsHubAdmin = React.lazy(() => import("@/pages/admin/logistics-hub"));

// 🔹 PATCH 411-415 - Price Alerts, Unified Logs, Coordination AI, Experimental Modules
const PriceAlerts = React.lazy(() => import("@/pages/PriceAlerts"));
const UnifiedLogs = React.lazy(() => import("@/pages/UnifiedLogs"));
const CoordinationAI = React.lazy(() => import("@/pages/CoordinationAI"));
const ExperimentalModules = React.lazy(() => import("@/pages/ExperimentalModules"));

// 🔹 PATCH 421-425 - Maritime Operations Modules
const Documents = React.lazy(() => import("@/pages/Documents"));
const UnderwaterDrone = React.lazy(() => import("@/modules/underwater-drone"));
const NavigationCopilotPage = React.lazy(() => import("@/pages/NavigationCopilot"));

// 🔹 PATCH 461-465 - Sensors Hub, Missions Consolidation, Templates, Price Alerts, Technical Validation
const TechnicalValidation = React.lazy(() => import("@/pages/admin/technical-validation"));

// 🔹 PATCH 467 - Drone Commander Experimental
const DroneCommander = React.lazy(() => import("@/pages/DroneCommander"));

// 🔹 PATCH 506-510 Validation
const Patches506510Validation = React.lazy(() => import("@/pages/admin/Patches506510Validation"));

// 🔹 PATCH 486-490 Management Pages
const Patch486Communication = React.lazy(() => import("@/pages/admin/Patch486Communication"));
const Patch487DroneCommander = React.lazy(() => import("@/pages/admin/Patch487DroneCommander"));
const Patch488Templates = React.lazy(() => import("@/pages/admin/Patch488Templates"));
const Patch489Navigation = React.lazy(() => import("@/pages/admin/Patch489Navigation"));
const Patch490PriceAlerts = React.lazy(() => import("@/pages/admin/Patch490PriceAlerts"));
const Patch491WeatherIntegration = React.lazy(() => import("@/pages/admin/Patch491WeatherIntegration"));
const Patch492MaintenanceScheduler = React.lazy(() => import("@/pages/admin/Patch492MaintenanceScheduler"));
const Patch493ComplianceTracker = React.lazy(() => import("@/pages/admin/Patch493ComplianceTracker"));
const Patch494CrewManagement = React.lazy(() => import("@/pages/admin/Patch494CrewManagement"));
const Patch495InventoryControl = React.lazy(() => import("@/pages/admin/Patch495InventoryControl"));
const Patch496ModuleConsolidation = React.lazy(() => import("@/pages/admin/Patch496ModuleConsolidation"));
const Patch497Documentation = React.lazy(() => import("@/pages/admin/Patch497Documentation"));
const Patch498Testing = React.lazy(() => import("@/pages/admin/Patch498Testing"));
const Patch499Telemetry = React.lazy(() => import("@/pages/admin/Patch499Telemetry"));
const Patch500UxPolish = React.lazy(() => import("@/pages/admin/Patch500UxPolish"));

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/maintenance" element={<MaintenanceDashboard />} />
        <Route path="/compliance" element={<ComplianceHub />} />
        <Route path="/dp-intelligence" element={<DPIntelligenceCenter />} />
        <Route path="/control-hub" element={<ControlHub />} />
        <Route path="/forecast-global" element={<ForecastGlobal />} />
        <Route path="/bridgelink" element={<BridgeLink />} />
        <Route path="/optimization" element={<Optimization />} />
        <Route path="/maritime" element={<Maritime />} />
        <Route path="/peo-dp" element={<PEODP />} />
        <Route path="/peo-tram" element={<PEOTRAM />} />
        <Route path="/checklists-inteligentes" element={<ChecklistsInteligentes />} />
        <Route path="/emergency-drill" element={<EmergencyDrill />} />
        <Route path="/system-status" element={<SystemStatus />} />
        <Route path="/dashboard/system-watchdog" element={<SystemWatchdog />} />
        <Route path="/dashboard/logs-center" element={<LogsCenter />} />
        <Route path="/crew-management" element={<CrewManagement />} />
        <Route path="/mission-control" element={<MissionControl />} />
        <Route path="/ocean-sonar" element={<OceanSonar />} />
        <Route path="/fleet" element={<FleetManagement />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/telemetry" element={<TelemetryPage />} />
        
        {/* PATCH 271-275 Routes */}
        <Route path="/voice-assistant" element={<VoiceAssistant />} />
        <Route path="/analytics-core" element={<AnalyticsCore />} />
        <Route path="/satellite-tracker" element={<SatelliteTracker />} />
        <Route path="/document-templates" element={<DocumentTemplates />} />
        
        {/* PATCH 306-310 Routes */}
        <Route path="/admin/training-academy" element={<TrainingAcademyAdmin />} />
        <Route path="/weather-dashboard" element={<WeatherDashboard />} />
        <Route path="/documents/ai" element={<AIDocuments />} />
        <Route path="/fuel-optimizer" element={<FuelOptimizer />} />
        
        {/* PATCH 326-330 Routes */}
        <Route path="/sgso/workflow" element={<SGSOWorkflow />} />
        <Route path="/fuel/optimize" element={<FuelOptimizer />} />
        <Route path="/logistics-hub" element={<LogisticsHub />} />
        <Route path="/channel-manager" element={<ChannelManager />} />
        
        {/* PATCH 331-335 Routes */}
        <Route path="/admin/sgso/audits" element={<SGSOAudits />} />
        <Route path="/vault-ai" element={<VaultAI />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/logistics-hub" element={<LogisticsHubAdmin />} />
        
        {/* PATCH 411-415 Routes */}
        <Route path="/price-alerts" element={<PriceAlerts />} />
        <Route path="/unified-logs" element={<UnifiedLogs />} />
        <Route path="/coordination-ai" element={<CoordinationAI />} />
        <Route path="/experimental-modules" element={<ExperimentalModules />} />
        
        {/* PATCH 421-425 Routes - Maritime Operations */}
        <Route path="/documents" element={<Documents />} />
        <Route path="/underwater-drone" element={<UnderwaterDrone />} />
        <Route path="/navigation-copilot" element={<NavigationCopilotPage />} />
        
        {/* PATCH 461-465 Routes */}
        <Route path="/admin/technical-validation" element={<TechnicalValidation />} />
        
        {/* PATCH 467 Route - Drone Commander */}
        <Route path="/drone-commander" element={<DroneCommander />} />
        
        {/* PATCH 481-485 Validation Route */}
        <Route path="/admin/patches-481-485/validation" element={
          React.createElement(React.lazy(() => import("@/modules/validation/Patches481485Validation")))
        } />
        
        {/* PATCH 491-495 Validation Route */}
        <Route path="/admin/patches-491-495/validation" element={
          React.createElement(React.lazy(() => import("@/modules/validation/Patches491495Validation")))
        } />
        
        {/* PATCH 501-505 Validation Route */}
        <Route path="/admin/patches-501-505/validation" element={
          React.createElement(React.lazy(() => import("@/pages/admin/Patches501505Validation")))
        } />
        
        {/* PATCH 506-510 Validation Route */}
        <Route path="/admin/patches-506-510/validation" element={<Patches506510Validation />} />
        
        {/* PATCH 486-490 Management Routes */}
        <Route path="/admin/patch-486/communication" element={<Patch486Communication />} />
        <Route path="/admin/patch-487/drone-commander" element={<Patch487DroneCommander />} />
        <Route path="/admin/patch-488/templates" element={<Patch488Templates />} />
        <Route path="/admin/patch-489/navigation" element={<Patch489Navigation />} />
        <Route path="/admin/patch-490/price-alerts" element={<Patch490PriceAlerts />} />
        
        {/* PATCH 491-495 Management Routes */}
        <Route path="/admin/patch-491/weather" element={<Patch491WeatherIntegration />} />
        <Route path="/admin/patch-492/maintenance" element={<Patch492MaintenanceScheduler />} />
        <Route path="/admin/patch-493/compliance" element={<Patch493ComplianceTracker />} />
        <Route path="/admin/patch-494/crew" element={<Patch494CrewManagement />} />
              <Route path="/admin/patch-495/inventory" element={<Patch495InventoryControl />} />
              <Route path="/admin/patch-496/consolidation" element={<Patch496ModuleConsolidation />} />
              <Route path="/admin/patch-497/documentation" element={<Patch497Documentation />} />
              <Route path="/admin/patch-498/testing" element={<Patch498Testing />} />
              <Route path="/admin/patch-499/telemetry" element={<Patch499Telemetry />} />
              <Route path="/admin/patch-500/ux-polish" element={<Patch500UxPolish />} />
      </Routes>
    </Router>
  );
}
