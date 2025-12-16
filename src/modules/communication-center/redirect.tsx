/**
 * REDIRECT: communication-center → nautilus-comms
 * Este módulo foi fundido no Nautilus Comms
 */
import { Navigate } from "react-router-dom";
export default function CommunicationCenterRedirect() {
  return <Navigate to="/nautilus-comms" replace />;
}
