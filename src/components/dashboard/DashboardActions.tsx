/**
import { useCallback, useState } from "react";;
 * Dashboard Actions Component
 * Provides functional action buttons for the dashboard
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Download,
  FileText,
  RefreshCw,
  Plus,
  Settings,
  Bell,
  Calendar,
  MoreHorizontal,
  Printer,
  Share2,
  Filter,
  BarChart3,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface DashboardActionsProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({ 
  onRefresh, 
  isRefreshing = false 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>("");

  const handleExport = useCallback(async (type: string) => {
    setExportType(type);
    setIsExporting(true);

    try {
      // Fetch data for export
      const { data: vessels } = await supabase.from("vessels").select("*");
      const { data: crew } = await supabase.from("crew_members").select("*");
      const { data: checklists } = await supabase.from("operational_checklists").select("*").limit(100);

      let content = "";
      let filename = "";

      if (type === "csv") {
        // Create CSV content
        const headers = ["Tipo", "Nome", "Status", "Atualizado em"];
        const rows = [
          ...(vessels || []).map((v: unknown) => ["Embarcação", v.name || "-", v.status || "-", v.updated_at || "-"]),
          ...(crew || []).map((c: unknown) => ["Tripulante", c.full_name || "-", c.status || "-", c.updated_at || "-"]),
          ...(checklists || []).map((c: unknown) => ["Checklist", c.title || "-", c.status || "-", c.updated_at || "-"])
        ];

        content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        filename = `dashboard-export-${new Date().toISOString().split("T")[0]}.csv`;
      } else if (type === "json") {
        content = JSON.stringify({ vessels, crew, checklists }, null, 2);
        filename = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
      }

      // Download file
      const blob = new Blob([content], { type: type === "csv" ? "text/csv" : "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: `Dados exportados como ${type.toUpperCase()}`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  }, [toast]);

  const handlePrint = useCallback(() => {
    toast({
      title: "Preparando impressão",
      description: "Abrindo visualização para impressão..."
    };
    setTimeout(() => window.print(), 500);
  }, [toast]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "Dashboard Nautilus One",
      text: "Confira o dashboard executivo do Nautilus One",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado",
          description: "O link foi copiado para a área de transferência"
        };
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [toast]);

  const quickActions = [
    { icon: Plus, label: "Nova Missão", action: () => navigate("/mission-logs") },
    { icon: FileText, label: "Novo Relatório", action: () => navigate("/reports") },
    { icon: Calendar, label: "Agendar", action: () => navigate("/calendar") },
    { icon: Bell, label: "Notificações", action: () => navigate("/notifications-center") },
  ];

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Ações do Dashboard
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Última atualização: {new Date().toLocaleTimeString("pt-BR")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>

            {/* Quick Actions */}
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mais ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSetIsExportDialogOpen}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlenavigate}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlenavigate}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Dados do Dashboard</DialogTitle>
            <DialogDescription>
              Escolha o formato para exportação dos dados
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handlehandleExport}
              disabled={isExporting}
            >
              {isExporting && exportType === "csv" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-8 w-8" />
              )}
              <span>CSV</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handlehandleExport}
              disabled={isExporting}
            >
              {isExporting && exportType === "json" ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <FileText className="h-8 w-8" />
              )}
              <span>JSON</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleSetIsExportDialogOpen}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardActions;
