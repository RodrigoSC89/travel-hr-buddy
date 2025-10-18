import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MetricasPanel } from "@/components/sgso/MetricasPanel";
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";
import { Shield, BarChart3, FileCheck, Mail } from "lucide-react";

const AdminSGSO = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Painel Administrativo SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Segurança Operacional - Métricas e Compliance
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          <FileCheck className="mr-2 h-4 w-4" />
          Compliance ANP 43/2007
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Métricas Operacionais
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <FileCheck className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Mail className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <MetricasPanel />
          <SGSOTrendChart />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Compliance</CardTitle>
              <CardDescription>
                Monitoramento das 17 práticas obrigatórias ANP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">17 Práticas ANP</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema configurado para monitorar compliance com a Resolução ANP 43/2007.
                    As métricas de auditoria refletem o cumprimento das práticas obrigatórias.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">Auditorias IMCA</h3>
                  <p className="text-sm text-muted-foreground">
                    Auditorias são classificadas por nível de risco (Crítico, Alto, Médio, Baixo, Negligenciável)
                    e rastreadas por embarcação para análise detalhada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automatizados</CardTitle>
              <CardDescription>
                Configuração de exportação e envio automático de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Exportação CSV</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Disponível na aba "Métricas Operacionais" - Permite exportar dados
                    de métricas por embarcação em formato CSV para análise externa.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Exportação PDF</h3>
                    <Badge variant="outline">Em Breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exportação de relatórios completos em PDF com gráficos e tabelas usando jsPDF.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Envio Automático por Email</h3>
                    <Badge variant="outline">Em Breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configuração de cron jobs para envio automático de relatórios mensais
                    via email para stakeholders.
                  </p>
                </div>

                <div className="rounded-lg border p-4 opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Integração BI</h3>
                    <Badge variant="outline">Planejado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integração com ferramentas de BI externas (Power BI, Tableau) para
                    análises avançadas e dashboards executivos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSGSO;
