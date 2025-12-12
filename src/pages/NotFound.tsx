/**
 * PATCH 88.0 - Enhanced 404 page with better UX and logging
 * 
 * This component provides user-friendly feedback when accessing
 * routes that have been moved, removed, or don't exist.
 */

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";;;
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    logger.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl p-8 text-center border border-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Rota não encontrada
        </h1>

        <p className="text-muted-foreground mb-2">
          O módulo ou página que você está tentando acessar pode ter sido:
        </p>

        <ul className="text-left text-muted-foreground mb-6 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Movido para outro endereço</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Removido temporariamente para manutenção</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Desativado por questões de segurança ou estabilidade</span>
          </li>
        </ul>

        <div className="text-sm text-muted-foreground mb-6 p-3 bg-muted rounded">
          <strong>Caminho solicitado:</strong>
          <br />
          <code className="text-xs">{location.pathname}</code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => handlenavigate}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={() => handlenavigate}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Se você acredita que isso é um erro, entre em contato com o suporte técnico.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
