/**
 * Safety & Compliance Routes
 * PEOTRAM, PEO-DP, SGSO, IMCA, ISPS, etc.
 */
import { Route } from "react-router-dom";
import {
  SafetyHumanFactors,
  SafetyIMCA,
  PreOVIDInspection,
  SGSOReportPage,
  ISPSPage,
  DrillSimulatorPage,
  ComplianceCenter,
} from "./lazy-imports";

export const complianceRoutes = (
  <>
    <Route path="safety-human-factors" element={<SafetyHumanFactors />} />
    <Route path="safety-imca" element={<SafetyIMCA />} />
    <Route path="pre-ovid" element={<PreOVIDInspection />} />
    <Route path="sgso/report" element={<SGSOReportPage />} />
    <Route path="isps-security" element={<ISPSPage />} />
    <Route path="drill-simulator" element={<DrillSimulatorPage />} />
    <Route path="compliance-center/*" element={<ComplianceCenter />} />
  </>
);
