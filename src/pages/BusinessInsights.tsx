/**
 * REDIRECT: Business Insights → Operations Command Center
 * PATCH UNIFY-OPS - Merged into unified module
 */
import { Navigate } from "react-router-dom";

export default function BusinessInsights() {
  return <Navigate to="/operations-command" replace />;
}
