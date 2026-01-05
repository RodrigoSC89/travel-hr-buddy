/**
 * Operations & Fleet Routes
 * All vessel, fleet, and operations pages
 * 
 * NOTE: V1 modules have been deprecated in favor of V2 (consolidated in v2-modules.routes.tsx)
 * This file only contains non-duplicated operation routes
 * 
 * @version 3.2.0
 * @consolidation 2025-01-05
 */
import { Route } from "react-router-dom";
import {
  AISTracking,
  AISTrackerPage,
  CertificateBlockchain,
  IncidentSimulator,
  VoyageAccountingPage,
  TrackingCenter,
  PredictiveMaintenancePage,
  SatelliteOptimizerPage,
  CrewWellnessPage,
  RouteOptimizerPage,
} from "./lazy-imports";

export const operationsRoutes = (
  <>
    <Route path="ais-tracking" element={<AISTracking />} />
    <Route path="ais-tracker-page" element={<AISTrackerPage />} />
    <Route path="certificate-blockchain" element={<CertificateBlockchain />} />
    <Route path="simulador" element={<IncidentSimulator />} />
    <Route path="voyage-accounting" element={<VoyageAccountingPage />} />
    <Route path="tracking/*" element={<TrackingCenter />} />
    
    {/* ML & Optimization */}
    <Route path="predictive-maintenance" element={<PredictiveMaintenancePage />} />
    <Route path="satellite-optimizer" element={<SatelliteOptimizerPage />} />
    <Route path="crew-wellness" element={<CrewWellnessPage />} />
    <Route path="route-optimizer" element={<RouteOptimizerPage />} />
  </>
);
