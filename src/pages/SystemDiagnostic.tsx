/**
 * SystemDiagnostic Redirect
 * PATCH 990: Module merged into SystemHub
 */
import { Navigate } from "react-router-dom";

export default function SystemDiagnostic() {
  return <Navigate to="/system-hub" replace />;
}
