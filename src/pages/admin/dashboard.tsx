"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Eye } from "lucide-react";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get("public") === "1";
  
  const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
  const [cronMessage, setCronMessage] = useState("");

  useEffect(() => {
    fetch("/api/cron-status")
      .then(async res => {
        const contentType = res.headers.get("content-type");
        // If we get HTML instead of JSON, we're in dev mode without backend
        if (contentType && contentType.includes("text/html")) {
          // Use mock data for development
          return {
            status: "ok",
            message: "Cron diário executado com sucesso nas últimas 24h (Dev Mode)"
          };
        }
        return res.json();
      })
      .then(data => {
        setCronStatus(data.status);
        setCronMessage(data.message);
      })
      .catch(error => {
        logger.error("Error fetching cron status:", error);
        setCronStatus("warning");
        setCronMessage("Erro ao carregar status do cron");
      });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {isPublic && <Eye className="inline w-6 h-6 mr-2" />}
        🚀 Painel Administrativo — Nautilus One
      </h1>

      {/* Badge de Status do Cron */}
      {cronStatus && (
        <Card className={`p-4 text-sm font-medium ${cronStatus === "ok" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {cronStatus === "ok" ? "✅ " : "⚠️ "}{cronMessage}
        </Card>
      )}

      {/* Dashboard widgets with role-based access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Checklists - Admin, Manager, HR Manager */}
        <RoleBasedAccess roles={["admin", "hr_manager", "manager"]} showFallback={false}>
          <Card className="p-4">📋 Checklists</Card>
        </RoleBasedAccess>

        {/* Card 2: IA Assistant - Admin, Manager, HR Manager */}
        <RoleBasedAccess roles={["admin", "hr_manager", "manager"]} showFallback={false}>
          <Card className="p-4">🤖 Assistente IA</Card>
        </RoleBasedAccess>

        {/* Card 3: Personal Restorations - All users */}
        <Card className="p-4">📄 Restaurações Pessoais</Card>

        {/* Card 4: Analytics - Admin only */}
        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">📊 Analytics</Card>
        </RoleBasedAccess>

        {/* Card 5: Settings - Admin only */}
        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">⚙️ Configurações</Card>
        </RoleBasedAccess>

        {/* Card 6: User Management - Admin only */}
        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">👥 Gerenciamento de Usuários</Card>
        </RoleBasedAccess>
      </div>

      {/* Public view indicator */}
      {isPublic && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
            <Eye className="w-4 h-4" />
            <span className="font-medium">🔒 Modo público somente leitura</span>
          </div>
        </div>
      )}
    </div>
  );
}
