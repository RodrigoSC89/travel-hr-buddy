import { useEffect, useState, useCallback } from "react";;
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, RefreshCw, Radio } from "lucide-react";
import { LiveDecisionMap } from "./components/LiveDecisionMap";
import { DPStatusCard } from "./components/DPStatusCard";
import { RiskAlertPanel } from "./components/RiskAlertPanel";
import { useBridgeLinkData } from "./hooks/useBridgeLinkData";
import { connectToLiveStream, exportReportJSON } from "./services/bridge-link-api";

/**
 * BridgeLink Dashboard
 * Painel Vivo de Operação com IA contextual
 * 
 * Centraliza dados de navegação, ASOG, FMEA e DP
 * Interpreta eventos em tempo real via NautilusBrain
 */
export default function BridgeLinkDashboard() {
  const { dpEvents, riskAlerts, systemStatus, loading, error, refetch } = useBridgeLinkData();
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveEventCount, setLiveEventCount] = useState(0);

  // Connect to WebSocket for live updates
  useEffect(() => {
    if (!isLiveMode) return;

    const cleanup = connectToLiveStream((event) => {
      setLiveEventCount((prev) => prev + 1);
      toast.info(`Novo evento DP: ${event.type || "Desconhecido"}`, {
        description: event.description || "Evento do DP Intelligence Center",
        duration: 3000,
      });
  });

    return cleanup;
  }, [isLiveMode]);

  const handleExportJSON = () => {
    try {
      const jsonData = exportReportJSON({ dpEvents, riskAlerts, status: systemStatus });
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bridgelink-report-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Falha ao exportar relatório");
    }
  };

  const handleRefresh = async () => {
    toast.info("Atualizando dados...");
    await refetch();
    toast.success("Dados atualizados!");
  });

  const toggleLiveMode = () => {
    setIsLiveMode((prev) => !prev);
    if (!isLiveMode) {
      setLiveEventCount(0);
      toast.success("Modo Live Watch ativado");
    } else {
      toast.info("Modo Live Watch desativado");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 font-semibold mb-2">Erro ao carregar dados</p>
              <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🧭 BridgeLink — Painel Integrado
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoramento em tempo real de sistemas DP, ASOG, FMEA e navegação
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            onClick={toggleLiveMode}
            className="gap-2"
          >
            <Radio className={`h-4 w-4 ${isLiveMode ? "animate-pulse" : ""}`} />
            Live Watch
            {isLiveMode && liveEventCount > 0 && (
              <Badge variant="secondary">{liveEventCount}</Badge>
            )}
          </Button>

          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {loading && dpEvents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-muted-foreground">Carregando dados do BridgeLink...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DPStatusCard status={systemStatus} />
            <RiskAlertPanel alerts={riskAlerts} />
            <LiveDecisionMap events={dpEvents} />
          </div>

          {/* Integration Info */}
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{dpEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Eventos DP</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{riskAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Alertas de Risco</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLiveMode ? "🟢" : "🔴"}</p>
                  <p className="text-xs text-muted-foreground">WebSocket Status</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dpEvents.filter((e) => e.severity === "critical").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Notes */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">🔗 Integrações Ativas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-green-500/10">✓</Badge>
                  <div>
                    <p className="font-medium">DP Intelligence Center</p>
                    <p className="text-xs text-muted-foreground">Eventos e análises DP em tempo real</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-green-500/10">✓</Badge>
                  <div>
                    <p className="font-medium">SGSO Logs</p>
                    <p className="text-xs text-muted-foreground">Logs de operações e incidentes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10">⚠</Badge>
                  <div>
                    <p className="font-medium">NautilusBrain AI</p>
                    <p className="text-xs text-muted-foreground">Análise semântica de eventos (em desenvolvimento)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10">⚠</Badge>
                  <div>
                    <p className="font-medium">FMEA System</p>
                    <p className="text-xs text-muted-foreground">Análise de modos de falha (planejado)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
