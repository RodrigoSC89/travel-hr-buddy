// ETAPA 32: External Audit System - Main Admin Page
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditSimulator } from "@/components/audit/AuditSimulator";
import { PerformanceDashboard } from "@/components/audit/PerformanceDashboard";
import { EvidenceManager } from "@/components/audit/EvidenceManager";
import { FileSearch, BarChart3, FolderOpen } from "lucide-react";

const AuditSystem: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Auditoria Externa</h1>
          <p className="text-muted-foreground mt-1">
            Simulação de auditorias, métricas de performance e gestão de evidências
          </p>
        </div>
      </div>

      <Tabs defaultValue="simulation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Simulação de Auditoria
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance por Embarcação
          </TabsTrigger>
          <TabsTrigger value="evidences" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Evidências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle>ETAPA 32.1 - Simulação de Auditoria Externa com IA</CardTitle>
              <CardDescription>
                Simule auditorias técnicas de entidades certificadoras usando GPT-4. 
                Receba análises detalhadas com conformidades, não conformidades, scores por norma e plano de ação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>ETAPA 32.2 - Painel de Performance Técnica</CardTitle>
              <CardDescription>
                Métricas técnicas críticas agregadas por embarcação incluindo conformidade normativa,
                frequência de falhas, MTTR, ações de IA vs humanas e treinamentos completados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidences">
          <Card>
            <CardHeader>
              <CardTitle>ETAPA 32.3 - Módulo de Evidência para Certificadoras</CardTitle>
              <CardDescription>
                Centralize e gerencie todas as evidências exigidas por certificações normativas.
                Faça upload de documentos, valide evidências e identifique gaps de compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema ETAPA 32</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <FileSearch className="mr-2 h-5 w-5 text-blue-600" />
                Simulação de Auditoria
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilize IA para simular auditorias de Petrobras, IBAMA, IMO, ISO e IMCA. 
                Economize tempo e custos preparando-se proativamente para auditorias reais.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                Performance Dashboard
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitore KPIs críticos como conformidade, MTTR, taxa de resolução de incidentes
                e efetividade de ações automatizadas vs manuais.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <FolderOpen className="mr-2 h-5 w-5 text-purple-600" />
                Gestão de Evidências
              </h3>
              <p className="text-sm text-muted-foreground">
                Mantenha um repositório estruturado de evidências por norma e cláusula.
                Identifique automaticamente gaps e prepare dossiês completos para auditorias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSystem;
