import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  TestTube, 
  Bug, 
  TrendingUp, 
  Activity, 
  Flag, 
  Workflow, 
  Layers,
  Brain,
  Code,
  Settings2,
  Beaker,
  Lightbulb,
  Cpu
} from "lucide-react";

interface AdvancedSettings {
  enableFeatureFlags: boolean;
  debugMode: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  customFields: Record<string, unknown>;
  workflowAutomation: boolean;
  enableBetaFeatures: boolean;
}

interface AdvancedFeaturesTabProps {
  settings: AdvancedSettings;
  onUpdate: (updates: Partial<AdvancedSettings>) => void;
  testMode: boolean;
}

export const AdvancedFeaturesTab: React.FC<AdvancedFeaturesTabProps> = ({
  settings,
  onUpdate,
  testMode
}) => {
  const features = [
    {
      id: "featureFlags",
      title: "Feature Flags",
      description: "Controle de recursos por flags dinâmicas",
      icon: Flag,
      enabled: settings.enableFeatureFlags,
      onToggle: (enabled: boolean) => onUpdate({ enableFeatureFlags: enabled }),
      danger: false
    },
    {
      id: "debugMode",
      title: "Modo Debug",
      description: "Logs detalhados e informações de desenvolvimento",
      icon: Bug,
      enabled: settings.debugMode,
      onToggle: (enabled: boolean) => onUpdate({ debugMode: enabled }),
      danger: true
    },
    {
      id: "performanceMonitoring",
      title: "Monitoramento de Performance",
      description: "Coleta métricas de performance em tempo real",
      icon: TrendingUp,
      enabled: settings.performanceMonitoring,
      onToggle: (enabled: boolean) => onUpdate({ performanceMonitoring: enabled }),
      danger: false
    },
    {
      id: "errorTracking",
      title: "Rastreamento de Erros",
      description: "Captura e análise automática de erros",
      icon: Activity,
      enabled: settings.errorTracking,
      onToggle: (enabled: boolean) => onUpdate({ errorTracking: enabled }),
      danger: false
    },
    {
      id: "workflowAutomation",
      title: "Automação de Workflows",
      description: "Automatização inteligente de processos",
      icon: Workflow,
      enabled: settings.workflowAutomation,
      onToggle: (enabled: boolean) => onUpdate({ workflowAutomation: enabled }),
      danger: false
    },
    {
      id: "betaFeatures",
      title: "Recursos Beta",
      description: "Acesso antecipado a novos recursos",
      icon: Beaker,
      enabled: settings.enableBetaFeatures,
      onToggle: (enabled: boolean) => onUpdate({ enableBetaFeatures: enabled }),
      danger: true
    }
  ];

  const customFieldTypes = [
    "text", "number", "boolean", "date", "select", "multiselect", "json"
  ];

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Recursos Avançados
            {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
          </CardTitle>
          <CardDescription>
            Configure recursos avançados e experimentais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.id} 
                  className={`p-4 border rounded-lg ${feature.danger ? "border-orange-200 bg-orange-50 dark:bg-orange-900/10" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${feature.danger ? "text-orange-600" : "text-primary"}`} />
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={feature.onToggle}
                    />
                  </div>
                  
                  {feature.danger && feature.enabled && (
                    <div className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/20 p-2 rounded">
                      ⚠️ Este recurso pode afetar a performance ou estabilidade
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI & Machine Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Configure recursos de IA e aprendizado de máquina
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Análise Preditiva</Label>
                  <p className="text-sm text-muted-foreground">
                    IA prevê problemas antes que aconteçam
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Otimização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Sistema auto-otimiza configurações
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Detecção de Anomalias</Label>
                  <p className="text-sm text-muted-foreground">
                    Identifica comportamentos anômalos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Modelos de IA Ativos</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Classificação de Documentos</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm">Análise de Sentimentos</span>
                  <Badge className="bg-blue-100 text-blue-800">Treinando</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
                  <span className="text-sm">Previsão de Demanda</span>
                  <Badge variant="outline">Pausado</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Campos Customizados
          </CardTitle>
          <CardDescription>
            Adicione campos personalizados ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Nome do Campo</Label>
              <Input
                id="fieldName"
                placeholder="Ex: Código Interno"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Tipo</Label>
              <Select>
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {customFieldTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Adicionar Campo
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Campos Existentes</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">Número da Licença</span>
                  <span className="text-sm text-muted-foreground ml-2">(text)</span>
                </div>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">Data de Vencimento</span>
                  <span className="text-sm text-muted-foreground ml-2">(date)</span>
                </div>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Ferramentas de Desenvolvimento
          </CardTitle>
          <CardDescription>
            Recursos para desenvolvedores e administradores técnicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Debug</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Console Logs Verbosos</Label>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Métricas de Performance</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Stack Traces Completos</Label>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">API & Integrações</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rate Limiting</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Request Logging</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>API Versioning</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Settings2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
            <Button variant="outline">
              <Cpu className="w-4 h-4 mr-2" />
              Reiniciar Workers
            </Button>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Gerar Report
            </Button>
            <Button variant="outline">
              <Lightbulb className="w-4 h-4 mr-2" />
              Executar Diagnóstico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};