"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Eye } from "lucide-react";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const isPublicView = searchParams.get("public") === "1";
  
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
        console.error("Error fetching cron status:", error);
        setCronStatus("warning");
        setCronMessage("Erro ao carregar status do cron");
      });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {isPublicView && <Eye className="inline w-6 h-6 mr-2" />}
        🚀 Painel Administrativo — Nautilus One
      </h1>

      {/* Badge de Status do Cron */}
      {cronStatus && (
        <Card className={`p-4 text-sm font-medium ${cronStatus === "ok" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {cronStatus === "ok" ? "✅ " : "⚠️ "}{cronMessage}
        </Card>
      )}

      {/* Dashboard Cards with Role-Based Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Checklists - Admin and Gestor */}
        <RoleBasedAccess roles={["admin", "hr_manager", "manager"]} showFallback={false}>
          <Card className="p-4">📋 Checklists</Card>
        </RoleBasedAccess>

        {/* IA Assistant - Admin and Gestor */}
        <RoleBasedAccess roles={["admin", "hr_manager", "manager"]} showFallback={false}>
          <Card className="p-4">💬 Assistente IA</Card>
        </RoleBasedAccess>

        {/* Personal Restorations - All users */}
        <Card className="p-4">🔄 Restaurações Pessoais</Card>

        {/* Admin-only cards */}
        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">📊 Analytics</Card>
        </RoleBasedAccess>

        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">⚙️ System Settings</Card>
        </RoleBasedAccess>

        <RoleBasedAccess roles={["admin"]} showFallback={false}>
          <Card className="p-4">👥 User Management</Card>
        </RoleBasedAccess>
      </div>

      {/* Public view indicator */}
      {isPublicView && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              🔒 Modo público somente leitura
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
