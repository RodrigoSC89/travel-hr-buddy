import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

interface AnpPractice {
  id: number;
  name: string;
  description: string;
  status: "compliant" | "non_compliant" | "pending" | "in_progress";
  compliance_level: number;
  last_audit?: string;
  next_audit?: string;
  responsible?: string;
}

const ANP_PRACTICES: AnpPractice[] = [
  {
    id: 1,
    name: "Liderança e Responsabilidade",
    description: "Definição de responsabilidades e liderança em segurança operacional",
    status: "compliant",
    compliance_level: 95,
  },
  {
    id: 2,
    name: "Identificação de Perigos e Avaliação de Riscos",
    description: "Processos sistemáticos de identificação e avaliação de riscos",
    status: "in_progress",
    compliance_level: 78,
  },
  {
    id: 3,
    name: "Controle de Riscos",
    description: "Implementação de medidas de controle e mitigação de riscos",
    status: "compliant",
    compliance_level: 92,
  },
  {
    id: 4,
    name: "Competência, Treinamento e Conscientização",
    description: "Gestão de competências e programas de treinamento",
    status: "non_compliant",
    compliance_level: 65,
  },
  {
    id: 5,
    name: "Comunicação e Consulta",
    description: "Canais de comunicação e consulta sobre segurança",
    status: "compliant",
    compliance_level: 88,
  },
  {
    id: 6,
    name: "Documentação do SGSO",
    description: "Gestão documental do sistema de segurança",
    status: "compliant",
    compliance_level: 90,
  },
  {
    id: 7,
    name: "Controle Operacional",
    description: "Procedimentos operacionais e controles",
    status: "in_progress",
    compliance_level: 75,
  },
  {
    id: 8,
    name: "Preparação e Resposta a Emergências",
    description: "Planos de emergência e resposta",
    status: "compliant",
    compliance_level: 94,
  },
  {
    id: 9,
    name: "Monitoramento e Medição",
    description: "Indicadores e métricas de segurança",
    status: "compliant",
    compliance_level: 85,
  },
  {
    id: 10,
    name: "Avaliação de Conformidade",
    description: "Avaliação de conformidade regulatória",
    status: "in_progress",
    compliance_level: 72,
  },
  {
    id: 11,
    name: "Investigação de Incidentes",
    description: "Processos de investigação e análise de incidentes",
    status: "compliant",
    compliance_level: 89,
  },
  {
    id: 12,
    name: "Análise Crítica pela Direção",
    description: "Revisões gerenciais do SGSO",
    status: "compliant",
    compliance_level: 91,
  },
  {
    id: 13,
    name: "Gestão de Mudanças",
    description: "Processos de gestão de mudanças organizacionais",
    status: "non_compliant",
    compliance_level: 58,
  },
  {
    id: 14,
    name: "Aquisição e Contratação",
    description: "Critérios de segurança em aquisições",
    status: "compliant",
    compliance_level: 87,
  },
  {
    id: 15,
    name: "Projeto e Construção",
    description: "Segurança em projetos e construções",
    status: "pending",
    compliance_level: 70,
  },
  {
    id: 16,
    name: "Informações de Segurança de Processo",
    description: "Gestão de informações críticas de segurança",
    status: "compliant",
    compliance_level: 93,
  },
  {
    id: 17,
    name: "Integridade Mecânica",
    description: "Manutenção e integridade de equipamentos",
    status: "non_compliant",
    compliance_level: 62,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
  case "compliant":
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  case "non_compliant":
    return <XCircle className="h-5 w-5 text-red-600" />;
  case "in_progress":
    return <Clock className="h-5 w-5 text-yellow-600" />;
  case "pending":
    return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  default:
    return null;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    compliant: "bg-green-100 text-green-800 border-green-200",
    non_compliant: "bg-red-100 text-red-800 border-red-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending: "bg-secondary text-secondary-foreground border-border",
  };

  const labels = {
    compliant: "Conforme",
    non_compliant: "Não Conforme",
    in_progress: "Em Andamento",
    pending: "Pendente",
  };

  return (
    <Badge className={`${styles[status as keyof typeof styles]} border font-semibold`}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

export const AnpPracticesManager: React.FC = () => {
  const [selectedPractice, setSelectedPractice] = useState<AnpPractice | null>(null);

  const compliantCount = ANP_PRACTICES.filter(p => p.status === "compliant").length;
  const nonCompliantCount = ANP_PRACTICES.filter(p => p.status === "non_compliant").length;
  const inProgressCount = ANP_PRACTICES.filter(p => p.status === "in_progress").length;
  const overallCompliance = Math.round(
    ANP_PRACTICES.reduce((acc, p) => acc + p.compliance_level, 0) / 17
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Conformes</p>
                <p className="text-3xl font-bold text-green-900">{compliantCount}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Não Conformes</p>
                <p className="text-3xl font-bold text-red-900">{nonCompliantCount}</p>
              </div>
              <XCircle className="h-12 w-12 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Em Andamento</p>
                <p className="text-3xl font-bold text-yellow-900">{inProgressCount}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Compliance Geral</p>
                <p className="text-3xl font-bold text-blue-900">{overallCompliance}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-red-600" />
            17 Práticas ANP Obrigatórias - Resolução 43/2007
          </CardTitle>
          <CardDescription>
            Sistema de Gestão de Segurança Operacional - Monitoramento de Conformidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Todas ({ANP_PRACTICES.length})</TabsTrigger>
              <TabsTrigger value="compliant">Conformes ({compliantCount})</TabsTrigger>
              <TabsTrigger value="non_compliant">Não Conformes ({nonCompliantCount})</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento ({inProgressCount})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {ANP_PRACTICES.map(practice => (
                <Card
                  key={practice.id}
                  className="border-2 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedPractice(practice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(practice.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-300 font-bold"
                              >
                                Prática {practice.id}
                              </Badge>
                              <h3 className="font-bold text-lg text-gray-900">{practice.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{practice.description}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">Nível de Conformidade</span>
                            <span className="font-bold text-gray-900">
                              {practice.compliance_level}%
                            </span>
                          </div>
                          <Progress value={practice.compliance_level} className="h-2" />
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(practice.status)}
                        <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {["compliant", "non_compliant", "in_progress", "pending"].map(status => (
              <TabsContent key={status} value={status} className="space-y-3">
                {ANP_PRACTICES.filter(p => p.status === status).map(practice => (
                  <Card
                    key={practice.id}
                    className="border-2 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedPractice(practice)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(practice.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-300 font-bold"
                                >
                                  Prática {practice.id}
                                </Badge>
                                <h3 className="font-bold text-lg text-gray-900">{practice.name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {practice.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">
                                Nível de Conformidade
                              </span>
                              <span className="font-bold text-gray-900">
                                {practice.compliance_level}%
                              </span>
                            </div>
                            <Progress value={practice.compliance_level} className="h-2" />
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(practice.status)}
                          <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                            <FileText className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnpPracticesManager;
