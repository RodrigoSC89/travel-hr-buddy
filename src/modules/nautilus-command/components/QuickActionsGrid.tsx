/**
 * Quick Actions Grid - Grid de ações rápidas funcionais
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus, FileText, Calendar, Send, Download, Settings,
  Ship, Users, Wrench, Package, Shield, Brain,
  Phone, Truck, ShoppingCart, UserPlus, Eye,
  ClipboardList, AlertTriangle, TrendingUp
} from "lucide-react";

interface QuickActionsGridProps {
  context?: any;
  onContactClick?: () => void;
  onReorderClick?: () => void;
  onCreateOrderClick?: () => void;
}

export function QuickActionsGrid({
  context,
  onContactClick,
  onReorderClick,
  onCreateOrderClick
}: QuickActionsGridProps) {
  const navigate = useNavigate();

  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      toast.info("Abrindo comunicação...", {
        description: "Redirecionando para o centro de comunicação"
      });
      navigate("/communication-center");
    }
  };

  const handleReorder = () => {
    if (onReorderClick) {
      onReorderClick();
    } else {
      toast.info("Solicitação de reposição", {
        description: "Abrindo formulário de reposição de estoque"
      });
      navigate("/procurement-inventory");
    }
  };

  const handleCreateOrder = () => {
    if (onCreateOrderClick) {
      onCreateOrderClick();
    } else {
      toast.success("Criar pedido", {
        description: "Abrindo formulário de novo pedido"
      });
      navigate("/procurement-inventory");
    }
  };

  const actions = [
    {
      icon: <Plus className="h-4 w-4" />,
      label: "Nova Requisição",
      onClick: () => navigate("/procurement-inventory"),
      color: "bg-green-500 hover:bg-green-600",
      badge: null
    },
    {
      icon: <Wrench className="h-4 w-4" />,
      label: "Agendar Manutenção",
      onClick: () => navigate("/maintenance-command"),
      color: "bg-orange-500 hover:bg-orange-600",
      badge: context?.maintenance?.overdue > 0 ? context.maintenance.overdue : null
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Gerar Relatório",
      onClick: () => {
        toast.info("Gerando relatório...", {
          description: "Preparando relatório operacional"
        });
        navigate("/analytics");
      },
      color: "bg-blue-500 hover:bg-blue-600",
      badge: null
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Ver Calendário",
      onClick: () => navigate("/calendar"),
      color: "bg-purple-500 hover:bg-purple-600",
      badge: null
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Gestão Tripulação",
      onClick: () => navigate("/crew-management"),
      color: "bg-teal-500 hover:bg-teal-600",
      badge: context?.crew?.expiringCerts > 0 ? context.crew.expiringCerts : null
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Auditorias",
      onClick: () => navigate("/audit-center"),
      color: "bg-cyan-500 hover:bg-cyan-600",
      badge: context?.compliance?.pendingAudits > 0 ? context.compliance.pendingAudits : null
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: "Contatar",
      onClick: handleContact,
      color: "bg-indigo-500 hover:bg-indigo-600",
      badge: null
    },
    {
      icon: <Truck className="h-4 w-4" />,
      label: "Solicitar Reposição",
      onClick: handleReorder,
      color: "bg-amber-500 hover:bg-amber-600",
      badge: context?.inventory?.lowStock > 0 ? context.inventory.lowStock : null
    },
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: "Criar Pedido",
      onClick: handleCreateOrder,
      color: "bg-pink-500 hover:bg-pink-600",
      badge: null
    },
    {
      icon: <Eye className="h-4 w-4" />,
      label: "Seguir/Monitorar",
      onClick: () => {
        toast.info("Monitoramento ativo", {
          description: "Abrindo painel de monitoramento em tempo real"
        });
        navigate("/fleet-operations");
      },
      color: "bg-slate-500 hover:bg-slate-600",
      badge: null
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Ver Detalhes",
      onClick: () => {
        toast.info("Detalhes da operação", {
          description: "Exibindo visão detalhada do sistema"
        });
      },
      color: "bg-gray-500 hover:bg-gray-600",
      badge: null
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Simular Cenário",
      onClick: () => {
        toast.info("Simulador de cenários", {
          description: "Abrindo ferramenta de simulação What-If"
        });
      },
      color: "bg-rose-500 hover:bg-rose-600",
      badge: null
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1 hover:border-primary relative"
              onClick={action.onClick}
            >
              <div className={`p-1.5 rounded-md text-white ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-[10px] text-center leading-tight">{action.label}</span>
              {action.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
                >
                  {action.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
