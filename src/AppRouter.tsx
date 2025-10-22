// @ts-nocheck
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { safeLazyImport } from "@/lib/safeLazyImport";

// 🔹 Módulos principais
const Dashboard = safeLazyImport(() => React.lazy(() => import(import("@/pages/Dashboard"))));
const MaintenanceDashboard = safeLazyImport(() => React.lazy(() => import(import("@/pages/Maintenance"))));
const ComplianceHub = safeLazyImport(() => React.lazy(() => import(import("@/pages/compliance/ComplianceHub"))));
const DPIntelligenceCenter = safeLazyImport(() => React.lazy(() => import(import("@/pages/dp-intelligence/DPIntelligenceCenter"))));
const ControlHub = safeLazyImport(() => React.lazy(() => import(import("@/pages/control/ControlHub"))));
const ForecastGlobal = safeLazyImport(() => React.lazy(() => import(import("@/pages/forecast/ForecastGlobal"))));
const BridgeLink = safeLazyImport(() => React.lazy(() => import(import("@/pages/bridgelink/BridgeLink"))));

// 🔹 Suporte e operações
const Optimization = safeLazyImport(() => React.lazy(() => import(import("@/pages/Optimization"))));
const Maritime = safeLazyImport(() => React.lazy(() => import(import("@/pages/Maritime"))));
const PEODP = safeLazyImport(() => React.lazy(() => import(import("@/pages/PEODP"))));
const PEOTRAM = safeLazyImport(() => React.lazy(() => import(import("@/pages/PEOTRAM"))));
const ChecklistsInteligentes = safeLazyImport(() => React.lazy(() => import(import("@/pages/ChecklistsInteligentes"))));

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
