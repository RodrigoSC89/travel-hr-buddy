/**
 * REDIRECT: MMI → maintenance-command
 * Este módulo foi fundido no Maintenance Command Center
 * PATCH UNIFY-3.0
 */
import { Navigate } from "react-router-dom";

export default function MMI() {
  return <Navigate to="/maintenance-command" replace />;
}
