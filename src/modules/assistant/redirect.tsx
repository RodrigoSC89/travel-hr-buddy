/**
 * REDIRECT: assistant → nautilus-assistant
 * Este módulo foi fundido no Nautilus Assistant
 */
import { Navigate } from "react-router-dom";
export default function AssistantRedirect() {
  return <Navigate to="/nautilus-assistant" replace />;
}
