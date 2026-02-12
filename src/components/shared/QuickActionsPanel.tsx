/**
 * Quick Actions Panel
 * Provides quick access to common actions across modules
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Upload, 
  FileText, 
  Users, 
  Ship, 
  Wrench, 
  Bell, 
  Calendar,
  MessageSquare,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  color?: string;
}

export function QuickActionsPanel() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: "new-document",
      label: "Novo Documento",
      icon: FileText,
      action: () => navigate("/documents"),
      color: "text-primary"
    },
    {
      id: "add-crew",
      label: "Adicionar Tripulante",
      icon: Users,
      action: () => navigate("/maritime-command"),
      color: "text-success"
    },
    {
      id: "new-maintenance",
      label: "Nova Manutenção",
      icon: Wrench,
      action: () => navigate("/maintenance-command"),
      color: "text-warning"
    },
    {
      id: "fleet-status",
      label: "Status da Frota",
      icon: Ship,
      action: () => navigate("/fleet-command"),
      color: "text-accent"
    },
    {
      id: "schedule-event",
      label: "Agendar Evento",
      icon: Calendar,
      action: () => navigate("/operational-calendar"),
      color: "text-accent"
    },
    {
      id: "send-message",
      label: "Enviar Mensagem",
      icon: MessageSquare,
      action: () => navigate("/communication-command"),
      color: "text-info"
    },
    {
      id: "upload-file",
      label: "Upload Arquivo",
      icon: Upload,
      action: () => {
        toast.info("Selecione um módulo para fazer upload");
        navigate("/documents");
      },
      color: "text-warning"
    },
    {
      id: "search",
      label: "Buscar",
      icon: Search,
      action: () => {
        toast.info("Use Ctrl+K para buscar");
      },
      color: "text-muted-foreground"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={action.action}
              >
                <Icon className={`h-5 w-5 ${action.color || ""}`} />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActionsPanel;
