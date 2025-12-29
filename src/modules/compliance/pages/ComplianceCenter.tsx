/**
 * Compliance Center - Main Router
 * ISO 37301 Based Compliance Management System
 */

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ComplianceDashboard = lazy(() => import("./ComplianceDashboard"));
const ComplianceRegulamentos = lazy(() => import("./ComplianceRegulamentos"));
const ComplianceRiscos = lazy(() => import("./ComplianceRiscos"));
const ComplianceEvidencias = lazy(() => import("./ComplianceEvidencias"));
const ComplianceTerceiros = lazy(() => import("./ComplianceTerceiros"));
const ComplianceDenuncias = lazy(() => import("./ComplianceDenuncias"));
const ComplianceWorkflows = lazy(() => import("./ComplianceWorkflows"));
const ComplianceRelatorios = lazy(() => import("./ComplianceRelatorios"));
const ComplianceIARecommendations = lazy(() => import("./ComplianceIARecommendations"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ComplianceCenter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ComplianceDashboard />} />
        <Route path="regulamentos" element={<ComplianceRegulamentos />} />
        <Route path="riscos" element={<ComplianceRiscos />} />
        <Route path="evidencias" element={<ComplianceEvidencias />} />
        <Route path="terceiros" element={<ComplianceTerceiros />} />
        <Route path="denuncias" element={<ComplianceDenuncias />} />
        <Route path="workflows" element={<ComplianceWorkflows />} />
        <Route path="relatorios" element={<ComplianceRelatorios />} />
        <Route path="ia-recommendations" element={<ComplianceIARecommendations />} />
      </Routes>
    </Suspense>
  );
}
