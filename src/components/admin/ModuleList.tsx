import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, XCircle, Search, ExternalLink, Layers } from "lucide-react";
import { Link } from "react-router-dom";

interface Module {
  id: number;
  name: string;
  path: string;
  status: "functional" | "pending" | "disabled";
  description: string;
}

const modules: Module[] = [
  {
    id: 1,
    name: "Dashboard",
    path: "/dashboard",
    status: "functional",
    description: "Painel principal de controle",
  },
  {
    id: 2,
    name: "Sistema Marítimo",
    path: "/maritime",
    status: "functional",
    description: "Gestão de frotas e embarcações",
  },
  {
    id: 3,
    name: "IA e Inovação",
    path: "/innovation",
    status: "functional",
    description: "Centro de IA e inovação",
  },
  {
    id: 4,
    name: "Portal Funcionário",
    path: "/portal",
    status: "functional",
    description: "Portal de auto-atendimento",
  },
  {
    id: 5,
    name: "Viagens",
    path: "/travel",
    status: "functional",
    description: "Gestão de viagens",
  },
  {
    id: 6,
    name: "Alertas de Preços",
    path: "/price-alerts",
    status: "functional",
    description: "Monitoramento de preços",
  },
  {
    id: 7,
    name: "Hub Integrações",
    path: "/intelligence",
    status: "functional",
    description: "Hub de integrações e APIs",
  },
  {
    id: 8,
    name: "Reservas",
    path: "/reservations",
    status: "functional",
    description: "Sistema de reservas e booking",
  },
  {
    id: 9,
    name: "Comunicação",
    path: "/communication",
    status: "functional",
    description: "Centro de comunicação",
  },
  {
    id: 10,
    name: "Configurações",
    path: "/settings",
    status: "functional",
    description: "Configurações do sistema",
  },
  {
    id: 11,
    name: "Otimização",
    path: "/optimization",
    status: "functional",
    description: "Otimização de performance",
  },
  {
    id: 12,
    name: "Assistente de Voz",
    path: "/voice",
    status: "functional",
    description: "Assistente de voz",
  },
  {
    id: 13,
    name: "Centro Notificações",
    path: "/notifications",
    status: "pending",
    description: "Centro de notificações",
  },
  {
    id: 14,
    name: "Monitor Sistema",
    path: "/health-monitor",
    status: "functional",
    description: "Monitoramento do sistema",
  },
  {
    id: 15,
    name: "Documentos",
    path: "/documents",
    status: "pending",
    description: "Gestão de documentos",
  },
  {
    id: 16,
    name: "Colaboração",
    path: "/collaboration",
    status: "functional",
    description: "Ferramentas de colaboração",
  },
  {
    id: 17,
    name: "Otimização Mobile",
    path: "/mobile",
    status: "pending",
    description: "Otimização mobile",
  },
  {
    id: 18,
    name: "Checklists Inteligentes",
    path: "/checklists",
    status: "functional",
    description: "Checklists inteligentes",
  },
  {
    id: 19,
    name: "PEOTRAM",
    path: "/peotram",
    status: "functional",
    description: "Excelência operacional",
  },
  {
    id: 20,
    name: "PEO-DP",
    path: "/peo-dp",
    status: "functional",
    description: "Gestão de RH e pessoal",
  },
  {
    id: 21,
    name: "SGSO",
    path: "/sgso",
    status: "functional",
    description: "Sistema de gestão de saúde e segurança",
  },
  {
    id: 22,
    name: "Templates",
    path: "/templates",
    status: "pending",
    description: "Gestão de templates",
  },
  {
    id: 23,
    name: "Analytics Avançado",
    path: "/analytics",
    status: "functional",
    description: "Analytics avançado",
  },
  {
    id: 24,
    name: "Analytics Tempo Real",
    path: "/realtime",
    status: "pending",
    description: "Analytics em tempo real",
  },
  {
    id: 25,
    name: "Monitor Avançado",
    path: "/system-monitor",
    status: "pending",
    description: "Monitoramento avançado",
  },
  {
    id: 26,
    name: "Documentos IA",
    path: "/documents-ai",
    status: "pending",
    description: "Processamento de documentos com IA",
  },
  {
    id: 27,
    name: "Assistente IA",
    path: "/ai-assistant",
    status: "pending",
    description: "Assistente inteligente",
  },
  {
    id: 28,
    name: "Business Intelligence",
    path: "/bi",
    status: "pending",
    description: "Business Intelligence",
  },
  {
    id: 29,
    name: "Smart Workflow",
    path: "/workflow",
    status: "pending",
    description: "Automação de workflows",
  },
  {
    id: 30,
    name: "Centro de Ajuda",
    path: "/help",
    status: "pending",
    description: "Centro de ajuda",
  },
  {
    id: 31,
    name: "Automação IA",
    path: "/automation",
    status: "pending",
    description: "Automação com IA",
  },
  {
    id: 32,
    name: "Visão Geral",
    path: "/overview",
    status: "pending",
    description: "Visão geral executiva",
  },
];

export const ModuleList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "functional" | "pending" | "disabled">(
    "all"
  );

  const filteredModules = modules.filter(module => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || module.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: Module["status"]) => {
    switch (status) {
      case "functional":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "disabled":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: Module["status"]) => {
    switch (status) {
      case "functional":
        return <Badge className="bg-success/20 text-success border-success/30">Funcional</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pendente</Badge>;
      case "disabled":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            Desabilitado
          </Badge>
        );
    }
  };

  const stats = {
    functional: modules.filter(m => m.status === "functional").length,
    pending: modules.filter(m => m.status === "pending").length,
    disabled: modules.filter(m => m.status === "disabled").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Módulos do Sistema (32)
            </CardTitle>
            <CardDescription>Visão geral de todos os módulos do Nautilus One</CardDescription>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{stats.functional}</p>
            <p className="text-xs text-muted-foreground">Funcionais</p>
          </div>
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-destructive">{stats.disabled}</p>
            <p className="text-xs text-muted-foreground">Desabilitados</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "functional" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("functional")}
            >
              Funcionais
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pendentes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredModules.map(module => (
            <div
              key={module.id}
              className="p-3 border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(module.status)}
                  <h4 className="font-medium text-sm">{module.name}</h4>
                </div>
                {getStatusBadge(module.status)}
              </div>

              <p className="text-xs text-muted-foreground mb-3">{module.description}</p>

              {module.status === "functional" && (
                <Link to={module.path}>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Acessar
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum módulo encontrado com os filtros aplicados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
