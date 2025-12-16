/**
 * DEPRECATED: Advanced Analytics module
 * Redirects to unified Analytics Command Center
 */
import { Navigate } from "react-router-dom";

export default function AdvancedAnalytics() {
  return <Navigate to="/analytics-command" replace />;
}