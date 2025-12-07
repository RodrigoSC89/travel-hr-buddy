/**
 * Quick Actions Panel - Ações rápidas do sistema
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Calendar, Send, Download, Settings,
  Ship, Users, Wrench, Package, Shield, Brain
} from "lucide-react";

export const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <Plus className="h-4 w-4" />,
      label: "Nova Requisição",
      onClick: () => navigate("/procurement-inventory"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: <Wrench className="h-4 w-4" />,
      label: "Agendar Manutenção",
      onClick: () => navigate("/intelligent-maintenance"),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Gerar Relatório",
      onClick: () => {},
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Ver Calendário",
      onClick: () => navigate("/calendar"),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Gestão de Tripulação",
      onClick: () => navigate("/crew-management"),
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Auditorias",
      onClick: () => navigate("/audit-center"),
      color: "bg-cyan-500 hover:bg-cyan-600"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1 hover:border-primary"
              onClick={action.onClick}
            >
              <div className={`p-1.5 rounded-md text-white ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
