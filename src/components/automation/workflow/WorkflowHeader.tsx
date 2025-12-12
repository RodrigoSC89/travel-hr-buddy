import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Bell, Settings, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowHeaderProps {
  onExport: () => void;
  onNewWorkflow: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onMarkAllRead: () => void;
  unreadCount?: number;
  isLoading?: boolean;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  onExport,
  onNewWorkflow,
  onRefresh,
  onSettings,
  onMarkAllRead,
  unreadCount = 0,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Automação de Workflows
        </h2>
        <p className="text-muted-foreground mt-1">
          Gerencie processos automatizados e fluxos de trabalho inteligentes
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-medium">Notificações</span>
              <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-auto py-1 px-2 text-xs">
                Marcar todas como lidas
              </Button>
            </div>
            <DropdownMenuSeparator />
            {unreadCount === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação pendente
              </div>
            ) : (
              <>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">Workflow concluído</span>
                    <span className="text-xs text-muted-foreground">Onboarding finalizado</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">Automação executada</span>
                    <span className="text-xs text-muted-foreground">12 despesas aprovadas</span>
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="outline" size="icon" onClick={onSettings}>
          <Settings className="h-4 w-4" />
        </Button>

        {/* Refresh */}
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        {/* Export */}
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>

        {/* New Workflow */}
        <Button onClick={onNewWorkflow} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>
    </div>
  );
};
