// @ts-nocheck
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AutoHealSystem } from "@/lib/ai/AutoHealSystem";

// 🔹 Módulos principais com AutoHeal
const Dashboard = React.lazy(() =>
  AutoHealSystem.loadSafely("Dashboard", () => import("@/pages/Dashboard"))
);
const MaintenanceDashboard = React.lazy(() =>
  AutoHealSystem.loadSafely("MaintenanceDashboard", () => import("@/pages/Maintenance"))
);
const ComplianceHub = React.lazy(() =>
  AutoHealSystem.loadSafely("ComplianceHub", () => import("@/pages/compliance/ComplianceHub"))
);
const DPIntelligenceCenter = React.lazy(() =>
  AutoHealSystem.loadSafely("DPIntelligenceCenter", () => import("@/pages/dp-intelligence/DPIntelligenceCenter"))
);
const ControlHub = React.lazy(() =>
  AutoHealSystem.loadSafely("ControlHub", () => import("@/pages/control/ControlHub"))
);
const ForecastGlobal = React.lazy(() =>
  AutoHealSystem.loadSafely("ForecastGlobal", () => import("@/pages/forecast/ForecastGlobal"))
);
const BridgeLink = React.lazy(() =>
  AutoHealSystem.loadSafely("BridgeLink", () => import("@/pages/bridgelink/BridgeLink"))
);

// 🔹 Suporte e operações com AutoHeal
const Optimization = React.lazy(() =>
  AutoHealSystem.loadSafely("Optimization", () => import("@/pages/Optimization"))
);
const Maritime = React.lazy(() =>
  AutoHealSystem.loadSafely("Maritime", () => import("@/pages/Maritime"))
);
const PEODP = React.lazy(() =>
  AutoHealSystem.loadSafely("PEODP", () => import("@/pages/PEODP"))
);
const PEOTRAM = React.lazy(() =>
  AutoHealSystem.loadSafely("PEOTRAM", () => import("@/pages/PEOTRAM"))
);
const ChecklistsInteligentes = React.lazy(() =>
  AutoHealSystem.loadSafely("ChecklistsInteligentes", () => import("@/pages/ChecklistsInteligentes"))
);

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
      </Routes>
    </Router>
  );
}
