/**
 * Executive & BI Routes
 * Business intelligence and executive dashboards
 */
import { Route } from "react-router-dom";
import {
  ExecutiveBIDashboard,
  RevolutionaryFeaturesPage,
  SustainabilityScorePage,
  Gamification,
  ExportCenterPage,
  AdvancedSearchPage,
  BetaFeedback,
  BetaDashboard,
  StatusPage,
  Roadmap,
} from "./lazy-imports";

export const executiveRoutes = (
  <>
    <Route path="executive-bi" element={<ExecutiveBIDashboard />} />
    <Route path="revolutionary-features" element={<RevolutionaryFeaturesPage />} />
    <Route path="sustainability-score" element={<SustainabilityScorePage />} />
    <Route path="gamification" element={<Gamification />} />
    <Route path="export-center" element={<ExportCenterPage />} />
    <Route path="advanced-search" element={<AdvancedSearchPage />} />
    <Route path="beta-feedback" element={<BetaFeedback />} />
    <Route path="beta-dashboard" element={<BetaDashboard />} />
    <Route path="status" element={<StatusPage />} />
    <Route path="roadmap" element={<Roadmap />} />
  </>
);
