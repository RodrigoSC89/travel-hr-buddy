/**
 * DEPRECATED: Predictive Analytics module
 * Redirects to unified Analytics Command Center
 */
import { Navigate } from "react-router-dom";

const PredictiveAnalyticsPage = () => {
  return <Navigate to="/analytics-command" replace />;
});

export default PredictiveAnalyticsPage;