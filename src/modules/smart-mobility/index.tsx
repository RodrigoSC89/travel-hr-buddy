/**
 * DEPRECATED: Este módulo foi fundido no Travel Command Center
 * Redireciona para /travel-command
 */
import { useEffect, useCallback } from "react";;;
import { useNavigate } from "react-router-dom";

export default function SmartMobility() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/travel-command", { replace: true });
  }, [navigate]);

  return null;
}