/**
 * REDIRECT: satellite-tracker → nautilus-satellite
 */
import { Navigate } from "react-router-dom";
export default function SatelliteTrackerRedirect() {
  return <Navigate to="/nautilus-satellite" replace />;
}
