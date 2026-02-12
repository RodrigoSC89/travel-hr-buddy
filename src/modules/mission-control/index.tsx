/**
 * REDIRECT: mission-control → mission-command
 * Este módulo foi fundido no Mission Command Center
 * PATCH UNIFY-8.0
 */
import { Navigate } from "react-router-dom";

const MissionControl = () => {
  return <Navigate to="/ops?tab=mission" replace />;
};

export default MissionControl;
