/**
 * REDIRECT: voyage-planner → voyage-command
 * PATCH UNIFY-12.0 - Fusão dos módulos de viagem
 */
import { Navigate } from "react-router-dom";
export default function VoyagePlannerRedirect() {
  return <Navigate to="/voyage-command" replace />;
}
