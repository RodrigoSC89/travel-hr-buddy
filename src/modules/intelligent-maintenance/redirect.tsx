/**
 * REDIRECT: intelligent-maintenance → nautilus-maintenance
 * Este módulo foi fundido no Nautilus Maintenance
 */
import { Navigate } from "react-router-dom";
export default function IntelligentMaintenanceRedirect() {
  return <Navigate to="/nautilus-maintenance" replace />;
}
