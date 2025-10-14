"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { logger } from "@/lib/logger";
import {
  CheckSquare,
  Package,
  Bot,
  BarChart3,
  FileText,
  Tv,
  ArrowRight,
  Clock,
  Eye,
  Settings,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  const dashboardCards = [
    {
      title: "Checklists",
      description: "Progresso e status por equipe",
      icon: CheckSquare,
      color: "blue",
      path: "/admin/checklists/dashboard",
      roles: ["admin", "hr_manager", "manager"] as const,
    },
    {
      title: "Assistente IA",
      description: "Consultas recentes e exportações",
      icon: Bot,
      color: "indigo",
      path: "/admin/assistant/history",
      roles: ["admin", "hr_manager", "manager"] as const,
    },
    {
      title: "Restaurações Pessoais",
      description: "Painel diário pessoal com gráficos",
      icon: Package,
      color: "purple",
      path: "/admin/restore/personal",
      roles: ["admin", "hr_manager", "manager", "employee"] as const,
    },
    {
      title: "Analytics",
      description: "Análise completa de dados e métricas",
      icon: BarChart3,
      color: "green",
      path: "/admin/analytics",
      roles: ["admin"] as const,
    },
    {
      title: "Configurações",
      description: "Painel de controle do sistema",
      icon: Settings,
      color: "orange",
      path: "/admin/control-panel",
      roles: ["admin"] as const,
    },
    {
      title: "Gestão de Usuários",
      description: "Gerenciar usuários e permissões",
      icon: Users,
      color: "teal",
      path: "/admin",
      roles: ["admin"] as const,
    },
  ];

  const quickLinks = [
    {
      title: "Dashboard de Restaurações Completo",
      path: "/admin/documents/restore-dashboard",
      icon: BarChart3,
    },
    {
      title: "Logs Detalhados de IA",
      path: "/admin/assistant/logs",
      icon: FileText,
    },
    {
      title: "Relatórios e Analytics",
      path: "/admin/reports/restore-analytics",
      icon: BarChart3,
    },
    {
      title: "Visualização TV Panel",
      path: "/tv/logs",
      icon: Tv,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isPublic && <Eye className="inline w-8 h-8 mr-2" />}
          🚀 Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-2">
          Central de controle e monitoramento — Nautilus One
        </p>
      </div>

      {/* Cron Status Badge */}
      {cronStatus && (
        <Badge
          variant={cronStatus === "ok" ? "default" : "secondary"}
          className={`px-4 py-2 text-sm ${
            cronStatus === "ok"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          {cronStatus === "ok" ? "✅ " : "⚠️ "}
          {cronMessage}
        </Badge>
      )}

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: { border: "border-l-blue-500", text: "text-blue-500" },
            purple: { border: "border-l-purple-500", text: "text-purple-500" },
            indigo: { border: "border-l-indigo-500", text: "text-indigo-500" },
            green: { border: "border-l-green-500", text: "text-green-500" },
            orange: { border: "border-l-orange-500", text: "text-orange-500" },
            teal: { border: "border-l-teal-500", text: "text-teal-500" },
          };
          const colors = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <RoleBasedAccess key={card.path} roles={card.roles} showFallback={false}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${colors.border}`}
                onClick={() => navigate(card.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </RoleBasedAccess>
          );
        })}
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Atalhos Rápidos</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => navigate(link.path)}
                >
                  <Icon className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span className="text-left">{link.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Public View Indicator */}
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
