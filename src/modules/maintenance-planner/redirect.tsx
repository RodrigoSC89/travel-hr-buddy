/**
 * REDIRECT: maintenance-planner → maintenance-command
 * Este módulo foi fundido no Maintenance Command Center
 * PATCH UNIFY-3.0
 */
import { Navigate } from "react-router-dom";

export default function MaintenancePlannerRedirect() {
  return <Navigate to="/maintenance-command" replace />;
}
