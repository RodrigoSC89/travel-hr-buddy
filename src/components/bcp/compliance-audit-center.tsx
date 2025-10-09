import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Eye,
  Users,
  Globe,
  Scale,
  Building,
  Anchor,
  Search,
  Download
} from "lucide-react";

export const ComplianceAuditCenter: React.FC = () => {
  const [complianceStatus] = useState({
    lgpd: {
      name: "LGPD",
      status: "compliant",
      score: 95,
      lastAudit: "2024-01-10",
      nextAudit: "2024-04-10",
      items: [
        { name: "Consentimentos", status: "compliant", details: "Sistema de opt-in implementado" },
        { name: "Políticas de Privacidade", status: "compliant", details: "Política atualizada e publicada" },
        { name: "Direito ao Esquecimento", status: "compliant", details: "Processo automatizado ativo" },
        { name: "Relatórios DPO", status: "warning", details: "Relatório trimestral pendente" },
        { name: "Minimização de Dados", status: "compliant", details: "Retenção de dados configurada" }
      ]
    },
    gdpr: {
      name: "GDPR",
      status: "compliant",
      score: 92,
      lastAudit: "2024-01-08",
      nextAudit: "2024-04-08",
      items: [
        { name: "Data Protection Impact Assessment", status: "compliant", details: "DPIA realizado e aprovado" },
        { name: "Privacy by Design", status: "compliant", details: "Implementado na arquitetura" },
        { name: "Breach Notification", status: "compliant", details: "Processo de 72h implementado" },
        { name: "Data Subject Rights", status: "compliant", details: "Portal de direitos disponível" }
      ]
    },
    iso27001: {
      name: "ISO 27001",
      status: "compliant",
      score: 88,
      lastAudit: "2024-01-05",
      nextAudit: "2024-07-05",
      items: [
        { name: "Gestão de Riscos", status: "compliant", details: "Framework implementado" },
        { name: "Controles de Segurança", status: "compliant", details: "143/143 controles ativos" },
        { name: "Auditoria Interna", status: "warning", details: "Auditoria semestral agendada" },
        { name: "Melhoria Contínua", status: "compliant", details: "Processo PDCA ativo" },
        { name: "Treinamento de Segurança", status: "compliant", details: "Programa anual completo" }
      ]
    },
    imo: {
      name: "IMO/ISM Code",
      status: "compliant",
      score: 94,
      lastAudit: "2024-01-12",
      nextAudit: "2024-06-12",
      items: [
        { name: "Safety Management System", status: "compliant", details: "SMS certificado" },
        { name: "Emergency Procedures", status: "compliant", details: "Procedimentos atualizados" },
        { name: "Crew Certification", status: "compliant", details: "Certificações em dia" },
        { name: "Vessel Documentation", status: "warning", details: "2 documentos vencendo" },
        { name: "Port State Control", status: "compliant", details: "Última inspeção aprovada" }
      ]
    }
  });

  const [auditHistory] = useState([
    {
      id: "1",
      standard: "LGPD",
      type: "Auditoria Externa",
      date: "2024-01-10",
      auditor: "Deloitte Consulting",
      result: "Aprovado",
      score: 95,
      findings: 1,
      status: "completed"
    },
    {
      id: "2",
      standard: "ISO 27001",
      type: "Auditoria Interna",
      date: "2024-01-05",
      auditor: "Equipe Interna",
      result: "Aprovado com Observações",
      score: 88,
      findings: 3,
      status: "completed"
    },
    {
      id: "3",
      standard: "GDPR",
      type: "Auditoria Externa",
      date: "2024-01-08",
      auditor: "Ernst & Young",
      result: "Aprovado",
      score: 92,
      findings: 2,
      status: "completed"
    }
  ]);

  const [dataSubjectRequests] = useState([
    {
      id: "1",
      type: "Acesso aos Dados",
      requester: "joao.silva@email.com",
      date: "2024-01-14",
      status: "completed",
      responseTime: "24h",
      legal: "LGPD Art. 18"
    },
    {
      id: "2",
      type: "Exclusão de Dados",
      requester: "maria.santos@email.com",
      date: "2024-01-13",
      status: "in_progress",
      responseTime: "48h",
      legal: "LGPD Art. 18"
    },
    {
      id: "3",
      type: "Portabilidade",
      requester: "pedro.costa@email.com",
      date: "2024-01-12",
      status: "completed",
      responseTime: "72h",
      legal: "GDPR Art. 20"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "compliant": 
    case "completed": return "text-green-500";
    case "warning": 
    case "in_progress": return "text-yellow-500";
    case "non_compliant": 
    case "failed": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "compliant": 
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "warning": 
    case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "non_compliant": 
    case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getComplianceIcon = (standard: string) => {
    switch (standard) {
    case "LGPD": return Building;
    case "GDPR": return Globe;
    case "ISO 27001": return Shield;
    case "IMO/ISM Code": return Anchor;
    default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Centro de Compliance & Auditoria</h1>
          <Badge variant="secondary">Conformidade Regulatória</Badge>
        </div>
        <p className="text-muted-foreground">
          Monitoramento de conformidade com LGPD, GDPR, ISO 27001 e regulamentações marítimas
        </p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(complianceStatus).map((standard) => {
          const IconComponent = getComplianceIcon(standard.name);
          return (
            <Card key={standard.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <span className="font-medium">{standard.name}</span>
                  </div>
                  <Badge className={getStatusBadge(standard.status)}>
                    {standard.status === "compliant" ? "Conforme" : "Não Conforme"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score de Compliance</span>
                    <span className="font-medium">{standard.score}%</span>
                  </div>
                  <Progress value={standard.score} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Última auditoria: {standard.lastAudit}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="lgpd" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="iso">ISO 27001</TabsTrigger>
          <TabsTrigger value="maritime">Marítimo</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
        </TabsList>

        <TabsContent value="lgpd">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Lei Geral de Proteção de Dados (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStatus.lgpd.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === "compliant" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status === "compliant" ? "Conforme" : "Atenção"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data Subject Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Titulares de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataSubjectRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.requester} • {request.date}
                        </p>
                        <p className="text-xs text-muted-foreground">{request.legal}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status === "completed" ? "Concluído" : "Em Andamento"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Resposta em {request.responseTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gdpr">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Data Protection Regulation (GDPR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStatus.gdpr.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(item.status)}>
                      Conforme
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* GDPR Rights Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Direitos GDPR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Direito de Acesso</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Portal self-service para consulta de dados pessoais
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Configurar Portal
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Direito ao Esquecimento</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Processo automatizado de exclusão de dados
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Gerenciar Exclusões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="iso">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  ISO 27001 - Sistema de Gestão de Segurança da Informação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStatus.iso27001.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === "compliant" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status === "compliant" ? "Conforme" : "Atenção"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Control Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliação de Controles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">143</div>
                    <div className="text-sm text-muted-foreground">Controles Implementados</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-muted-foreground">Em Implementação</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-sm text-muted-foreground">Não Conformes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maritime">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-5 h-5" />
                  Regulamentações Marítimas (IMO/ISM Code)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStatus.imo.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === "compliant" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status === "compliant" ? "Conforme" : "Atenção"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Maritime Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certificações Marítimas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Document of Compliance (DOC)</span>
                      <p className="text-sm text-muted-foreground">Válido até: 15/08/2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Válido
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Safety Management Certificate (SMC)</span>
                      <p className="text-sm text-muted-foreground">Válido até: 22/06/2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Válido
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">ISPS Code Compliance</span>
                      <p className="text-sm text-muted-foreground">Válido até: 30/12/2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Válido
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Histórico de Auditorias</h3>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Agendar Auditoria
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-3 p-6">
                  {auditHistory.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{audit.standard} - {audit.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {audit.auditor} • {audit.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(audit.status)}>
                          {audit.result}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Score: {audit.score}% • {audit.findings} achados
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Próximas Auditorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div>
                      <span className="font-medium">LGPD - Auditoria Trimestral</span>
                      <p className="text-sm text-muted-foreground">Agendada para: 10/04/2024</p>
                    </div>
                    <Button size="sm" variant="outline">Preparar</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div>
                      <span className="font-medium">ISO 27001 - Auditoria Interna</span>
                      <p className="text-sm text-muted-foreground">Agendada para: 05/07/2024</p>
                    </div>
                    <Button size="sm" variant="outline">Preparar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};