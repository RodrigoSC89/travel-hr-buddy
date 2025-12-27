import { Navigate } from "react-router-dom";

// PATCH UNIFY-FINAL: Redirect para o Nautilus Command Center unificado
export default function Dashboard() {
  return <Navigate to="/nautilus-command" replace />;
}
