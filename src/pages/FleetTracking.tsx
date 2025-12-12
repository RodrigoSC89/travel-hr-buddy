import { Navigate } from "react-router-dom";

// Redirect to unified Fleet Command Center (tracking tab)
const FleetTracking = () => {
  return <Navigate to="/fleet-command" replace />;
});

export default FleetTracking;