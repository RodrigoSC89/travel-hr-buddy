/**
 * REDIRECT: nautilus-voyage → voyage-command
 * PATCH UNIFY-12.0 - Fusão dos módulos de viagem
 */
import { Navigate } from "react-router-dom";
export default function NautilusVoyageRedirect() {
  return <Navigate to="/voyage-command" replace />;
}
