/**
 * REDIRECT: communication → nautilus-comms
 */
import { Navigate } from "react-router-dom";
export default function CommunicationRedirect() {
  return <Navigate to="/nautilus-comms" replace />;
}
