import React from "react";
import { HealthStatusDashboard } from "@/components/admin/health-status-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Demo page to showcase the Health Status Monitoring Dashboard
 * This is a standalone page that doesn't require authentication
 */
const HealthMonitorDemo = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="h-8 w-8 text-primary" />
                  Dashboard de Monitoramento de Saúde
                </h1>
                <p className="text-muted-foreground mt-2">
                  Monitoramento em tempo real de APIs e recursos do sistema
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Demo Mode
            </Badge>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre este Dashboard</CardTitle>
              <CardDescription>
                Sistema de monitoramento de saúde implementado conforme SYSTEM_IMPROVEMENTS_2025.md
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Funcionalidades:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Monitoramento em tempo real de APIs (OpenAI, Supabase, Realtime)</li>
                  <li>Circuit breaker pattern com visualização de estado</li>
                  <li>Métricas de performance e tempo de resposta</li>
                  <li>Alertas automáticos para serviços degradados ou fora do ar</li>
                  <li>Taxa de sucesso e histórico de requisições</li>
                  <li>Controle manual de reset de circuit breakers</li>
                  <li>Estimativa de uso de recursos do sistema</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Health Status Dashboard */}
          <HealthStatusDashboard />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default HealthMonitorDemo;
