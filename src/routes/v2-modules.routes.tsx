/**
 * Unified Module Routes (Consolidated V2)
 * All V2 modules now serve as the primary source of truth
 * V1 routes redirect to V2 components
 * 
 * @version 3.2.0
 * @consolidation 2025-01-05
 */
import { Route, Navigate } from "react-router-dom";
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

/**
 * Consolidated routes using V2 as source of truth
 * Old V2 paths redirect to clean paths for backwards compatibility
 */
export const v2ModulesRoutes = (
  <>
    {/* ============= OPERAÇÕES MARÍTIMAS ============= */}
    {/* Primary clean routes (V2 components) */}
    <Route path="vessel-contracts" element={<VesselContractsV2 />} />
    <Route path="charter-party" element={<CharterPartyV2 />} />
    <Route path="cargo-management" element={<CargoManagementV2 />} />
    <Route path="port-call" element={<PortCallOptimizationV2 />} />
    <Route path="vessel-cts" element={<VesselCTSV2 />} />
    <Route path="vessel-history" element={<VesselHistoryV2 />} />
    
    {/* Legacy V2 path redirects */}
    <Route path="vessel-contracts-v2" element={<Navigate to="/vessel-contracts" replace />} />
    <Route path="charter-party-v2" element={<Navigate to="/charter-party" replace />} />
    <Route path="cargo-management-v2" element={<Navigate to="/cargo-management" replace />} />
    <Route path="port-call-v2" element={<Navigate to="/port-call" replace />} />
    <Route path="port-call-optimization" element={<Navigate to="/port-call" replace />} />
    <Route path="vessel-cts-v2" element={<Navigate to="/vessel-cts" replace />} />
    <Route path="vessel-history-v2" element={<Navigate to="/vessel-history" replace />} />

    {/* ============= AUDITORIAS & GESTÃO DE MUDANÇAS ============= */}
    {/* Primary clean routes (V2 components) */}
    <Route path="gmud" element={<GMUDV2 />} />
    <Route path="responsibility-matrix" element={<ResponsibilityMatrixV2 />} />
    <Route path="safety-human-factors" element={<SafetyHumanFactorsV2 />} />
    <Route path="safety-imca" element={<SafetyIMCAV2 />} />
    <Route path="isps-security" element={<ISPSSecurityV2 />} />
    <Route path="drill-simulator" element={<DrillSimulatorV2 />} />
    
    {/* Legacy V2 path redirects */}
    <Route path="gmud-v2" element={<Navigate to="/gmud" replace />} />
    <Route path="responsibility-matrix-v2" element={<Navigate to="/responsibility-matrix" replace />} />
    <Route path="safety-human-factors-v2" element={<Navigate to="/safety-human-factors" replace />} />
    <Route path="safety-imca-v2" element={<Navigate to="/safety-imca" replace />} />
    <Route path="isps-security-v2" element={<Navigate to="/isps-security" replace />} />
    <Route path="drill-simulator-v2" element={<Navigate to="/drill-simulator" replace />} />

    {/* ============= COMPLIANCE ONE SUITE ============= */}
    {/* Primary clean routes (V2 components) */}
    <Route path="compliance-one" element={<ComplianceOneV2 />} />
    <Route path="regulations" element={<RegulationsV2 />} />
    <Route path="risk-matrix" element={<RiskMatrixV2 />} />
    <Route path="evidences" element={<EvidencesV2 />} />
    <Route path="due-diligence" element={<DueDiligenceV2 />} />
    <Route path="whistleblower" element={<WhistleblowerV2 />} />
    
    {/* Legacy V2 path redirects */}
    <Route path="compliance-one-v2" element={<Navigate to="/compliance-one" replace />} />
    <Route path="regulations-v2" element={<Navigate to="/regulations" replace />} />
    <Route path="risk-matrix-v2" element={<Navigate to="/risk-matrix" replace />} />
    <Route path="evidences-v2" element={<Navigate to="/evidences" replace />} />
    <Route path="due-diligence-v2" element={<Navigate to="/due-diligence" replace />} />
    <Route path="whistleblower-v2" element={<Navigate to="/whistleblower" replace />} />
    
    {/* Legacy compliance-center paths redirect to new clean paths */}
    <Route path="compliance-center/regulamentos" element={<Navigate to="/regulations" replace />} />
    <Route path="compliance-center/riscos" element={<Navigate to="/risk-matrix" replace />} />
    <Route path="compliance-center/evidencias" element={<Navigate to="/evidences" replace />} />
    <Route path="compliance-center/terceiros" element={<Navigate to="/due-diligence" replace />} />
    <Route path="compliance-center/denuncias" element={<Navigate to="/whistleblower" replace />} />
  </>
);
