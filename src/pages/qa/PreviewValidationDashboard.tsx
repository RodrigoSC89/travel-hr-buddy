/**
 * Preview Validation Dashboard
 * PATCH 624 - Dashboard centralizado para validação de preview
 */

import { useCallback, useEffect, useMemo, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewValidator } from "@/components/qa/PreviewValidator";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Settings, Play } from "lucide-react";

export default function PreviewValidationDashboard() {
  const [selectedComponent, setSelectedComponent] = useState<string>("Dashboard");
  
  const { 
    isValidated, 
    validationPassed, 
    renderCount 
  } = usePreviewSafeMode({
    componentName: "PreviewValidationDashboard",
    enableValidation: true
  });

  // Lista de componentes críticos para validar
  const criticalComponents = [
    { name: "Dashboard", path: "/dashboard", priority: "high" },
    { name: "BridgeLink", path: "/bridgelink", priority: "high" },
    { name: "DPIntelligence", path: "/dp-intelligence", priority: "high" },
    { name: "ForecastGlobal", path: "/forecast-global", priority: "medium" },
    { name: "ControlHub", path: "/control-hub", priority: "medium" },
    { name: "FMEAExpert", path: "/fmea-expert", priority: "high" },
    { name: "PEODP", path: "/peo-dp", priority: "low" },
    { name: "DocumentosIA", path: "/documentos-ia", priority: "medium" },
    { name: "AssistenteIA", path: "/assistente-ia", priority: "low" },
    { name: "AnalyticsAvancado", path: "/analytics-avancado", priority: "medium" }
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, unknown> = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Preview Validation Dashboard</h1>
        <p className="text-muted-foreground">
          Validação QA para módulos React no Lovable Preview
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status do Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isValidated ? (
                validationPassed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-bold text-green-500">Preview Safe</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-bold text-red-500">Issues Detectados</span>
                  </>
                )
              ) : (
                <span className="text-lg font-bold text-muted-foreground">Validando...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Render Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCount}</div>
            <p className="text-xs text-muted-foreground">renders deste componente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Componentes Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalComponents.length}</div>
            <p className="text-xs text-muted-foreground">módulos para validar</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="validator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validator">
            <Play className="mr-2 h-4 w-4" />
            Validador
          </TabsTrigger>
          <TabsTrigger value="components">
            <Settings className="mr-2 h-4 w-4" />
            Componentes
          </TabsTrigger>
          <TabsTrigger value="guidelines">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validator" className="space-y-4">
          <PreviewValidator 
            componentName={selectedComponent}
            showDetails={true}
          />
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Componentes Críticos</CardTitle>
              <CardDescription>
                Selecione um componente para validar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalComponents.map((component) => (
                  <Button
                    key={component.name}
                    variant={selectedComponent === component.name ? "default" : "outline"}
                    className="justify-between h-auto py-4"
                    onClick={() => setSelectedComponent(component.name)}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{component.name}</span>
                      <span className="text-xs text-muted-foreground">{component.path}</span>
                    </div>
                    {getPriorityBadge(component.priority)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Validation Guidelines</CardTitle>
              <CardDescription>
                Melhores práticas para componentes preview-safe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GuidelineSection
                title="1. Evitar Loops Infinitos"
                items={[
                  "Sempre declare dependências corretas em useEffect",
                  "Use useCallback/useMemo para funções que dependem de estado",
                  "Evite atualizar estado dentro de renderização",
                  "Limpe intervals com clearInterval no cleanup"
                ]}
              />
              
              <GuidelineSection
                title="2. Dados Mockados Leves"
                items={[
                  "Máximo de 3KB por objeto mockado",
                  "Use no máximo 100 items em arrays",
                  "Profundidade de objeto não deve exceder 5 níveis",
                  "Implemente paginação para grandes datasets"
                ]}
              />
              
              <GuidelineSection
                title="3. Fallbacks e Error Handling"
                items={[
                  "Sempre forneça fallback para dados ausentes",
                  "Use try-catch em operações assíncronas",
                  "Silencie console.error para erros esperados",
                  "Implemente loading states apropriados"
                ]}
              />
              
              <GuidelineSection
                title="4. Performance e Responsividade"
                items={[
                  "Render time deve ser < 3000ms",
                  "Re-renders devem ser < 10 por segundo",
                  "Use virtualização para listas longas",
                  "Otimize imagens e recursos pesados"
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GuidelineSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
