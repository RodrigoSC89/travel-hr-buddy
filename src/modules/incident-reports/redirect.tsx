/**
 * REDIRECT: incident-reports → /reports-command
 * Este módulo foi fundido no Reports Command Center
 */
import { Navigate } from "react-router-dom";
export default function IncidentReportsRedirect() {
  return <Navigate to="/reports-command" replace />;
}
