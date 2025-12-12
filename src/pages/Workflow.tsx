/**
 * REDIRECT: Workflow → Workflow Command Center
 * PATCH UNIFY-12.0 - Este módulo foi fundido no Workflow Command Center
 */
import { Navigate } from "react-router-dom";

const WorkflowPage = () => {
  return <Navigate to="/workflow-command" replace />;
});

export default WorkflowPage;
