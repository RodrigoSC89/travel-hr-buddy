import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, TrendingUp, Ship, FileText } from "lucide-react";
import { MetricasPanel } from "@/components/sgso/MetricasPanel";
import { ComplianceMetrics } from "@/components/sgso/ComplianceMetrics";

export default function AdminSgso() {
  const [activeTab, setActiveTab] = useState("metricas");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              SGSO - Sistema de Gestão de Segurança Operacional
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard administrativo com métricas agregadas e análises de compliance
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto gap-2">
            <TabsTrigger 
              value="metricas"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Métricas Operacionais
            </TabsTrigger>
            <TabsTrigger 
              value="compliance"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="relatorios"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Ship className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metricas" className="mt-6">
            <MetricasPanel />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceMetrics />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <div className="text-center py-12">
              <Ship className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Módulo de Relatórios
              </h3>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Integration Info Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ✅ Painel de Métricas Integrado
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>🔍 <strong>Filtro por embarcação</strong> - Análise por vessel implementada</p>
              <p>📈 <strong>Gráfico de evolução mensal</strong> - Tendência de falhas críticas</p>
              <p>📊 <strong>Comparativo por risco</strong> - Distribuição por nível de severidade</p>
              <p>📌 <strong>Pronto para integração</strong> - APIs REST + Supabase RPC Functions</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/api/admin/metrics" target="_blank" rel="noopener noreferrer">
                  Ver API Métricas
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/api/admin/metrics/evolucao-mensal" target="_blank" rel="noopener noreferrer">
                  Ver Evolução Mensal
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/api/admin/metrics/por-embarcacao" target="_blank" rel="noopener noreferrer">
                  Ver Métricas por Embarcação
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Options Info */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Opções de Exportação e Automação
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ <strong>Exportar para CSV</strong> - Disponível no painel de métricas</p>
              <p>🔧 <strong>Exportar para PDF</strong> - Implementação futura via jsPDF</p>
              <p>📧 <strong>Relatório mensal automático por email</strong> - Integração futura com cron jobs</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              💡 Para habilitar envio automático de relatórios, configure uma cron job no Vercel ou use Supabase Edge Functions
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
