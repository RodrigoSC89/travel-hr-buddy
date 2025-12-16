/**
 * SystemMonitor Redirect  
 * PATCH 990: Module merged into SystemHub
 */
import { Navigate } from "react-router-dom";

export default function SystemMonitor() {
  return <Navigate to="/system-hub" replace />;
}
