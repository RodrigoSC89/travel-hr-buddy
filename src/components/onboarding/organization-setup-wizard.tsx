import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { 
  Building2, 
  Users, 
  Ship, 
  Settings, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OrganizationData {
  name: string;
  description: string;
  industry: string;
  size: string;
  country: string;
  primary_color: string;
  modules: string[];
  timezone: string;
  currency: string;
}

export const OrganizationSetupWizard: React.FC = () => {
  const { currentOrganization, updateBranding } = useOrganization();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: currentOrganization?.name || "",
    description: "",
    industry: "",
    size: "",
    country: "BR",
    primary_color: "#3b82f6",
    modules: [],
    timezone: "America/Sao_Paulo",
    currency: "BRL"
  });

  const steps: SetupStep[] = [
    {
      id: "basic",
      title: "Informações Básicas",
      description: "Configure os dados fundamentais da sua organização",
      icon: Building2,
      completed: orgData.name && orgData.industry && orgData.size ? true : false
    },
    {
      id: "modules",
      title: "Módulos e Funcionalidades",
      description: "Escolha os módulos que sua organização utilizará",
      icon: Settings,
      completed: orgData.modules.length > 0
    },
    {
      id: "branding",
      title: "Personalização",
      description: "Configure cores, moeda e fuso horário",
      icon: Sparkles,
      completed: orgData.primary_color && orgData.timezone && orgData.currency ? true : false
    },
    {
      id: "complete",
      title: "Finalização",
      description: "Confirme e ative sua organização",
      icon: CheckCircle,
      completed: false
    }
  ];

  const availableModules = [
    { id: "maritime", name: "Sistema Marítimo", description: "Gestão de embarcações e tripulação" },
    { id: "fleet", name: "Gestão de Frota", description: "Rastreamento e monitoramento" },
    { id: "hr", name: "Recursos Humanos", description: "Gestão de funcionários e certificados" },
    { id: "travel", name: "Viagens Corporativas", description: "Reservas e alertas de preços" },
    { id: "analytics", name: "Analytics Avançado", description: "Dashboards e relatórios" },
    { id: "communication", name: "Comunicação", description: "Chat e colaboração" },
    { id: "intelligence", name: "IA e Automação", description: "Assistente IA e workflows" }
  ];

  const industries = [
    "Maritime & Shipping",
    "Oil & Gas",
    "Logistics & Transportation",
    "Manufacturing",
    "Technology",
    "Consulting",
    "Other"
  ];

  const companySizes = [
    "1-10 funcionários",
    "11-50 funcionários", 
    "51-200 funcionários",
    "201-1000 funcionários",
    "1000+ funcionários"
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleModuleToggle = (moduleId: string) => {
    setOrgData(prev => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter(m => m !== moduleId)
        : [...prev.modules, moduleId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentOrganization) return;

    setIsLoading(true);
    try {
      // Update organization branding
      const { error: brandingError } = await supabase
        .from("organization_branding")
        .upsert({
          organization_id: currentOrganization.id,
          company_name: orgData.name,
          primary_color: orgData.primary_color,
          secondary_color: "#64748b",
          accent_color: "#f59e0b",
          theme_mode: "system",
          default_language: "pt-BR",
          default_currency: orgData.currency,
          timezone: orgData.timezone,
          enabled_modules: orgData.modules as any,
          custom_fields: {
            industry: orgData.industry,
            company_size: orgData.size,
            description: orgData.description
          } as any
        });

      if (brandingError) throw brandingError;

      // Update branding through context
      await updateBranding({
        company_name: orgData.name,
        primary_color: orgData.primary_color,
        secondary_color: "#64748b",
        accent_color: "#f59e0b",
        default_currency: orgData.currency,
        timezone: orgData.timezone,
        enabled_modules: orgData.modules as any,
        custom_fields: {
          industry: orgData.industry,
          company_size: orgData.size,
          description: orgData.description
        } as any
      });
      
      toast({
        title: "Configuração Concluída!",
        description: "Sua organização foi configurada com sucesso.",
      });

      // Redirect to dashboard
      navigate("/");
      
    } catch (error: any) {
      toast({
        title: "Erro na Configuração",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Nome da Organização</Label>
            <Input
              id="name"
              value={orgData.name}
              onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Empresa Marítima LTDA"
            />
          </div>
            
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={orgData.description}
              onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrição da sua empresa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Setor</Label>
              <Select value={orgData.industry} onValueChange={(value) => setOrgData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="size">Tamanho da Empresa</Label>
              <Select value={orgData.size} onValueChange={(value) => setOrgData(prev => ({ ...prev, size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Número de funcionários" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case 1:
      return (
        <div className="space-y-6">
          <p className="text-muted-foreground">
              Selecione os módulos que sua organização utilizará. Você pode adicionar mais módulos posteriormente.
          </p>
            
          <div className="grid grid-cols-1 gap-4">
            {availableModules.map(module => (
              <div key={module.id} className="flex items-start space-x-3">
                <Checkbox
                  id={module.id}
                  checked={orgData.modules.includes(module.id)}
                  onCheckedChange={() => handleModuleToggle(module.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={module.id} className="text-base font-medium cursor-pointer">
                    {module.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
            ))}
          </div>

          {orgData.modules.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Módulos Selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {orgData.modules.map(moduleId => {
                  const module = availableModules.find(m => m.id === moduleId);
                  return module ? (
                    <Badge key={moduleId} variant="secondary">
                      {module.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="color">Cor Principal</Label>
            <div className="flex items-center space-x-3 mt-2">
              <input
                type="color"
                id="color"
                value={orgData.primary_color}
                onChange={(e) => setOrgData(prev => ({ ...prev, primary_color: e.target.value }))}
                className="w-12 h-12 rounded border"
              />
              <Input
                value={orgData.primary_color}
                onChange={(e) => setOrgData(prev => ({ ...prev, primary_color: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={orgData.timezone} onValueChange={(value) => setOrgData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select value={orgData.currency} onValueChange={(value) => setOrgData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Configuração Quase Concluída!</h3>
            <p className="text-muted-foreground">
                Revise as configurações abaixo e finalize a configuração da sua organização.
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{orgData.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Setor:</span>
                    <p className="font-medium">{orgData.industry}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Módulos Ativos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {orgData.modules.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId);
                    return module ? (
                      <Badge key={moduleId} variant="secondary">
                        {module.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personalização</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cor:</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: orgData.primary_color }}
                      />
                      <span className="font-medium">{orgData.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Moeda:</span>
                    <p className="font-medium">{orgData.currency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fuso:</span>
                    <p className="font-medium">{orgData.timezone.split("/")[1]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );

    default:
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuração da Organização</h1>
        <p className="text-muted-foreground">
          Configure sua organização para começar a usar o Nautilus One
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Progresso</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed || index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : isCompleted
                        ? "border-green-200 bg-green-50"
                        : "border-border"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-green-500 text-azure-50"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground hidden lg:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? "Finalizando..." : "Finalizar Configuração"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};