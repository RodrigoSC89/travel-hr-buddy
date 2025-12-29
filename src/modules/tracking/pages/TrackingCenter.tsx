/**
 * DGNSS & Precision Tracking - Main Router
 */
import { Routes, Route } from "react-router-dom";
import TrackingDashboard from "./TrackingDashboard";
import GnssLive from "./GnssLive";
import TrackingAlerts from "./TrackingAlerts";

export default function TrackingCenter() {
  return (
    <Routes>
      <Route index element={<TrackingDashboard />} />
      <Route path="dashboard" element={<TrackingDashboard />} />
      <Route path="gnss-live" element={<GnssLive />} />
      <Route path="*" element={<TrackingAlerts />} />
    </Routes>
  );
}
