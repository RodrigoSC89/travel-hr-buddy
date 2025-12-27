import { Navigate } from "react-router-dom";

/**
 * PATCH UNIFY-FINAL: Dashboard redirecionado para Nautilus Command Center
 * 
 * Este módulo foi unificado com:
 * - Command Center
 * - Dashboard Executivo
 * - Centro de Operações
 * 
 * O novo ponto de entrada é /nautilus-command
 */
export default function Dashboard() {
  return <Navigate to="/nautilus-command" replace />;
}
