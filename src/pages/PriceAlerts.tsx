/**
 * DEPRECATED: Price Alerts module
 * Redirects to unified Alerts Command Center
 */
import { Navigate } from "react-router-dom";

const PriceAlerts = () => {
  return <Navigate to="/alerts-command" replace />;
});

export default PriceAlerts;