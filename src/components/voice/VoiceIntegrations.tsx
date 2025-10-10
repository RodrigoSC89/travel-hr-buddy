import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plane,
  Users,
  TrendingUp,
  FileText,
  Building,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface VoiceIntegration {
  module: string;
  name: string;
  icon: React.ElementType;
  description: string;
  isConnected: boolean;
  actions: string[];
  status: "active" | "inactive" | "error";
}

interface VoiceIntegrationsProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

const integrations: VoiceIntegration[] = [
  {
    module: "hr",
    name: "Recursos Humanos",
    icon: Users,
    description: "Gestão de funcionários e certificados",
    isConnected: true,
    actions: ["Consultar certificados", "Buscar funcionário", "Verificar vencimentos"],
    status: "active",
  },
  {
    module: "travel",
    name: "Módulo de Viagens",
    icon: Plane,
    description: "Busca de voos e hotéis",
    isConnected: true,
    actions: ["Buscar voos", "Encontrar hotéis", "Verificar preços"],
    status: "active",
  },
  {
    module: "price-alerts",
    name: "Alertas de Preço",
    icon: TrendingUp,
    description: "Monitoramento de preços",
    isConnected: true,
    actions: ["Criar alerta", "Ver estatísticas", "Configurar notificações"],
    status: "active",
  },
  {
    module: "reports",
    name: "Relatórios",
    icon: FileText,
    description: "Análises e dashboards",
    isConnected: false,
    actions: ["Gerar relatório", "Ver métricas", "Exportar dados"],
    status: "inactive",
  },
  {
    module: "dashboard",
    name: "Dashboard Principal",
    icon: Building,
    description: "Visão geral do sistema",
    isConnected: true,
    actions: ["Ver resumo", "Abrir módulos", "Verificar status"],
    status: "active",
  },
];

const VoiceIntegrations: React.FC<VoiceIntegrationsProps> = ({ isOpen, onClose, onNavigate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "inactive":
        return "bg-muted";
      case "error":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "error":
        return "Erro";
      default:
        return "Desconhecido";
    }
  };

  const activeIntegrations = integrations.filter(i => i.isConnected).length;
  const totalIntegrations = integrations.length;
  const connectivityPercentage = (activeIntegrations / totalIntegrations) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Integrações do Sistema</h3>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Connectivity Overview */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status de Conectividade</span>
            <Badge variant={connectivityPercentage > 80 ? "default" : "secondary"}>
              {activeIntegrations}/{totalIntegrations} módulos ativos
            </Badge>
          </div>
          <Progress value={connectivityPercentage} className="h-2" />
          <div className="text-sm text-muted-foreground">
            O assistente de voz pode interagir com {activeIntegrations} dos {totalIntegrations}{" "}
            módulos disponíveis.
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(integration => {
            const IconComponent = integration.icon;

            return (
              <Card key={integration.module} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                    <span className="text-xs text-muted-foreground">
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Comandos de Voz:</div>
                  <div className="flex flex-wrap gap-1">
                    {integration.actions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        "{action}"
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(integration.module)}
                    disabled={!integration.isConnected}
                    className="flex-1"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Abrir Módulo
                  </Button>
                  {integration.isConnected && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="border-t pt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Como usar integrações por voz:
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• "Abrir recursos humanos" - Navega para o módulo de RH</p>
              <p>• "Buscar voos para São Paulo" - Abre busca de viagens</p>
              <p>• "Criar alerta de preço" - Configura monitoramento</p>
              <p>• "Mostrar dashboard" - Retorna à página principal</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VoiceIntegrations;
