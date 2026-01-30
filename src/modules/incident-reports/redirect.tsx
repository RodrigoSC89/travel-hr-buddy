/**
 * REDIRECT: incident-reports → nautilus-documents
 * Este módulo foi fundido no Nautilus Documents
 */
import { Navigate } from "react-router-dom";
export default function IncidentReportsRedirect() {
  return <Navigate to="/nautilus-documents" replace />;
}
