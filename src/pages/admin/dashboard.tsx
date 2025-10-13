// ✅ 3. Layout Unificado de Dashboards (Resumo visual em /admin/dashboard)
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Bot, BarChart3, ListChecks, History } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">🚀 Painel Administrativo — Nautilus One</h1>
        <p className="text-muted-foreground mt-1">
          Hub visual principal do sistema com acesso rápido aos dashboards
        </p>
      </div>

      {/* Badge de Status do Cron */}
      {cronStatus && (
        <Card className={`p-4 text-sm font-medium ${cronStatus === "ok" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"}`}>
          {cronStatus === "ok" ? "✅ " : "⚠️ "}{cronMessage}
        </Card>
      )}

      {/* ✅ 3. Painel de Dashboards Unificado - Cards com links diretos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Card 1: Checklists */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
          onClick={() => navigate("/admin/checklists/dashboard")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">✅ Checklists</CardTitle>
                <CardDescription className="text-sm">
                  Progresso e status por equipe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>Visualizar tarefas e pendências</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Análise de progresso por time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Restaurações Pessoais */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500/50"
          onClick={() => navigate("/admin/restore/personal")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">📦 Restaurações Pessoais</CardTitle>
                <CardDescription className="text-sm">
                  Seu painel diário com gráfico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Gráfico de atividade pessoal</span>
              </div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>Histórico de 15 dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Histórico de IA */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-indigo-500/50"
          onClick={() => navigate("/admin/assistant/history")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">🤖 Histórico de IA</CardTitle>
                <CardDescription className="text-sm">
                  Consultas recentes e exportações
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>Consultas e interações com IA</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Exportação de relatórios</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔗 Links Rápidos</CardTitle>
          <CardDescription>
            Acesso direto a outras funcionalidades administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/admin/documents/restore-dashboard")}
              className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm">📊 Dashboard Completo</div>
              <div className="text-xs text-muted-foreground mt-1">Restaurações gerais</div>
            </button>
            
            <button
              onClick={() => navigate("/admin/assistant/logs")}
              className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm">📜 Logs da IA</div>
              <div className="text-xs text-muted-foreground mt-1">Logs detalhados</div>
            </button>
            
            <button
              onClick={() => navigate("/admin/reports/assistant")}
              className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm">📈 Relatórios</div>
              <div className="text-xs text-muted-foreground mt-1">Análises e métricas</div>
            </button>
            
            <button
              onClick={() => navigate("/admin/wall")}
              className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm">🖥️ Painel TV</div>
              <div className="text-xs text-muted-foreground mt-1">Visualização em TV</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
