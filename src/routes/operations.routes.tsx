/**
 * Operations & Fleet Routes
 * All vessel, fleet, and operations pages
 */
import { Route } from "react-router-dom";
import {
  AISTracking,
  AISTrackerPage,
  CertificateBlockchain,
  IncidentSimulator,
  VesselContracts,
  VesselCTS,
  VesselHistory,
  GMUD,
  ResponsibilityMatrix,
  CargoManagementPage,
  CharterPartyPage,
  PortCallOptimizationPage,
  VoyageAccountingPage,
  TrackingCenter,
} from "./lazy-imports";

export const operationsRoutes = (
  <>
    <Route path="ais-tracking" element={<AISTracking />} />
    <Route path="ais-tracker-page" element={<AISTrackerPage />} />
    <Route path="certificate-blockchain" element={<CertificateBlockchain />} />
    <Route path="simulador" element={<IncidentSimulator />} />
    <Route path="vessel-contracts" element={<VesselContracts />} />
    <Route path="vessel-cts" element={<VesselCTS />} />
    <Route path="vessel-history" element={<VesselHistory />} />
    <Route path="gmud" element={<GMUD />} />
    <Route path="responsibility-matrix" element={<ResponsibilityMatrix />} />
    <Route path="cargo-management" element={<CargoManagementPage />} />
    <Route path="charter-party" element={<CharterPartyPage />} />
    <Route path="port-call-optimization" element={<PortCallOptimizationPage />} />
    <Route path="voyage-accounting" element={<VoyageAccountingPage />} />
    <Route path="tracking/*" element={<TrackingCenter />} />
  </>
);
