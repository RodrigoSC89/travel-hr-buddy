/**
 * REDIRECT: document-hub → /documents
 * Este módulo foi fundido no Documents
 */
import { Navigate } from "react-router-dom";
export default function DocumentHubRedirect() {
  return <Navigate to="/documents" replace />;
}
