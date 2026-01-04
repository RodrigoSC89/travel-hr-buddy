/**
 * V2 Elevated Modules Routes
 * All upgraded V2 versions of modules
 */
import { Route } from "react-router-dom";
import {
  VesselContractsV2,
  CharterPartyV2,
  CargoManagementV2,
  PortCallOptimizationV2,
  VesselCTSV2,
  VesselHistoryV2,
  GMUDV2,
  ResponsibilityMatrixV2,
  SafetyHumanFactorsV2,
  SafetyIMCAV2,
  ISPSSecurityV2,
  DrillSimulatorV2,
  ComplianceOneV2,
  RegulationsV2,
  RiskMatrixV2,
  EvidencesV2,
  DueDiligenceV2,
  WhistleblowerV2,
} from "./lazy-imports";

export const v2ModulesRoutes = (
  <>
    <Route path="vessel-contracts-v2" element={<VesselContractsV2 />} />
    <Route path="charter-party-v2" element={<CharterPartyV2 />} />
    <Route path="cargo-management-v2" element={<CargoManagementV2 />} />
    <Route path="port-call-v2" element={<PortCallOptimizationV2 />} />
    <Route path="vessel-cts-v2" element={<VesselCTSV2 />} />
    <Route path="vessel-history-v2" element={<VesselHistoryV2 />} />
    <Route path="gmud-v2" element={<GMUDV2 />} />
    <Route path="responsibility-matrix-v2" element={<ResponsibilityMatrixV2 />} />
    <Route path="safety-human-factors-v2" element={<SafetyHumanFactorsV2 />} />
    <Route path="safety-imca-v2" element={<SafetyIMCAV2 />} />
    <Route path="isps-security-v2" element={<ISPSSecurityV2 />} />
    <Route path="drill-simulator-v2" element={<DrillSimulatorV2 />} />
    <Route path="compliance-one-v2" element={<ComplianceOneV2 />} />
    <Route path="regulations-v2" element={<RegulationsV2 />} />
    <Route path="risk-matrix-v2" element={<RiskMatrixV2 />} />
    <Route path="evidences-v2" element={<EvidencesV2 />} />
    <Route path="due-diligence-v2" element={<DueDiligenceV2 />} />
    <Route path="whistleblower-v2" element={<WhistleblowerV2 />} />
  </>
);
