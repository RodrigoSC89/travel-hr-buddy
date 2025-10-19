import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain, TrendingUp, Download } from "lucide-react";
import AIReportGenerator from "./AIReportGenerator";
import DocumentProcessor from "../intelligence/DocumentProcessor";

const ReportsDashboard = () => {
  const [activeReport, setActiveReport] = useState<unknown>(null);

  const handleReportGenerated = (report: unknown) => {
    setActiveReport(report);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Inteligentes</h1>
          <p className="text-muted-foreground">
            Geração automatizada de relatórios e processamento de documentos com IA
          </p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Gerador IA
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Processamento
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <AIReportGenerator onReportGenerated={handleReportGenerated} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentProcessor />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Analytics de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Relatórios Gerados</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Documentos Processados</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                        <p className="text-2xl font-bold">2.3s</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recursos Avançados Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Análise Preditiva</h4>
                      <p className="text-sm text-muted-foreground">
                        Previsões baseadas em dados históricos e tendências
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Extração Inteligente</h4>
                      <p className="text-sm text-muted-foreground">
                        Identificação automática de entidades e dados relevantes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Múltiplos Formatos</h4>
                      <p className="text-sm text-muted-foreground">
                        Exportação em PDF, Word, Excel e formatos personalizados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Insights Automáticos</h4>
                      <p className="text-sm text-muted-foreground">
                        Recomendações e insights gerados automaticamente
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsDashboard;