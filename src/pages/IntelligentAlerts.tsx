/**
 * DEPRECATED: Intelligent Alerts module
 * Redirects to unified Alerts Command Center
 */
import { Navigate } from "react-router-dom";

export default function IntelligentAlerts() {
  return <Navigate to="/alerts-command" replace />;
}