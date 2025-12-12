/**
 * DEPRECATED: Analytics Core module
 * Redirects to unified Analytics Command Center
 */
import { Navigate } from "react-router-dom";

const Analytics = () => {
  return <Navigate to="/analytics-command" replace />;
});

export default Analytics;
