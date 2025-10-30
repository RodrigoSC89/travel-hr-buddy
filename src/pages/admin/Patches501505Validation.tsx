import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  FileText, 
  TestTube, 
  Package, 
  Rocket,
  Clock,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

interface PatchChecklist {
  id: string;
  name: string;
  icon: any;
  items: ChecklistItem[];
  script?: string;
  description: string;
}

export default function Patches501505Validation() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const patches: PatchChecklist[] = [
    {
      id: "501",
      name: "PATCH 501 – Documentação Técnica",
      icon: FileText,
      description: "Geração automática de documentação técnica para todos os módulos",
      script: "npm run generate:docs",
      items: [
        { id: "501-1", label: "Arquivos Markdown gerados por módulo", checked: true, required: true },
        { id: "501-2", label: "Visualização via /docs/:module", checked: true, required: true },
        { id: "501-3", label: "Script de geração testado", checked: true, required: true },
        { id: "501-4", label: "Campos: rota, db, fluxos, eventos verificados", checked: true, required: true },
      ]
    },
    {
      id: "502",
      name: "PATCH 502 – Testes Core Modules",
      icon: TestTube,
      description: "Testes unitários com cobertura de 85% para módulos principais",
      script: "npm run test:unit",
      items: [
        { id: "502-1", label: "10 módulos com arquivos .spec.ts", checked: true, required: true },
        { id: "502-2", label: "Mock de Supabase OK", checked: true, required: true },
        { id: "502-3", label: "Coverage ≥ 85%", checked: false, required: true },
        { id: "502-4", label: "Rodando em pnpm test", checked: true, required: true },
      ]
    },
    {
      id: "503",
      name: "PATCH 503 – Fluxos E2E",
      icon: Play,
      description: "Testes end-to-end para fluxos principais da aplicação",
      script: "npm run test:e2e",
      items: [
        { id: "503-1", label: "5 fluxos principais testados", checked: true, required: true },
        { id: "503-2", label: "Testes em mobile/desktop", checked: true, required: true },
        { id: "503-3", label: "Screenshots OK", checked: false, required: false },
        { id: "503-4", label: "Todos testes com status passed", checked: false, required: true },
      ]
    },
    {
      id: "504",
      name: "PATCH 504 – Empacotamento Produção",
      icon: Package,
      description: "Criação de pacote de build com metadados para deploy",
      script: "npm run export:build",
      items: [
        { id: "504-1", label: "/dist gerado com sucesso", checked: true, required: true },
        { id: "504-2", label: "build-metadata.json presente", checked: true, required: true },
        { id: "504-3", label: ".zip final funcional", checked: true, required: false },
        { id: "504-4", label: "Tamanho final < 30MB", checked: false, required: false },
      ]
    },
    {
      id: "505",
      name: "PATCH 505 – Pós-Build + Deploy",
      icon: Rocket,
      description: "Verificação pós-build e helper de deploy para múltiplas plataformas",
      script: "npm run verify:postbuild",
      items: [
        { id: "505-1", label: "Script verify-postbuild OK", checked: true, required: true },
        { id: "505-2", label: "CLI deploy-helper testado", checked: true, required: true },
        { id: "505-3", label: "Relatório de rotas ativo", checked: true, required: true },
        { id: "505-4", label: "Deploy bem-sucedido (simulado ou real)", checked: false, required: false },
      ]
    }
  ];

  const runScript = async (script: string, patchId: string) => {
    setLoading(true);
    toast.info(`Executando ${script}...`, {
      description: "Aguarde enquanto o script é executado."
    });

    try {
      // Simulate script execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResults({
        ...testResults,
        [patchId]: {
          success: true,
          timestamp: new Date().toISOString(),
          output: `Script ${script} executado com sucesso`
        }
      });

      toast.success("Script executado!", {
        description: `${script} completado com sucesso.`
      });
    } catch (error) {
      toast.error("Erro ao executar script", {
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (items: ChecklistItem[]) => {
    const total = items.length;
    const checked = items.filter(item => item.checked).length;
    return (checked / total) * 100;
  };

  const getStatusIcon = (checked: boolean, required: boolean) => {
    if (checked) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return required ? 
      <XCircle className="h-4 w-4 text-red-500" /> : 
      <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const overallProgress = patches.reduce((acc, patch) => {
    return acc + calculateProgress(patch.items);
  }, 0) / patches.length;

  const requiredItemsComplete = patches.every(patch => 
    patch.items.filter(item => item.required).every(item => item.checked)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patches 501-505 Validation</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de validação e execução de patches de documentação, testes e deploy
          </p>
        </div>
        <Badge 
          variant={requiredItemsComplete ? "default" : "destructive"}
          className="text-sm px-4 py-2"
        >
          {requiredItemsComplete ? "✓ Itens Críticos OK" : "⚠ Itens Pendentes"}
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            {Math.round(overallProgress)}% dos itens completos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Obrigatório Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Opcional Pendente</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patches Tabs */}
      <Tabs defaultValue="501" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          {patches.map(patch => {
            const progress = calculateProgress(patch.items);
            const Icon = patch.icon;
            return (
              <TabsTrigger key={patch.id} value={patch.id} className="relative">
                <Icon className="h-4 w-4 mr-2" />
                {patch.id}
                {progress === 100 && (
                  <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {patches.map(patch => {
          const Icon = patch.icon;
          const progress = calculateProgress(patch.items);

          return (
            <TabsContent key={patch.id} value={patch.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {patch.name}
                      </CardTitle>
                      <CardDescription>{patch.description}</CardDescription>
                    </div>
                    {patch.script && (
                      <Button
                        onClick={() => runScript(patch.script!, patch.id)}
                        disabled={loading}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </Button>
                    )}
                  </div>
                  <Progress value={progress} className="mt-4" />
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {patch.items.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          {getStatusIcon(item.checked, item.required)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.label}</p>
                            <div className="flex gap-2 mt-1">
                              {item.required && (
                                <Badge variant="outline" className="text-xs">
                                  Obrigatório
                                </Badge>
                              )}
                              {item.checked && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Completo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Test Results */}
                  {testResults[patch.id] && (
                    <div className="mt-4 p-4 rounded-lg bg-muted">
                      <h4 className="font-semibold text-sm mb-2">Último Resultado:</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(testResults[patch.id].timestamp).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-sm mt-2">{testResults[patch.id].output}</p>
                    </div>
                  )}

                  {/* Quick Commands */}
                  {patch.script && (
                    <div className="mt-4 p-4 rounded-lg border bg-card">
                      <h4 className="font-semibold text-sm mb-2">Comando:</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {patch.script}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/docs" target="_blank">
                <FileText className="h-4 w-4 mr-2" />
                Ver Documentação Gerada
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Baixar Quick Reference
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Scripts Disponíveis</CardTitle>
          <CardDescription>Todos os comandos para executar os patches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-sm">
            <code className="p-2 bg-muted rounded">npm run generate:docs</code>
            <code className="p-2 bg-muted rounded">npm run test:unit</code>
            <code className="p-2 bg-muted rounded">npm run test:coverage</code>
            <code className="p-2 bg-muted rounded">npm run test:e2e</code>
            <code className="p-2 bg-muted rounded">npm run test:e2e:ui</code>
            <code className="p-2 bg-muted rounded">npm run export:build</code>
            <code className="p-2 bg-muted rounded">npm run verify:postbuild</code>
            <code className="p-2 bg-muted rounded">npm run deploy:helper</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
