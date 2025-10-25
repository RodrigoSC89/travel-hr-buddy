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
      </Routes>
    </Router>
  );
}
