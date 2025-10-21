// @ts-nocheck
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { safeLazyImport } from "@/lib/safeLazyImport";

// 🔹 Módulos principais
const Dashboard = safeLazyImport(() => import("@/pages/Dashboard"));
const MaintenanceDashboard = safeLazyImport(() => import("@/pages/Maintenance"));
const ComplianceHub = safeLazyImport(() => import("@/pages/compliance/ComplianceHub"));
const DPIntelligenceCenter = safeLazyImport(() => import("@/pages/dp-intelligence/DPIntelligenceCenter"));
const ControlHub = safeLazyImport(() => import("@/pages/control/ControlHub"));
const ForecastGlobal = safeLazyImport(() => import("@/pages/forecast/ForecastGlobal"));
const BridgeLink = safeLazyImport(() => import("@/pages/bridgelink/BridgeLink"));

// 🔹 Suporte e operações
const Optimization = safeLazyImport(() => import("@/pages/Optimization"));
const Maritime = safeLazyImport(() => import("@/pages/Maritime"));
const PEODP = safeLazyImport(() => import("@/pages/PEODP"));
const PEOTRAM = safeLazyImport(() => import("@/pages/PEOTRAM"));
const ChecklistsInteligentes = safeLazyImport(() => import("@/pages/ChecklistsInteligentes"));

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
