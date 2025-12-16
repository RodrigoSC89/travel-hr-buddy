/**
 * REDIRECT: maintenance-planner → nautilus-maintenance
 * Este módulo foi fundido no Nautilus Maintenance
 */
import { Navigate } from "react-router-dom";
export default function MaintenancePlannerRedirect() {
  return <Navigate to="/nautilus-maintenance" replace />;
}
