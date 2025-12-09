/**
 * DEPRECATED: Redirecionado para Weather Command Center
 * PATCH UNIFY-10.0
 */
import { Navigate } from "react-router-dom";

export default function ForecastConsole() {
  return <Navigate to="/weather-command" replace />;
}
