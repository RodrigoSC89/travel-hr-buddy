/**
 * DEPRECATED: Este módulo foi fundido no Procurement Command Center
 * Redireciona para /procurement-command
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProcurementInventory() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/procurement-command", { replace: true });
  }, [navigate]);

  return null;
}