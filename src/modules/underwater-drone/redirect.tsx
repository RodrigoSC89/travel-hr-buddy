/**
 * REDIRECT: underwater-drone → subsea-operations
 * Este módulo foi fundido no Subsea Operations
 */
import { Navigate } from "react-router-dom";
export default function UnderwaterDroneRedirect() {
  return <Navigate to="/subsea-operations" replace />;
}
