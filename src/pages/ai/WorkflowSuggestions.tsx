/**
 * REDIRECT: Workflow Suggestions → Workflow Command Center
 * PATCH UNIFY-12.0 - Este módulo foi fundido no Workflow Command Center
 */
import { Navigate } from "react-router-dom";

export default function WorkflowSuggestions() {
  return <Navigate to="/workflow-command" replace />;
}
