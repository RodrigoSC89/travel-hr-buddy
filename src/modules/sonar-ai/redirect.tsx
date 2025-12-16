/**
 * REDIRECT: sonar-ai → subsea-operations
 * Este módulo foi fundido no Subsea Operations
 */
import { Navigate } from "react-router-dom";
export default function SonarAIRedirect() {
  return <Navigate to="/subsea-operations" replace />;
}
