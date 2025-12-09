/**
 * REDIRECT: Operations Dashboard → Operations Command Center
 * PATCH UNIFY-OPS - Merged into unified module
 */
import { Navigate } from "react-router-dom";

export default function OperationsDashboard() {
  return <Navigate to="/operations-command" replace />;
}
