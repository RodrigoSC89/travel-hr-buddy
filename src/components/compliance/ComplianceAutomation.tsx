/**
 * Compliance Automation - PHASE 6
 * Gestão automatizada de conformidade regulamentar (ISM, MLC, MARPOL, SOLAS)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Shield, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  ChevronRight,
  Loader2,
  Calendar,
  Ship,
  Users,
  Leaf
} from "lucide-react";
import { format, addDays, isPast, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ComplianceItem {
  id: string;
  regulation: "ISM" | "MLC" | "MARPOL" | "SOLAS";
  requirement: string;
  description: string;
  status: "compliant" | "non-compliant" | "pending" | "expiring";
  dueDate?: Date;
  lastCheck?: Date;
  vessel?: string;
  priority: "critical" | "high" | "medium" | "low";
  actionRequired?: string;
}

interface ComplianceStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  expiring: number;
}

const mockComplianceItems: ComplianceItem[] = [
  {
    id: "1",
    regulation: "ISM",
    requirement: "Auditoria Interna Anual",
    description: "Verificação completa do Sistema de Gestão de Segurança",
    status: "compliant",
    lastCheck: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    priority: "critical",
    vessel: "MV Nautilus"
  },
  {
    id: "2",
    regulation: "MLC",
    requirement: "Certificados de Competência",
    description: "Verificação de validade dos certificados da tripulação",
    status: "expiring",
    dueDate: addDays(new Date(), 15),
    priority: "high",
    vessel: "PSV Alpha",
    actionRequired: "3 certificados expirando em 15 dias"
  },
  {
    id: "3",
    regulation: "MARPOL",
    requirement: "Livro de Registro de Óleo",
    description: "Manutenção do registro de operações com óleo (Anexo I)",
    status: "compliant",
    lastCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    priority: "high"
  },
  {
    id: "4",
    regulation: "SOLAS",
    requirement: "Equipamentos Salva-vidas",
    description: "Inspeção trimestral de botes e coletes",
    status: "pending",
    dueDate: addDays(new Date(), 5),
    priority: "critical",
    vessel: "OSV Beta",
    actionRequired: "Agendar inspeção obrigatória"
  },
  {
    id: "5",
    regulation: "ISM",
    requirement: "Treinamento de Emergência",
    description: "Exercícios de abandono e combate a incêndio",
    status: "compliant",
    lastCheck: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    priority: "high"
  },
  {
    id: "6",
    regulation: "MLC",
    requirement: "Horas de Trabalho/Descanso",
    description: "Registro e conformidade com limites de jornada",
    status: "non-compliant",
    priority: "critical",
    vessel: "AHTS Gamma",
    actionRequired: "Violação detectada - ação corretiva necessária"
  },
  {
    id: "7",
    regulation: "MARPOL",
    requirement: "Plano de Gestão de Lixo",
    description: "Atualização do plano conforme Anexo V",
    status: "compliant",
    lastCheck: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    priority: "medium"
  },
  {
    id: "8",
    regulation: "SOLAS",
    requirement: "Certificado de Segurança",
    description: "Renovação do Certificado de Segurança de Construção",
    status: "expiring",
    dueDate: addDays(new Date(), 30),
    priority: "critical",
    actionRequired: "Agendar vistoria com sociedade classificadora"
  }
];

const regulationInfo = {
  ISM: { name: "ISM Code", icon: Shield, color: "text-blue-500" },
  MLC: { name: "MLC 2006", icon: Users, color: "text-purple-500" },
  MARPOL: { name: "MARPOL", icon: Leaf, color: "text-green-500" },
  SOLAS: { name: "SOLAS", icon: Ship, color: "text-orange-500" }
};

export const ComplianceAutomation: React.FC = () => {
  const [items, setItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [selectedRegulation, setSelectedRegulation] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<ComplianceStats>({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    pending: 0,
    expiring: 0
  });

  useEffect(() => {
    const newStats = items.reduce((acc, item) => {
      acc.total++;
      if (item.status === "compliant") acc.compliant++;
      if (item.status === "non-compliant") acc.nonCompliant++;
      if (item.status === "pending") acc.pending++;
      if (item.status === "expiring") acc.expiring++;
      return acc;
    }, { total: 0, compliant: 0, nonCompliant: 0, pending: 0, expiring: 0 });
    
    setStats(newStats);
  }, [items]);

  const refreshCompliance = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Verificação de conformidade atualizada");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "compliant": return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "non-compliant": return <XCircle className="h-5 w-5 text-red-500" />;
    case "pending": return <Clock className="h-5 w-5 text-amber-500" />;
    case "expiring": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "compliant": return <Badge className="bg-green-500">Conforme</Badge>;
    case "non-compliant": return <Badge variant="destructive">Não Conforme</Badge>;
    case "pending": return <Badge variant="secondary">Pendente</Badge>;
    case "expiring": return <Badge className="bg-orange-500">Expirando</Badge>;
    default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case "critical": return <Badge variant="destructive">Crítico</Badge>;
    case "high": return <Badge variant="outline" className="border-orange-500 text-orange-500">Alto</Badge>;
    case "medium": return <Badge variant="outline">Médio</Badge>;
    case "low": return <Badge variant="secondary">Baixo</Badge>;
    default: return null;
    }
  };

  const filteredItems = selectedRegulation === "all" 
    ? items 
    : items.filter(item => item.regulation === selectedRegulation);

  const complianceScore = stats.total > 0 
    ? Math.round((stats.compliant / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                <p className="text-4xl font-bold">{complianceScore}%</p>
              </div>
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${complianceScore * 2.2} 220`}
                    className={complianceScore >= 80 ? "text-green-500" : complianceScore >= 60 ? "text-amber-500" : "text-red-500"}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-2xl font-bold">{stats.compliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold">{stats.pending + stats.expiring}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Não Conformes</p>
                <p className="text-2xl font-bold">{stats.nonCompliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Gestão de Conformidade Regulamentar
              </CardTitle>
              <CardDescription>
                Monitoramento automatizado de ISM, MLC, MARPOL e SOLAS
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Relatório
              </Button>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={refreshCompliance}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRegulation} onValueChange={setSelectedRegulation}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="ISM" className="gap-1">
                <Shield className="h-4 w-4" />
                ISM
              </TabsTrigger>
              <TabsTrigger value="MLC" className="gap-1">
                <Users className="h-4 w-4" />
                MLC
              </TabsTrigger>
              <TabsTrigger value="MARPOL" className="gap-1">
                <Leaf className="h-4 w-4" />
                MARPOL
              </TabsTrigger>
              <TabsTrigger value="SOLAS" className="gap-1">
                <Ship className="h-4 w-4" />
                SOLAS
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const RegIcon = regulationInfo[item.regulation].icon;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          item.status === "non-compliant" ? "border-red-500/30 bg-red-500/5" :
                            item.status === "expiring" ? "border-orange-500/30 bg-orange-500/5" :
                              "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(item.status)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={regulationInfo[item.regulation].color}>
                                  {item.regulation}
                                </Badge>
                                {getPriorityBadge(item.priority)}
                                {item.vessel && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.vessel}
                                  </span>
                                )}
                              </div>
                              <p className="font-medium">{item.requirement}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              
                              {item.actionRequired && (
                                <div className="mt-2 p-2 bg-amber-500/10 rounded text-sm text-amber-600 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  {item.actionRequired}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {getStatusBadge(item.status)}
                            {item.dueDate && (
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 justify-end">
                                <Calendar className="h-3 w-3" />
                                {format(item.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            )}
                            {item.lastCheck && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Última verificação: {format(item.lastCheck, "dd/MM", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceAutomation;
