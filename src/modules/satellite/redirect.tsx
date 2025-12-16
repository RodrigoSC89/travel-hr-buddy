/**
 * REDIRECT: satellite → nautilus-satellite
 * Este módulo foi fundido no Nautilus Satellite
 */
import { Navigate } from "react-router-dom";
export default function SatelliteRedirect() {
  return <Navigate to="/nautilus-satellite" replace />;
}
