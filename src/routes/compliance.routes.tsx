/**
 * Safety & Compliance Routes
 * PEOTRAM, PEO-DP, SGSO, IMCA, ISPS, etc.
 * 
 * NOTE: Modules like SafetyHumanFactors, SafetyIMCA, ISPSPage, DrillSimulator
 * have been consolidated into V2 versions in v2-modules.routes.tsx
 * This file only contains non-duplicated compliance routes
 * 
 * @version 3.2.0
 * @consolidation 2025-01-05
 */
import { Route } from "react-router-dom";
import {
  PreOVIDInspection,
  SGSOReportPage,
  ComplianceCenter,
} from "./lazy-imports";

export const complianceRoutes = (
  <>
    <Route path="pre-ovid" element={<PreOVIDInspection />} />
    <Route path="sgso/report" element={<SGSOReportPage />} />
    <Route path="compliance-center/*" element={<ComplianceCenter />} />
  </>
);
