/**
 * REDIRECT: ocean-sonar → subsea-operations
 * Este módulo foi fundido no Subsea Operations
 */
import { Navigate } from "react-router-dom";
export default function OceanSonarRedirect() {
  return <Navigate to="/subsea-operations" replace />;
}
