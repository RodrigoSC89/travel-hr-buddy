/**
 * PATCH 88.0 - Fallback page for missing/removed routes
 * 
 * This component provides user-friendly feedback when accessing
 * routes that have been moved, removed, or don't exist.
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MissingRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Rota não encontrada
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          O módulo ou página que você está tentando acessar pode ter sido:
        </p>

        <ul className="text-left text-gray-600 dark:text-gray-400 mb-6 space-y-2">
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

        <div className="text-sm text-gray-500 dark:text-gray-500 mb-6 p-3 bg-gray-100 dark:bg-gray-700/50 rounded">
          <strong>Caminho solicitado:</strong>
          <br />
          <code className="text-xs">{location.pathname}</code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-600 mt-6">
          Se você acredita que isso é um erro, entre em contato com o suporte técnico.
        </p>
      </div>
    </div>
  );
}
