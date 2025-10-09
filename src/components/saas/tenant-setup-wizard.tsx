import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Building2, CreditCard, Settings, Users } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

interface TenantSetupData {
  // Informações básicas
  name: string;
  subdomain: string;
  description: string;
  industry: string;
  company_size: string;
  
  // Configurações do plano
  plan_id: string;
  
  // Configurações iniciais
  primary_currency: string;
  timezone: string;
  language: string;
  
  // Administrador
  admin_name: string;
  admin_email: string;
  admin_phone: string;
}

const steps = [
  { id: 1, title: "Informações da Empresa", icon: Building2 },
  { id: 2, title: "Plano e Billing", icon: CreditCard },
  { id: 3, title: "Configurações", icon: Settings },
  { id: 4, title: "Administrador", icon: Users }
];

export const TenantSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantSetupData>({
    name: "",
    subdomain: "",
    description: "",
    industry: "",
    company_size: "",
    plan_id: "",
    primary_currency: "BRL",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    admin_name: "",
    admin_email: "",
    admin_phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { tenantPlans } = useTenant();
  const { toast } = useToast();

  const updateFormData = (field: keyof TenantSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
    case 1:
      return !!(formData.name && formData.subdomain && formData.industry);
    case 2:
      return !!formData.plan_id;
    case 3:
      return !!(formData.primary_currency && formData.timezone && formData.language);
    case 4:
      return !!(formData.admin_name && formData.admin_email);
    default:
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    try {
      // Aqui você implementaria a criação do tenanttoast({
        title: "Tenant criado com sucesso!",
        description: "O ambiente da empresa foi configurado.",
      });
      
      // Redirecionar para o dashboard do tenant
    } catch (error) {
      toast({
        title: "Erro ao criar tenant",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Configuração do Ambiente</h1>
        <p className="text-muted-foreground">
          Configure o ambiente da sua empresa em poucos passos
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                <div className={`rounded-full p-3 ${
                  isCurrent ? "bg-primary text-primary-foreground" : 
                    isCompleted ? "bg-green-600 text-azure-50" : "bg-muted"
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className="text-sm font-medium text-center">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Ex: Blue Shipping"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomínio *</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => updateFormData("subdomain", e.target.value.toLowerCase())}
                    placeholder="blueshipping"
                    className="rounded-r-none"
                  />
                  <div className="bg-muted border border-l-0 rounded-r-md px-3 py-2 text-sm text-muted-foreground">
                    .nautilus.app
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Descreva brevemente a empresa e suas atividades..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Setor *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Transporte Marítimo</SelectItem>
                    <SelectItem value="logistics">Logística</SelectItem>
                    <SelectItem value="port">Operação Portuária</SelectItem>
                    <SelectItem value="offshore">Offshore</SelectItem>
                    <SelectItem value="fishing">Pesca</SelectItem>
                    <SelectItem value="tourism">Turismo Náutico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_size">Tamanho da Empresa</Label>
                <Select value={formData.company_size} onValueChange={(value) => updateFormData("company_size", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                    <SelectItem value="1000+">1000+ funcionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {tenantPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-colors ${
                      formData.plan_id === plan.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("plan_id", plan.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            {plan.is_popular && <Badge variant="secondary">Popular</Badge>}
                          </div>
                          <p className="text-muted-foreground">{plan.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>👥 {plan.max_users} usuários</span>
                            <span>🚢 {plan.max_vessels} embarcações</span>
                            <span>💾 {plan.max_storage_gb}GB storage</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            R$ {plan.price_monthly.toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">/mês</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda Principal *</Label>
                <Select value={formData.primary_currency} onValueChange={(value) => updateFormData("primary_currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário *</Label>
                <Select value={formData.timezone} onValueChange={(value) => updateFormData("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Idioma *</Label>
                <Select value={formData.language} onValueChange={(value) => updateFormData("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Nome do Administrador *</Label>
                <Input
                  id="admin_name"
                  value={formData.admin_name}
                  onChange={(e) => updateFormData("admin_name", e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin_email">Email do Administrador *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => updateFormData("admin_email", e.target.value)}
                  placeholder="admin@empresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin_phone">Telefone do Administrador</Label>
                <Input
                  id="admin_phone"
                  value={formData.admin_phone}
                  onChange={(e) => updateFormData("admin_phone", e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
            >
              Voltar
            </Button>
            
            <div className="space-x-2">
              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Criando..." : "Finalizar Configuração"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};