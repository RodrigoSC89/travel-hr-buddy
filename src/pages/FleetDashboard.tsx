import { Navigate } from "react-router-dom";

// Redirect to unified Fleet Command Center
export default function FleetDashboard() {
  return <Navigate to="/fleet-command" replace />;
}
