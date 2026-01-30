/**
 * REDIRECT: document-hub → nautilus-documents
 * Este módulo foi fundido no Nautilus Documents
 */
import { Navigate } from "react-router-dom";
export default function DocumentHubRedirect() {
  return <Navigate to="/nautilus-documents" replace />;
}
