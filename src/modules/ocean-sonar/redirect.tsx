/**
 * REDIRECT: ocean-sonar → /ocean-sonar (main route)
 * Fallback redirect for legacy module references
 */
import { Navigate } from "react-router-dom";
export default function OceanSonarRedirect() {
  return <Navigate to="/ocean-sonar" replace />;
}
