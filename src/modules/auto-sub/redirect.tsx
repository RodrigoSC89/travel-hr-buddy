/**
 * REDIRECT: auto-sub → subsea-operations
 * Este módulo foi fundido no Subsea Operations
 */
import { Navigate } from "react-router-dom";
export default function AutoSubRedirect() {
  return <Navigate to="/subsea-operations" replace />;
}
