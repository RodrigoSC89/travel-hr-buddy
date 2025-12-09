/**
 * DEPRECATED: This module has been merged into Communication Command Center
 * Redirects to /communication-command
 */
import { Navigate } from "react-router-dom";

export default function NotificationsCenter() {
  return <Navigate to="/communication-command" replace />;
}
