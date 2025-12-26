import { Navigate } from "react-router-dom";

// PATCH UNIFY-COMMAND: Redirect para o Nautilus Command Center unificado
export default function ExecutiveDashboard() {
  return <Navigate to="/nautilus-command" replace />;
}
