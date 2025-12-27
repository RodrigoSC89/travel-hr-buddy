import { Navigate } from "react-router-dom";

/**
 * PATCH UNIFY-FINAL: Command Center redirecionado para Nautilus Command Center
 * 
 * Este módulo foi unificado com:
 * - Dashboard Executivo
 * - Centro de Operações
 * - Nautilus Command
 * 
 * O novo ponto de entrada é /nautilus-command
 */
export default function CommandCenter() {
  return <Navigate to="/nautilus-command" replace />;
}
