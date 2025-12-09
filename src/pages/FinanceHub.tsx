/**
 * REDIRECT: FinanceHub → Finance Command Center
 * PATCH UNIFY-FINANCE - Merged into unified module
 */
import { Navigate } from "react-router-dom";

export default function FinanceHub() {
  return <Navigate to="/finance-command" replace />;
}
