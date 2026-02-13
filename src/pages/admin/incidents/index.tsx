/**
 * Incidents Page - Redirect to Documents
 * Incident reports module was merged into Nautilus Documents
 */
import { Navigate } from "react-router-dom";

const IncidentsPage: React.FC = () => {
  return <Navigate to="/documents" replace />;
};

export default IncidentsPage;
