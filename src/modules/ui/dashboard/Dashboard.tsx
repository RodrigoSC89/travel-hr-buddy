import { Navigate } from "react-router-dom";

// Redirect para o Command Center unificado
export default function Dashboard() {
  return <Navigate to="/command-center" replace />;
}
